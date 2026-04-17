package com.spendingtracker.spending.repository;

import com.spendingtracker.spending.entity.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityRepository extends MongoRepository<Activity, String> {

    List<Activity> findTop10ByUserIdOrderByTimestampDesc(String userId);
}