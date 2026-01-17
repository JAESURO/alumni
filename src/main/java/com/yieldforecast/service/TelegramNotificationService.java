package com.yieldforecast.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.json.JSONObject;
import jakarta.annotation.PostConstruct;

@Service
public class TelegramNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramNotificationService.class);

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Autowired
    private RestTemplate restTemplate;

    private static final String TELEGRAM_API_URL = "https://api.telegram.org/bot";

    public TelegramNotificationService() {
        logger.info("TelegramNotificationService initialized");
    }

    @PostConstruct
    public void init() {
        String tokenCheck = botToken != null && !botToken.isEmpty() ? "PRESENT" : "MISSING/EMPTY";
        logger.info("=== TelegramNotificationService Bot Token: {} ===", tokenCheck);
        if (botToken != null && !botToken.isEmpty()) {
            logger.info("Bot token loaded successfully, first 20 chars: {}",
                    botToken.substring(0, Math.min(20, botToken.length())));
        }
    }

    public boolean sendNotification(String chatId, String message) {
        if (!isConfigured()) {
            logger.warn("Telegram bot not configured - token is empty or null");
            return false;
        }

        try {
            logger.info("Sending Telegram notification to chat ID: {}", chatId);
            String url = TELEGRAM_API_URL + botToken + "/sendMessage";

            JSONObject requestBody = new JSONObject();
            requestBody.put("chat_id", chatId);
            requestBody.put("text", message);
            requestBody.put("parse_mode", "HTML");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            logger.info("Telegram API response status: {}", response.getStatusCode());
            logger.debug("Telegram API response body: {}", response.getBody());

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Telegram notification sent successfully to chat ID: {}", chatId);
                return true;
            } else {
                logger.error("Telegram API returned non-success status: {}", response.getStatusCode());
                logger.error("Response body: {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            logger.error("Failed to send Telegram notification: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean sendForecastCompletionNotification(String chatId, String forecastName, String yield) {
        String message = String.format(
                "<b>🌾 Forecast Complete!</b>\n" +
                        "<b>Zone:</b> %s\n" +
                        "<b>Predicted Yield:</b> %s\n" +
                        "Check your dashboard for more details.",
                forecastName, yield);
        return sendNotification(chatId, message);
    }

    public boolean sendForecastErrorNotification(String chatId, String forecastName, String errorMessage) {
        String message = String.format(
                "<b>❌ Forecast Failed</b>\n" +
                        "<b>Zone:</b> %s\n" +
                        "<b>Error:</b> %s",
                forecastName, errorMessage);
        return sendNotification(chatId, message);
    }

    public boolean sendDataAvailabilityNotification(String chatId, String status) {
        String message = String.format(
                "<b>📊 Data Availability Check</b>\n" +
                        "%s\n" +
                        "More details available on your dashboard.",
                status);
        return sendNotification(chatId, message);
    }

    public boolean testConnection() {
        if (!isConfigured()) {
            return false;
        }

        try {
            String url = TELEGRAM_API_URL + botToken + "/getMe";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            logger.error("Telegram connection test failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean isConfigured() {
        boolean configured = botToken != null && !botToken.isEmpty() && !botToken.equals("");
        if (!configured) {
            logger.warn("Telegram bot token is not configured. Token value: '{}'", botToken);
        }
        return configured;
    }

    public String getBotToken() {
        return botToken;
    }
}