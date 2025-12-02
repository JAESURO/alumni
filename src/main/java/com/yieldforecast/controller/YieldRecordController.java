package com.yieldforecast.controller;

import com.yieldforecast.entity.YieldRecord;
import com.yieldforecast.repository.YieldRecordRepository;
import com.yieldforecast.service.GeometryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/yields")
public class YieldRecordController {

    private static final Logger logger = LoggerFactory.getLogger(YieldRecordController.class);

    @Autowired
    private YieldRecordRepository repository;

    @Autowired
    private GeometryService geometryService;

    @GetMapping
    public List<YieldRecord> getAllYields() {
        logger.info("=== GET /api/yields REQUEST RECEIVED ===");
        List<YieldRecord> records = repository.findAll();
        logger.info("Found {} yield records", records.size());
        for (YieldRecord record : records) {
            logger.info("  - ID: {}, Location: {}, Parameter: {}", record.getId(), record.getLocation(),
                    record.getParameter());
        }
        return records;
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
    public ResponseEntity<Void> deleteYield(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}