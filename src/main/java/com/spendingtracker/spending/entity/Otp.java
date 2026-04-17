package com.spendingtracker.spending.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "otp")
public class Otp {

    @Id
    private String id;

    private String email;
    private String otp;
    private long expiryTime;

}