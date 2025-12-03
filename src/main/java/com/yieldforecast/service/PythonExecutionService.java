package com.yieldforecast.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class PythonExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(PythonExecutionService.class);

    @Value("${python.executable}")
    private String pythonExecutable;

    public String executeScript(String scriptPath, List<String> args) throws Exception {
        io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                .directory(".")
                .ignoreIfMissing()
                .load();

        List<String> command = new ArrayList<>();
        command.add(pythonExecutable);
        command.add(scriptPath);
        command.addAll(args);

        ProcessBuilder pb = new ProcessBuilder(command);

        String geeProjectId = dotenv.get("GEE_PROJECT_ID");
        if (geeProjectId != null && !geeProjectId.isEmpty()) {
            pb.environment().put("GEE_PROJECT_ID", geeProjectId);
        } else {
            String envGeeProjectId = System.getenv("GEE_PROJECT_ID");
            if (envGeeProjectId != null && !envGeeProjectId.isEmpty()) {
                pb.environment().put("GEE_PROJECT_ID", envGeeProjectId);
            }
        }

        logger.info("Starting python script: {} {}", pythonExecutable, scriptPath);
        logger.debug("ProcessBuilder command: {}", pb.command());

        Process process = pb.start();

        BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        BufferedReader stderrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

        StringBuilder output = new StringBuilder();
        StringBuilder errorOutput = new StringBuilder();

        AtomicBoolean stdoutFinished = new AtomicBoolean(false);
        AtomicBoolean stderrFinished = new AtomicBoolean(false);

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
        stderrThread.start();

        boolean finished = process.waitFor(300, TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            stdoutThread.interrupt();
            stderrThread.interrupt();
            throw new RuntimeException("Python script timed out");
        }

        stdoutThread.join(5000);
        stderrThread.join(5000);

        int exitCode = process.exitValue();
        logPythonExecution(pb.command(), pb.environment(), exitCode, output.toString(), errorOutput.toString());

        if (exitCode != 0) {
            logger.error("Python exited with code {}. stderr:\n{}", exitCode, errorOutput.toString());
            throw new RuntimeException("Python script failed with code " + exitCode + ": " + errorOutput.toString());
        }

        return output.toString();
    }

    private void logPythonExecution(List<String> command, Map<String, String> env, int exitCode,
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