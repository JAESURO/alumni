package com.yieldforecast.controller;

import com.yieldforecast.entity.User;
import com.yieldforecast.service.TelegramNotificationService;
import com.yieldforecast.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/telegram")
public class TelegramController {

    private static final Logger logger = LoggerFactory.getLogger(TelegramController.class);

    @Autowired
    private TelegramNotificationService telegramService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/enable")
    public ResponseEntity<Map<String, Object>> enableTelegramNotifications(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }

            User user = userOpt.get();
            String chatId = request.get("chatId");

            if (chatId == null || chatId.isEmpty()) {
                response.put("success", false);
                response.put("message", "Chat ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            user.setTelegramChatId(chatId);
            user.setTelegramNotificationsEnabled(true);
            userRepository.save(user);

            boolean testResult = telegramService.sendNotification(chatId,
                    "✅ <b>Telegram notifications enabled!</b>\n\nYou will now receive alerts about your forecast results.");

            response.put("success", testResult);
            response.put("message", testResult ? "Telegram notifications enabled" : "Failed to send test notification");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error enabling Telegram notifications: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/disable")
    public ResponseEntity<Map<String, Object>> disableTelegramNotifications(
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }

            User user = userOpt.get();
            user.setTelegramNotificationsEnabled(false);
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Telegram notifications disabled");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error disabling Telegram notifications: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getTelegramSettings(
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }

            User user = userOpt.get();
            response.put("enabled",
                    user.getTelegramNotificationsEnabled() != null && user.getTelegramNotificationsEnabled());
            response.put("chatId",
                    user.getTelegramChatId() != null
                            ? "***" + user.getTelegramChatId().substring(user.getTelegramChatId().length() - 4)
                            : null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving Telegram settings: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testTelegramConnection(
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }

            User user = userOpt.get();

            if (user.getTelegramChatId() == null || user.getTelegramChatId().isEmpty()) {
                response.put("success", false);
                response.put("message", "No Telegram chat ID configured");
                return ResponseEntity.badRequest().body(response);
            }

            boolean success = telegramService.sendNotification(user.getTelegramChatId(),
                    "🔔 <b>Test notification from AgroTrack</b>\n\nIf you see this message, Telegram notifications are working correctly!");

            response.put("success", success);
            response.put("message", success ? "Test notification sent" : "Failed to send test notification");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error testing Telegram connection: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
