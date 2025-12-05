package com.yieldforecast.service;

import com.yieldforecast.entity.YieldRecord;
import com.yieldforecast.repository.YieldRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthorizationService {

    @Autowired
    private YieldRecordRepository yieldRecordRepository;

    public void verifyRecordOwnership(Long recordId, Long userId) {
        Optional<YieldRecord> recordOpt = yieldRecordRepository.findById(recordId);

        if (recordOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        }

        YieldRecord record = recordOpt.get();
        if (record.getUserId() == null || !record.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to access this record");
        }
    }

    public void requireAuthentication(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
    }

    public YieldRecord getOwnedRecord(Long recordId, Long userId) {
        verifyRecordOwnership(recordId, userId);
        return yieldRecordRepository.findById(recordId).orElseThrow();
    }
}
