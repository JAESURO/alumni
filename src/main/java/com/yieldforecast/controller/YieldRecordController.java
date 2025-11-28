package com.yieldforecast.controller;

import com.yieldforecast.entity.YieldRecord;
import com.yieldforecast.repository.YieldRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/yields")
public class YieldRecordController {

    @Autowired
    private YieldRecordRepository repository;

    @GetMapping
    public List<YieldRecord> getAllYields() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<YieldRecord> getYieldById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public YieldRecord createYield(@RequestBody YieldRecord yieldRecord) {
        return repository.save(yieldRecord);
    }

    @PutMapping("/{id}")
    public ResponseEntity<YieldRecord> updateYield(@PathVariable Long id, @RequestBody YieldRecord yieldDetails) {
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
