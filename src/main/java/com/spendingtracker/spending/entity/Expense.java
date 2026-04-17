package com.spendingtracker.spending.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "expenses")
public class Expense {

    @Id
    private String id;

    private String title;
    private String category;
    private double amount;
    private String date;

    private String userEmail;
}