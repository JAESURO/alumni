package com.yieldforecast.service;

import com.yieldforecast.entity.YieldRecord;
import com.yieldforecast.repository.YieldRecordRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ForecastService {

    private static final Logger logger = LoggerFactory.getLogger(ForecastService.class);

    private final ConcurrentHashMap<String, String> resultCache = new ConcurrentHashMap<>();

    @Autowired
    private PythonExecutionService pythonExecutionService;

    @Autowired
    private YieldRecordRepository repository;

    public String checkAvailability(Map<String, Object> payload) throws Exception {
        Object geometryObj = payload.get("geometry");
        if (geometryObj == null) {
            throw new IllegalArgumentException("No geometry provided");
        }

        String geometryJson = getGeometryJson(geometryObj);
        String startDate = payload.getOrDefault("startDate", "2024-01-01").toString();
        String endDate = payload.getOrDefault("endDate", "2024-12-31").toString();

        List<String> args = new ArrayList<>();
        args.add(geometryJson);
        args.add(startDate);
        args.add(endDate);

        String output = pythonExecutionService.executeScript("src/main/python/check_data_availability.py", args);

        int jsonStart = output.indexOf("{");
        if (jsonStart == -1) {
            throw new RuntimeException("No JSON returned from availability check");
        }
        return output.substring(jsonStart);
    }

    public void processForecast(Map<String, Object> payload, Long userId) {
        try {
            logger.info("Processing forecast payload for user {}", userId);

            String location = payload.getOrDefault("location", "Custom Zone").toString();
            String date = payload.getOrDefault("date", LocalDate.now().toString()).toString();
            String parameter = payload.getOrDefault("parameter", "NDVI").toString();
            String startDate = payload.getOrDefault("startDate", null) != null ? payload.get("startDate").toString()
                    : null;
            String endDate = payload.getOrDefault("endDate", null) != null ? payload.get("endDate").toString() : null;

            Object geometryObj = payload.get("geometry");
            if (geometryObj == null) {
                logger.error("Geometry is null!");
                return;
            }

            String geometryJson = getGeometryJson(geometryObj);
            String cacheKey = parameter + "_" + Integer.toString(geometryJson.hashCode());

            if (resultCache.containsKey(cacheKey)) {
                logger.info("Using cached result for key {}", cacheKey);
                processCachedResult(resultCache.get(cacheKey), geometryJson, location, date, parameter, payload, userId,
                        startDate, endDate);
                return;
            }

            LocalDate targetDate = LocalDate.parse(date);
            if (startDate == null)
                startDate = targetDate.getYear() + "-01-01";
            if (endDate == null)
                endDate = targetDate.getYear() + "-12-31";

            List<String> args = new ArrayList<>();
            args.add(geometryJson);
            args.add(parameter);
            args.add(startDate);
            args.add(endDate);

            String output = pythonExecutionService.executeScript("src/main/python/yield_forecast.py", args);

            int jsonStart = output.indexOf("{");
            if (jsonStart == -1) {
                logger.warn("No JSON found in python output");
                return;
            }

            String jsonString = output.substring(jsonStart);
            resultCache.put(cacheKey, jsonString);

            saveRecord(jsonString, geometryJson, location, date, parameter, payload, userId, startDate, endDate);

        } catch (Exception e) {
            logger.error("Error in processForecast", e);
            logger.error("Exception details: {}", e.getMessage());
            logger.error("Stack trace:", e);
        }
    }

    private String getGeometryJson(Object geometryObj) {
        if (geometryObj instanceof String) {
            return (String) geometryObj;
        } else if (geometryObj instanceof Map) {
            return new JSONObject((Map<?, ?>) geometryObj).toString();
        } else {
            return new JSONObject(geometryObj).toString();
        }
    }

    private void processCachedResult(String jsonString, String geometryJson, String location, String date,
            String parameter, Map<String, Object> payload, Long userId, String startDate, String endDate) {
        saveRecord(jsonString, geometryJson, location, date, parameter, payload, userId, startDate, endDate);
    }

    private void saveRecord(String jsonString, String geometryJson, String location, String date, String parameter,
            Map<String, Object> payload, Long userId, String startDate, String endDate) {
        JSONObject geeData = new JSONObject(jsonString);
        if (geeData.has("error")) {
            logger.warn("GEE returned error: {}", geeData.toString());
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
        record.setDate(LocalDate.parse(date));
        record.setIndexValue(indexValue);
        record.setYieldPrediction(predictedYield);
        record.setPrediction(predictedYield);
        record.setLatitude(latitude);
        record.setLongitude(longitude);
        record.setGeometryJson(geometryJson);
        record.setParameter(parameter);
        record.setUserId(userId);
        record.setStartDate(startDate != null ? LocalDate.parse(startDate) : null);
        record.setEndDate(endDate != null ? LocalDate.parse(endDate) : null);

        repository.save(record);
        logger.info("Record saved successfully");
    }
}