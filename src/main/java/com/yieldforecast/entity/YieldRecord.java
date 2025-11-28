package com.yieldforecast.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "yield_records")
public class YieldRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String location;
    private LocalDate date;
    private Double prediction;

    public YieldRecord() {
    }

    public YieldRecord(String location, LocalDate date, Double prediction) {
        this.location = location;
        this.date = date;
        this.prediction = prediction;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getPrediction() {
        return prediction;
    }

    public void setPrediction(Double prediction) {
        this.prediction = prediction;
    }
}
