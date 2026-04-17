package com.spendingtracker.spending.repository;

import com.spendingtracker.spending.entity.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpRepository extends MongoRepository<Otp, String> {
    Optional<Otp> findByEmail(String email);
}
