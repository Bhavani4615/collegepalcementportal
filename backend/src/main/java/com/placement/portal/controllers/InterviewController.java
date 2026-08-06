package com.placement.portal.controllers;

import com.placement.portal.dto.InterviewRequest;
import com.placement.portal.dto.MessageResponse;
import com.placement.portal.models.Application;
import com.placement.portal.models.Interview;
import com.placement.portal.models.Notification;
import com.placement.portal.repositories.ApplicationRepository;
import com.placement.portal.repositories.InterviewRepository;
import com.placement.portal.repositories.NotificationRepository;
import com.placement.portal.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    InterviewRepository interviewRepository;

    @Autowired
    ApplicationRepository applicationRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    com.placement.portal.services.EmailService emailService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> scheduleInterview(@Valid @RequestBody InterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"SHORTLISTED".equals(application.getStatus())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Interview can only be scheduled for shortlisted candidates!"));
        }

        Interview interview = Interview.builder()
                .application(application)
                .scheduledTime(request.getScheduledTime())
                .location(request.getLocation())
                .notes(request.getNotes())
                .status("SCHEDULED")
                .build();

        interviewRepository.save(interview);

        // Send Email to Student
        emailService.sendEmail(
            application.getStudent().getEmail(),
            "Interview Scheduled: " + application.getJob().getCompanyName(),
            "Dear " + application.getStudent().getName() + ",\n\nAn interview has been scheduled for the role of '" + application.getJob().getTitle() + "' at " + application.getJob().getCompanyName() + ".\n\nDate & Time: " + request.getScheduledTime() + "\nPlatform / Location: " + request.getLocation() + "\nRecruiter Notes: " + (request.getNotes() != null ? request.getNotes() : "None") + "\n\nPlease ensure you join on time.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Student
        notificationRepository.save(Notification.builder()
                .user(application.getStudent())
                .message("Interview Scheduled: " + application.getJob().getCompanyName() + " has scheduled an interview for '" + application.getJob().getTitle() + "' on " + request.getScheduledTime() + " at " + request.getLocation() + ".")
                .build());

        return ResponseEntity.ok(new MessageResponse("Interview scheduled successfully!"));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Interview>> getStudentInterviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(interviewRepository.findByApplicationStudentId(userDetails.getId()));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<Interview>> getRecruiterInterviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(interviewRepository.findByApplicationJobRecruiterId(userDetails.getId()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> cancelInterview(@PathVariable Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus("CANCELLED");
        interviewRepository.save(interview);

        // Send Email to Student
        emailService.sendEmail(
            interview.getApplication().getStudent().getEmail(),
            "Interview Cancelled: " + interview.getApplication().getJob().getCompanyName(),
            "Dear " + interview.getApplication().getStudent().getName() + ",\n\nWe would like to inform you that your interview scheduled with " + interview.getApplication().getJob().getCompanyName() + " for the position of '" + interview.getApplication().getJob().getTitle() + "' on " + interview.getScheduledTime() + " has been cancelled by the recruiter.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Student
        notificationRepository.save(Notification.builder()
                .user(interview.getApplication().getStudent())
                .message("Interview Cancelled: Your interview scheduled with " + interview.getApplication().getJob().getCompanyName() + " on " + interview.getScheduledTime() + " has been cancelled.")
                .build());

        return ResponseEntity.ok(new MessageResponse("Interview cancelled."));
    }
}
