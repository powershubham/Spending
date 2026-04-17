package com.spendingtracker.spending.controller;

import com.spendingtracker.spending.dto.ExpenseRequest;
import com.spendingtracker.spending.entity.Activity;
import com.spendingtracker.spending.entity.Expense;
import com.spendingtracker.spending.service.ActivityService;
import com.spendingtracker.spending.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
//@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private ActivityService activityService;

    @GetMapping("/recent")
    public List<Activity> getRecentActivity() {

        String userEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return activityService.getRecentActivities(userEmail);
    }

    @PostMapping
    public Expense addExpense(@RequestBody ExpenseRequest request){

        return expenseService.addExpense(request);
    }

    @GetMapping
    public List<Expense> getExpenses(){

        return expenseService.getUserExpenses();
    }

    @GetMapping("/{id}")
    public Expense getExpenseById(@PathVariable String id) {
        return expenseService.getExpenseById(id);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable String id,
                                 @RequestBody Expense expense){

        return expenseService.updateExpense(id, expense);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable String id){

        expenseService.deleteExpense(id);
    }

    @GetMapping("/category/{category}")
    public List<Expense> getByCategory(@PathVariable String category){

        return expenseService.getExpensesByCategory(category);
    }

    @GetMapping("/monthly-total")
    public double getMonthlyTotal(){

        return expenseService.getMonthlyTotal();
    }

    @GetMapping("/highest")
    public Expense getHighestExpense() {
        return expenseService.getHighestExpense();
    }
}