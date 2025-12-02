package com.yieldforecast.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

        @Value("${python.executable}")
        private String pythonExecutable;

        @GetMapping("/gee")
        public ResponseEntity<Map<String, Object>> checkGeeConnection() {
                Map<String, Object> response = new HashMap<>();

                try {
                        io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                                        .directory(".")
                                        .ignoreIfMissing()
                                        .load();

                        String geeProjectId = dotenv.get("GEE_PROJECT_ID");
                        String envGeeProjectId = System.getenv("GEE_PROJECT_ID");

                        response.put("pythonExecutable", pythonExecutable);
                        response.put("geeProjectIdFromEnvFile",
                                        geeProjectId != null && !geeProjectId.isEmpty()
                                                        ? (geeProjectId.length() > 15
                                                                        ? geeProjectId.substring(0, 15) + "..."
                                                                        : geeProjectId)
                                                        : "NOT SET");
                        response.put("geeProjectIdFromEnvironment",
                                        envGeeProjectId != null && !envGeeProjectId.isEmpty()
                                                        ? (envGeeProjectId.length() > 15
                                                                        ? envGeeProjectId.substring(0, 15) + "..."
                                                                        : envGeeProjectId)
                                                        : "NOT SET");
                        response.put("geeProjectIdConfigured",
                                        (geeProjectId != null && !geeProjectId.isEmpty()) ||
                                                        (envGeeProjectId != null && !envGeeProjectId.isEmpty()));

                        String pythonVenvPath = dotenv.get("PYTHON_VENV_PATH");
                        response.put("pythonVenvPath",
                                        pythonVenvPath != null && !pythonVenvPath.isEmpty() ? pythonVenvPath
                                                        : "NOT SET");

                        response.put("envFileLocation", System.getProperty("user.dir") + "/.env");

                        return ResponseEntity.ok(response);
                } catch (Exception e) {
                        response.put("error", e.getMessage());
                        return ResponseEntity.status(500).body(response);
                }
        }
}