package com.spendingtracker.spending.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}