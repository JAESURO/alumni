package com.yieldforecast.repository;

import com.yieldforecast.entity.YieldRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface YieldRecordRepository extends JpaRepository<YieldRecord, Long> {
}
