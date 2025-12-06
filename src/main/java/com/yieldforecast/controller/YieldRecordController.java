package com.yieldforecast.controller;

import com.yieldforecast.entity.YieldRecord;
import com.yieldforecast.repository.YieldRecordRepository;
import com.yieldforecast.service.AuthorizationService;
import com.yieldforecast.service.GeometryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/yields")
public class YieldRecordController {

    private static final Logger logger = LoggerFactory.getLogger(YieldRecordController.class);

    @Autowired
    private YieldRecordRepository repository;

    @Autowired
    private GeometryService geometryService;

    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping
    public ResponseEntity<?> getAllYields(jakarta.servlet.http.HttpSession session) {
        logger.info("=== GET /api/yields REQUEST RECEIVED ===");
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            logger.warn("No userId in session - unauthorized access attempt");
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        logger.info("userId in session: {} - returning user-specific records", userId);
        List<YieldRecord> records = repository.findByUserIdOrderByDateDesc(userId);

        logger.info("Found {} yield records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<YieldRecord> getYieldById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public YieldRecord createYield(@RequestBody YieldRecord yieldRecord) {
        logger.info("POST /api/yields - createYield called. Payload: {}",
                yieldRecord != null ? yieldRecord.toString() : "<null>");
        return repository.save(yieldRecord);
    }

    @PutMapping("/{id}")
    public ResponseEntity<YieldRecord> updateYield(@PathVariable Long id, @RequestBody YieldRecord yieldDetails) {
        logger.info("PUT /api/yields/{} - updateYield called. Payload: {}", id,
                yieldDetails != null ? yieldDetails.toString() : "<null>");
        return repository.findById(id)
                .map(record -> {
                    record.setLocation(yieldDetails.getLocation());
                    record.setDate(yieldDetails.getDate());
                    record.setPrediction(yieldDetails.getPrediction());
                    return ResponseEntity.ok(repository.save(record));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteYield(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        try {
            Long userId = (Long) session.getAttribute("userId");

            authorizationService.requireAuthentication(userId);

            authorizationService.verifyRecordOwnership(id, userId);

            repository.deleteById(id);
            logger.info("Record {} deleted by user {}", id, userId);

            return ResponseEntity.ok(Map.of("message", "Record deleted successfully"));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            logger.warn("Delete failed for record {}: {}", id, e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            logger.error("Unexpected error deleting record {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
}