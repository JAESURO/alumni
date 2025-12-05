package com.yieldforecast.repository;

import com.yieldforecast.entity.YieldRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YieldRecordRepository extends JpaRepository<YieldRecord, Long> {
    @Query("SELECT y FROM YieldRecord y WHERE y.user.id = :userId")
    List<YieldRecord> findByUserId(@Param("userId") Long userId);

    @Query("SELECT y FROM YieldRecord y WHERE y.user.id = :userId ORDER BY y.date DESC")
    List<YieldRecord> findByUserIdOrderByDateDesc(@Param("userId") Long userId);
}