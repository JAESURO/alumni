package com.yieldforecast.controller;

import com.yieldforecast.entity.YieldRecord;
import com.yieldforecast.repository.YieldRecordRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    @Value("${python.executable}")
    private String pythonExecutable;

    private static final Logger logger = LoggerFactory.getLogger(ForecastController.class);

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private volatile String statusMessage = "idle";
    private final ConcurrentHashMap<String, String> resultCache = new ConcurrentHashMap<>();

    @Autowired
    private YieldRecordRepository repository;

    @PostMapping("/run")
    public ResponseEntity<String> runForecast(@RequestBody Map<String, Object> payload) {
        logger.info("Received /run request. isRunning={}", isRunning.get());
        logger.debug("Payload preview: {}", payload != null ? payload.toString() : "<null>");

        if (isRunning.get()) {
            logger.warn("Rejected /run request because another forecast is running");
            return ResponseEntity.status(429).body("Another forecast is already running");
        }

        isRunning.set(true);
        statusMessage = "queued";

        CompletableFuture.runAsync(() -> {
            logger.info("Forecast background task started");
            try {
                statusMessage = "running: preparing";
                executePythonScript(payload);
                statusMessage = "completed";
                logger.info("Forecast background task completed successfully");
            } catch (Exception e) {
                logger.error("Forecast execution failed in background task", e);
                statusMessage = "failed: " + e.getMessage();
            } finally {
                isRunning.set(false);
                logger.info("isRunning flag reset to false");
            }
        });

        logger.info("Forecast process enqueued");
        return ResponseEntity.ok("Forecast process started");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean running = isRunning.get();
        logger.debug("GET /status called. running={}, message={}", running, statusMessage);
        return ResponseEntity.ok(Map.of(
                "running", running,
                "message", statusMessage));
    }

    @PostMapping("/check-availability")
    public ResponseEntity<String> checkDataAvailability(@RequestBody Map<String, Object> payload) {
        try {
            io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                    .directory(".")
                    .ignoreIfMissing()
                    .load();

            Object geometryObj = payload.get("geometry");
            if (geometryObj == null) {
                return ResponseEntity.badRequest().body("{\"error\":\"No geometry provided\"}");
            }

            String geometryJson;
            if (geometryObj instanceof String) {
                geometryJson = (String) geometryObj;
            } else if (geometryObj instanceof Map) {
                geometryJson = new JSONObject((Map<?, ?>) geometryObj).toString();
            } else {
                geometryJson = new JSONObject(geometryObj).toString();
            }

            String startDate = payload.getOrDefault("startDate", "2024-01-01").toString();
            String endDate = payload.getOrDefault("endDate", "2024-12-31").toString();

            ProcessBuilder pb = new ProcessBuilder(
                    pythonExecutable,
                    "src/main/python/check_data_availability.py",
                    geometryJson,
                    startDate,
                    endDate);

            String geeProjectId = dotenv.get("GEE_PROJECT_ID");
            if (geeProjectId != null && !geeProjectId.isEmpty()) {
                pb.environment().put("GEE_PROJECT_ID", geeProjectId);
            } else {
                String envGeeProjectId = System.getenv("GEE_PROJECT_ID");
                if (envGeeProjectId != null && !envGeeProjectId.isEmpty()) {
                    pb.environment().put("GEE_PROJECT_ID", envGeeProjectId);
                }
            }
            logger.info("Starting availability python script: {} {}", pythonExecutable,
                    "src/main/python/check_data_availability.py");
            logger.debug("Availability ProcessBuilder command: {}", pb.command());
            logger.debug("Availability GEE_PROJECT_ID={}", pb.environment().get("GEE_PROJECT_ID"));
            Process process = pb.start();

            BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stderrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            StringBuilder output = new StringBuilder();
            StringBuilder errorOutput = new StringBuilder();

            String line;
            while ((line = stdoutReader.readLine()) != null) {
                output.append(line);
            }
            while ((line = stderrReader.readLine()) != null) {
                errorOutput.append(line).append("\n");
            }

            boolean finished = process.waitFor(60, java.util.concurrent.TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return ResponseEntity.status(500).body(
                        "{\"error\":\"Request timed out (GEE may be slow; try again or skip availability check)\"}");
            }

            int exitCode = process.exitValue();

            logPythonExecution(pb.command(), pb.environment(), exitCode, output.toString(), errorOutput.toString());

            if (exitCode != 0) {
                logger.error("checkDataAvailability python exited with code {}. stderr:\n{}", exitCode,
                        errorOutput.toString());
                logger.debug("checkDataAvailability python stdout:\n{}", output.toString());
                return ResponseEntity.status(500).body("{\"error\":\"Failed to check availability\"}");
            }

            String outputString = output.toString();
            int jsonStart = outputString.indexOf("{");
            if (jsonStart == -1) {
                return ResponseEntity.status(500).body("{\"error\":\"No data returned\"}");
            }

            String jsonString = outputString.substring(jsonStart);
            logger.info("Availability check completed successfully");
            return ResponseEntity.ok(jsonString);

        } catch (Exception e) {
            logger.error("Exception in checkDataAvailability", e);
            return ResponseEntity.status(500).body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private void executePythonScript(Map<String, Object> payload) {
        try {
            logger.info("=== FORECAST REQUEST RECEIVED ===");
            logger.info("Payload: {}", new JSONObject(payload).toString());

            io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                    .directory(".")
                    .ignoreIfMissing()
                    .load();

            String location = payload.getOrDefault("location", "Custom Zone").toString();
            String date = payload.getOrDefault("date", LocalDate.now().toString()).toString();
            String parameter = payload.getOrDefault("parameter", "NDVI").toString();
            String startDate = payload.getOrDefault("startDate", null) != null ? payload.get("startDate").toString()
                    : null;
            String endDate = payload.getOrDefault("endDate", null) != null ? payload.get("endDate").toString() : null;

            logger.info("Location: {}, Parameter: {}, StartDate: {}, EndDate: {}", location, parameter, startDate,
                    endDate);

            Object geometryObj = payload.get("geometry");
            if (geometryObj == null) {
                logger.error("Geometry is null!");
                return;
            }
            logger.info("Geometry type: {}, Geometry: {}", geometryObj.getClass().getSimpleName(),
                    geometryObj.toString());

            String geometryJson;
            if (geometryObj instanceof String) {
                geometryJson = (String) geometryObj;
            } else if (geometryObj instanceof Map) {
                geometryJson = new JSONObject((Map<?, ?>) geometryObj).toString();
            } else {
                geometryJson = new JSONObject(geometryObj).toString();
            }

            String cacheKey = parameter + "_" + Integer.toString(geometryJson.hashCode());
            if (resultCache.containsKey(cacheKey)) {
                logger.info("Using cached result for key {}", cacheKey);
                statusMessage = "completed (cached)";
                String cached = resultCache.get(cacheKey);
                JSONObject geeData = new JSONObject(cached);
                String outputString = cached;
                logger.info("Forecast python stdout (from cache): {}", outputString);
                int jsonStart = outputString.indexOf('{');
                if (jsonStart == -1) {
                    logger.warn("No JSON in cached result");
                    return;
                }
                String jsonString = outputString.substring(jsonStart);
                JSONObject cachedData = new JSONObject(jsonString);
                if (cachedData.has("error")) {
                    logger.warn("Cached GEE data contains error: {}", cachedData.toString());
                    return;
                }
                double indexValueCached = cachedData.optDouble(parameter, 0.0);
                double predictedYieldCached = 15.0 + (indexValueCached * 10);
                JSONObject geomObj = new JSONObject(geometryJson);
                double latitude = 0.0;
                double longitude = 0.0;
                if (geomObj.getString("type").equals("Point")) {
                    org.json.JSONArray coords = geomObj.getJSONArray("coordinates");
                    longitude = coords.getDouble(0);
                    latitude = coords.getDouble(1);
                } else if (geomObj.getString("type").equals("Polygon")) {
                    org.json.JSONArray coords = geomObj.getJSONArray("coordinates").getJSONArray(0).getJSONArray(0);
                    longitude = coords.getDouble(0);
                    latitude = coords.getDouble(1);
                }

                YieldRecord record = new YieldRecord();
                record.setLocation(location);
                record.setDate(LocalDate.parse(date));
                record.setIndexValue(indexValueCached);
                record.setYieldPrediction(predictedYieldCached);
                record.setPrediction(predictedYieldCached);
                record.setLatitude(latitude);
                record.setLongitude(longitude);
                record.setGeometryJson(geometryJson);
                record.setParameter(parameter);
                YieldRecord savedRecord = repository.save(record);
                logger.info("Record saved from cache with ID: {}", savedRecord.getId());
                return;
            }

            LocalDate targetDate = LocalDate.parse(date);
            if (startDate == null) {
                startDate = targetDate.getYear() + "-01-01";
            }
            if (endDate == null) {
                endDate = targetDate.getYear() + "-12-31";
            }

            ProcessBuilder pb = new ProcessBuilder(
                    pythonExecutable,
                    "src/main/python/yield_forecast.py",
                    geometryJson,
                    parameter,
                    startDate,
                    endDate);

            String geeProjectId = dotenv.get("GEE_PROJECT_ID");
            if (geeProjectId != null && !geeProjectId.isEmpty()) {
                pb.environment().put("GEE_PROJECT_ID", geeProjectId);
            } else {
                String envGeeProjectId = System.getenv("GEE_PROJECT_ID");
                if (envGeeProjectId != null && !envGeeProjectId.isEmpty()) {
                    pb.environment().put("GEE_PROJECT_ID", envGeeProjectId);
                }
            }
            logger.info("Starting forecast python script: {} {}", pythonExecutable,
                    "src/main/python/yield_forecast.py");
            logger.debug("ProcessBuilder command: {}", pb.command());
            logger.debug("Process environment GEE_PROJECT_ID={}", pb.environment().get("GEE_PROJECT_ID"));
            Process process = pb.start();

            BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stderrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            StringBuilder output = new StringBuilder();
            StringBuilder errorOutput = new StringBuilder();

            final java.util.concurrent.atomic.AtomicBoolean stdoutFinished = new java.util.concurrent.atomic.AtomicBoolean(
                    false);
            final java.util.concurrent.atomic.AtomicBoolean stderrFinished = new java.util.concurrent.atomic.AtomicBoolean(
                    false);

            Thread stdoutThread = new Thread(() -> {
                try {
                    String line;
                    while ((line = stdoutReader.readLine()) != null) {
                        output.append(line);
                    }
                    stdoutFinished.set(true);
                } catch (Exception e) {
                    logger.error("Error reading python stdout", e);
                }
            });
            stdoutThread.setName("PythonStdoutReader");
            logger.debug("Starting Python stdout reader thread");
            stdoutThread.start();

            Thread stderrThread = new Thread(() -> {
                try {
                    String line;
                    while ((line = stderrReader.readLine()) != null) {
                        errorOutput.append(line).append("\n");
                    }
                    stderrFinished.set(true);
                } catch (Exception e) {
                    logger.error("Error reading python stderr", e);
                }
            });
            stderrThread.setName("PythonStderrReader");
            logger.debug("Starting Python stderr reader thread");
            stderrThread.start();

            boolean finished = process.waitFor(120, java.util.concurrent.TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                stdoutThread.interrupt();
                stderrThread.interrupt();
                logger.warn("Forecast python script timed out and was killed");
                return;
            }

            stdoutThread.join(5000);
            stderrThread.join(5000);

            logger.debug("Stdout finished flag: {}. Stderr finished flag: {}", stdoutFinished.get(),
                    stderrFinished.get());
            logger.debug("Stdout length: {} bytes. Stderr length: {} bytes", output.length(), errorOutput.length());

            int exitCode = process.exitValue();
            logPythonExecution(pb.command(), pb.environment(), exitCode, output.toString(), errorOutput.toString());

            if (exitCode != 0) {
                logger.error("Forecast python exited with code {}. stderr:\n{}", exitCode, errorOutput.toString());
                logger.debug("Forecast python stdout:\n{}", output.toString());
                return;
            }

            String outputString = output.toString();
            logger.info("Forecast python stdout: {}", outputString);
            logger.debug("Forecast python stderr: {}", errorOutput.toString());

            int jsonStart = outputString.indexOf("{");
            if (jsonStart == -1) {
                logger.warn("No JSON found in python output");
                return;
            }

            String jsonString = outputString.substring(jsonStart);

            JSONObject geeData = new JSONObject(jsonString);

            if (geeData.has("error")) {
                logger.warn("GEE script returned error JSON: {}", geeData.toString());
                return;
            }

            double indexValue = geeData.optDouble(parameter, 0.0);
            double predictedYield = 15.0 + (indexValue * 10);

            JSONObject geomObj = new JSONObject(geometryJson);
            double latitude = 0.0;
            double longitude = 0.0;

            if (geomObj.getString("type").equals("Point")) {
                org.json.JSONArray coords = geomObj.getJSONArray("coordinates");
                longitude = coords.getDouble(0);
                latitude = coords.getDouble(1);
            } else if (geomObj.getString("type").equals("Polygon")) {
                org.json.JSONArray coords = geomObj.getJSONArray("coordinates").getJSONArray(0).getJSONArray(0);
                longitude = coords.getDouble(0);
                latitude = coords.getDouble(1);
            }

            YieldRecord record;

            if (payload.containsKey("id") && payload.get("id") != null) {
                try {
                    Long id = Long.valueOf(payload.get("id").toString());
                    record = repository.findById(id).orElse(new YieldRecord());
                } catch (NumberFormatException e) {
                    record = new YieldRecord();
                }
            } else {
                record = new YieldRecord();
            }
            record.setLocation(location);
            record.setDate(targetDate);
            record.setIndexValue(indexValue);
            record.setYieldPrediction(predictedYield);
            record.setPrediction(predictedYield);
            record.setLatitude(latitude);
            record.setLongitude(longitude);
            record.setGeometryJson(geometryJson);
            record.setParameter(parameter);

            logger.info("Saving record: Location={}, Latitude={}, Longitude={}, IndexValue={}, YieldPrediction={}",
                    location, latitude, longitude, indexValue, predictedYield);
            YieldRecord savedRecord = repository.save(record);
            logger.info("Record saved successfully with ID: {}", savedRecord.getId());

        } catch (Exception e) {
            logger.error("Error in executePythonScript", e);
            e.printStackTrace();
            throw new RuntimeException("Forecast execution failed: " + e.getMessage(), e);
        }
    }

    private void logPythonExecution(java.util.List<String> command, Map<String, String> env, int exitCode,
            String stdout, String stderr) {
        try {
            StringBuilder rawLog = new StringBuilder();
            rawLog.append("=== PYTHON INVOCATION ===\n");
            rawLog.append("timestamp: ").append(Instant.now().toString()).append('\n');
            rawLog.append("command: ").append(String.join(" ", command)).append('\n');
            rawLog.append("env.GEE_PROJECT_ID: ").append(env.get("GEE_PROJECT_ID")).append('\n');
            rawLog.append("exitCode: ").append(exitCode).append('\n');
            rawLog.append("--- STDOUT ---\n");
            rawLog.append(stdout).append('\n');
            rawLog.append("--- STDERR ---\n");
            rawLog.append(stderr).append('\n');
            rawLog.append("========================\n\n");

            Path p = Path.of("/tmp/backend_python_raw.log");
            byte[] bytes = rawLog.toString().getBytes(StandardCharsets.UTF_8);
            Files.write(p, bytes, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) {
            logger.warn("Failed to persist raw python output to /tmp/backend_python_raw.log", e);
        }
    }
}