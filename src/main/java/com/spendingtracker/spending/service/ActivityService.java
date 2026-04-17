package com.spendingtracker.spending.service;

import com.spendingtracker.spending.entity.Activity;
import com.spendingtracker.spending.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    public void saveActivity(String userId, String action, String title, double amount) {

        Activity activity = new Activity();
        activity.setUserId(userId);
        activity.setAction(action);
        activity.setTitle(title);
        activity.setAmount(amount);
        activity.setTimestamp(LocalDateTime.now());

        activityRepository.save(activity);
    }

    public List<Activity> getRecentActivities(String userId) {
        return activityRepository.findTop10ByUserIdOrderByTimestampDesc(userId);
    }
}
