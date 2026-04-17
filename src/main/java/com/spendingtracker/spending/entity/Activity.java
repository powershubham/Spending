package com.spendingtracker.spending.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "activities")
@Data
public class Activity {

    @Id
    private String id;

    private String userId;
    private String action; // ADD, UPDATE, DELETE
    private String title;
    private double amount;
    private LocalDateTime timestamp;
}