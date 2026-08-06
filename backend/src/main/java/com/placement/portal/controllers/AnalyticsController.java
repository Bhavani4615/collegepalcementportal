package com.placement.portal.controllers;

import com.placement.portal.dto.AnalyticsDto;
import com.placement.portal.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    JobRepository jobRepository;

    @Autowired
    ApplicationRepository applicationRepository;

    @Autowired
    InterviewRepository interviewRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardAnalytics() {
        AnalyticsDto analytics = AnalyticsDto.builder()
                .totalJobs(jobRepository.count())
                .pendingJobs(jobRepository.countByStatus("PENDING"))
                .approvedJobs(jobRepository.countByStatus("APPROVED"))
                .totalApplications(applicationRepository.count())
                .totalInterviews(interviewRepository.count())
                .totalStudents(userRepository.countByRole("STUDENT"))
                .totalCompanies(userRepository.countByRole("RECRUITER"))
                .build();

        return ResponseEntity.ok(analytics);
    }
}
