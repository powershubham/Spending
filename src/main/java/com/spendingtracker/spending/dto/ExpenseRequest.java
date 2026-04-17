package com.spendingtracker.spending.dto;

import lombok.Data;

@Data
public class ExpenseRequest {

    private String title;
    private String category;
    private double amount;
    private String date;

}