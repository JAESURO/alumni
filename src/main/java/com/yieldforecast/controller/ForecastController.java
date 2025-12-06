package com.yieldforecast.controller;

import com.yieldforecast.service.ForecastService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private static final Logger logger = LoggerFactory.getLogger(ForecastController.class);

    @Autowired
    private ForecastService forecastService;

    @PostMapping("/run")
    public ResponseEntity<String> runForecast(@RequestBody Map<String, Object> payload, HttpSession session) {
        logger.info("Received /run request.");

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            logger.warn("Unauthorized forecast attempt");
            return ResponseEntity.status(401).body("Unauthorized");
        }
        CompletableFuture.runAsync(() -> {
            try {
                forecastService.processForecast(payload, userId);
            } catch (Exception e) {
                logger.error("Forecast execution failed in background task", e);
            }
        });

        return ResponseEntity.ok("Forecast process started");
    }

    @PostMapping("/check-availability")
    public ResponseEntity<String> checkDataAvailability(@RequestBody Map<String, Object> payload) {
        try {
            String result = forecastService.checkAvailability(payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Exception in checkDataAvailability", e);
            return ResponseEntity.status(500).body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/visualization")
    public ResponseEntity<String> getVisualization(@RequestBody Map<String, Object> payload) {
        try {
            String result = forecastService.getVisualization(payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Exception in getVisualization", e);
            return ResponseEntity.status(500).body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}