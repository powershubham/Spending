package com.spendingtracker.spending.repository;

import com.spendingtracker.spending.entity.Activity;
import com.spendingtracker.spending.entity.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends MongoRepository<Expense, String> {

    List<Expense> findByUserEmail(String userEmail);
    List<Expense> findByUserEmailAndCategory(String userEmail, String category);
}