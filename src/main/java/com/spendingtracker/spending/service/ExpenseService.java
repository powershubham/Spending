package com.spendingtracker.spending.service;

import com.spendingtracker.spending.dto.ExpenseRequest;
import com.spendingtracker.spending.entity.Expense;
import com.spendingtracker.spending.entity.User;
import com.spendingtracker.spending.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ActivityService activityService;

    public Expense addExpense(ExpenseRequest request){

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Expense expense = new Expense();

        expense.setTitle(request.getTitle());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setUserEmail(email);
        Expense savedExpense = expenseRepository.save(expense);

        activityService.saveActivity(
                email,
                "ADD",
                savedExpense.getTitle(),
                savedExpense.getAmount()
        );

        return savedExpense;
    }

    public List<Expense> getUserExpenses(){

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return expenseRepository.findByUserEmail(email);
    }

    public Expense getExpenseById(String id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public Expense updateExpense(String id, Expense updatedExpense){

        Expense expense = expenseRepository.findById(id)
                .orElseThrow();

        expense.setTitle(updatedExpense.getTitle());
        expense.setCategory(updatedExpense.getCategory());
        expense.setAmount(updatedExpense.getAmount());
        expense.setDate(updatedExpense.getDate());
        Expense savedExpense = expenseRepository.save(expense);

        activityService.saveActivity(
                expense.getUserEmail(),
                "UPDATE",
                savedExpense.getTitle(),
                savedExpense.getAmount()
        );

        return savedExpense;
    }

    public void deleteExpense(String id){

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseRepository.deleteById(id);

        activityService.saveActivity(
                expense.getUserEmail(),
                "DELETE",
                expense.getTitle(),
                expense.getAmount()
        );
    }

    public List<Expense> getExpensesByCategory(String category){

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return expenseRepository.findByUserEmailAndCategory(email, category);
    }

    public double getMonthlyTotal(){

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        List<Expense> expenses = expenseRepository.findByUserEmail(email);

        return expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    public Expense getHighestExpense() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        List<Expense> expenses = expenseRepository.findByUserEmail(email);

        return expenses.stream()
                .max(Comparator.comparingDouble(Expense::getAmount))
                .orElse(null);
    }
}