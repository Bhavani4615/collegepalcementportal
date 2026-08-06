package com.placement.portal.controllers;

import com.placement.portal.dto.JobRequest;
import com.placement.portal.dto.MessageResponse;
import com.placement.portal.models.Job;
import com.placement.portal.models.Notification;
import com.placement.portal.models.User;
import com.placement.portal.repositories.JobRepository;
import com.placement.portal.repositories.NotificationRepository;
import com.placement.portal.repositories.UserRepository;
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
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    JobRepository jobRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    com.placement.portal.services.EmailService emailService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @GetMapping("/approved")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<List<Job>> getApprovedJobs() {
        return ResponseEntity.ok(jobRepository.findByStatus("APPROVED"));
    }

    @GetMapping("/posted")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<Job>> getPostedJobs(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(jobRepository.findByRecruiterId(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> createJob(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                       @Valid @RequestBody JobRequest jobRequest) {
        User recruiter = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        Job job = Job.builder()
                .title(jobRequest.getTitle())
                .description(jobRequest.getDescription())
                .companyName(jobRequest.getCompanyName())
                .salaryPackage(jobRequest.getSalaryPackage())
                .location(jobRequest.getLocation() != null ? jobRequest.getLocation() : "Remote")
                .minCgpa(jobRequest.getMinCgpa() != null ? jobRequest.getMinCgpa() : 0.0)
                .deadline(jobRequest.getDeadline())
                .status("PENDING") // Pending Admin approval
                .recruiter(recruiter)
                .build();

        Job savedJob = jobRepository.save(job);

        // Notify TPO/Admin that a new drive needs approval
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                .toList();
        for (User admin : admins) {
            notificationRepository.save(Notification.builder()
                    .user(admin)
                    .message("New recruitment drive '" + savedJob.getTitle() + "' posted by " + savedJob.getCompanyName() + " requires your approval.")
                    .build());
        }

        return ResponseEntity.ok(new MessageResponse("Placement drive submitted successfully and is pending TPO approval!"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest jobRequest) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setCompanyName(jobRequest.getCompanyName());
        job.setSalaryPackage(jobRequest.getSalaryPackage());
        job.setLocation(jobRequest.getLocation());
        job.setMinCgpa(jobRequest.getMinCgpa());
        job.setDeadline(jobRequest.getDeadline());

        jobRepository.save(job);
        return ResponseEntity.ok(new MessageResponse("Placement drive updated successfully!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        jobRepository.delete(job);
        return ResponseEntity.ok(new MessageResponse("Placement drive deleted successfully!"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus("APPROVED");
        jobRepository.save(job);

        // Send Email to Recruiter
        emailService.sendEmail(
            job.getRecruiter().getEmail(),
            "Placement Drive Approved: " + job.getTitle(),
            "Dear Recruiter,\n\nWe are pleased to inform you that your request to host a placement drive for the role of '" + job.getTitle() + "' at " + job.getCompanyName() + " has been approved by the TPO and is now live on the Student Board.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Recruiter
        notificationRepository.save(Notification.builder()
                .user(job.getRecruiter())
                .message("Your recruitment drive '" + job.getTitle() + "' has been approved by the TPO and is now live on the Student Board.")
                .build());

        // Notify Students
        List<User> students = userRepository.findAll().stream()
                .filter(u -> "STUDENT".equalsIgnoreCase(u.getRole()))
                .toList();
        for (User student : students) {
            notificationRepository.save(Notification.builder()
                    .user(student)
                    .message("New recruitment drive: " + job.getCompanyName() + " is hiring for '" + job.getTitle() + "' with package " + job.getSalaryPackage() + ".")
                    .build());
        }

        return ResponseEntity.ok(new MessageResponse("Placement drive approved successfully!"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus("REJECTED");
        jobRepository.save(job);

        // Send Email to Recruiter
        emailService.sendEmail(
            job.getRecruiter().getEmail(),
            "Placement Drive Declined: " + job.getTitle(),
            "Dear Recruiter,\n\nWe regret to inform you that your request to host a placement drive for the role of '" + job.getTitle() + "' at " + job.getCompanyName() + " has been declined by the TPO administration.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Recruiter
        notificationRepository.save(Notification.builder()
                .user(job.getRecruiter())
                .message("Your recruitment drive '" + job.getTitle() + "' has been declined by the TPO admin.")
                .build());

        return ResponseEntity.ok(new MessageResponse("Placement drive declined."));
    }
}
