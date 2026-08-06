package com.placement.portal.controllers;

import com.placement.portal.dto.MessageResponse;
import com.placement.portal.models.*;
import com.placement.portal.repositories.*;
import com.placement.portal.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    ApplicationRepository applicationRepository;

    @Autowired
    JobRepository jobRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentProfileRepository studentProfileRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    com.placement.portal.services.EmailService emailService;

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @PathVariable Long jobId) {
        User student = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job drive not found"));

        // Check if job is approved
        if (!"APPROVED".equals(job.getStatus())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: This recruitment drive is not active."));
        }

        // Check if student has already applied
        if (applicationRepository.existsByStudentIdAndJobId(student.getId(), job.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You have already applied for this job drive!"));
        }

        // Fetch Student Profile for criteria checks
        StudentProfile studentProfile = studentProfileRepository.findById(student.getId())
                .orElseThrow(() -> new RuntimeException("Profile incomplete! Please save your profile details first."));

        // Validate Resume Uploaded
        if (studentProfile.getResumeUrl() == null || studentProfile.getResumeUrl().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Please upload your resume before applying."));
        }

        // Check CGPA Eligibility
        if (job.getMinCgpa() != null && studentProfile.getCgpa() < job.getMinCgpa()) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                    "Error: Ineligible. Your CGPA (" + studentProfile.getCgpa() + ") does not meet the minimum requirement of " + job.getMinCgpa() + "."));
        }

        // Save application record
        Application application = Application.builder()
                .job(job)
                .student(student)
                .status("APPLIED")
                .resumeUrl(studentProfile.getResumeUrl())
                .build();

        applicationRepository.save(application);

        // Notify Recruiter
        notificationRepository.save(Notification.builder()
                .user(job.getRecruiter())
                .message("New applicant '" + student.getName() + "' (CGPA: " + studentProfile.getCgpa() + ") applied for " + job.getTitle() + ".")
                .build());

        return ResponseEntity.ok(new MessageResponse("Applied successfully to " + job.getCompanyName() + "!"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Return a custom format or entities. Let's return the entities directly.
        // In Jackson configuration, we will make sure lazy load properties are handled or ignored.
        // We will fetch applications and clean them or map them to DTOs if necessary.
        List<Application> apps = applicationRepository.findByStudentId(userDetails.getId());
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> getJobApplications(@PathVariable Long jobId) {
        List<Application> apps = applicationRepository.findByJobId(jobId);
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> getRecruiterApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Application> apps = applicationRepository.findByJobRecruiterId(userDetails.getId());
        return ResponseEntity.ok(apps);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @PutMapping("/{id}/shortlist")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> shortlistApplication(@PathVariable Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("SHORTLISTED");
        applicationRepository.save(app);

        // Send Email to Student
        emailService.sendEmail(
            app.getStudent().getEmail(),
            "Application Shortlisted - " + app.getJob().getCompanyName(),
            "Dear " + app.getStudent().getName() + ",\n\nCongratulations! Your application for the position of '" + app.getJob().getTitle() + "' at " + app.getJob().getCompanyName() + " has been shortlisted. The recruiter will schedule technical rounds soon. Please check your dashboard for updates.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Student
        notificationRepository.save(Notification.builder()
                .user(app.getStudent())
                .message("Congratulations! You have been shortlisted by " + app.getJob().getCompanyName() + " for '" + app.getJob().getTitle() + "'. Please check back soon for interview schedules.")
                .build());

        return ResponseEntity.ok(new MessageResponse("Candidate shortlisted successfully!"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> rejectApplication(@PathVariable Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("REJECTED");
        applicationRepository.save(app);

        // Send Email to Student
        emailService.sendEmail(
            app.getStudent().getEmail(),
            "Application Status Update - " + app.getJob().getCompanyName(),
            "Dear " + app.getStudent().getName() + ",\n\nThank you for your interest in " + app.getJob().getCompanyName() + ". We regret to inform you that your application for '" + app.getJob().getTitle() + "' has been declined at this stage of the selection process.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Student
        notificationRepository.save(Notification.builder()
                .user(app.getStudent())
                .message("We regret to inform you that your application for '" + app.getJob().getTitle() + "' at " + app.getJob().getCompanyName() + " has been declined.")
                .build());

        return ResponseEntity.ok(new MessageResponse("Candidate rejected."));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> acceptApplication(@PathVariable Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("ACCEPTED");
        applicationRepository.save(app);

        // Send Email to Student
        emailService.sendEmail(
            app.getStudent().getEmail(),
            "Job Offer Extended! - " + app.getJob().getCompanyName(),
            "Dear " + app.getStudent().getName() + ",\n\nCongratulations! We are thrilled to inform you that you have received a job offer from " + app.getJob().getCompanyName() + " for the position of '" + app.getJob().getTitle() + "'!\n\nPlease check your email for the detailed offer letter and further boarding steps.\n\nBest regards,\nTraining & Placement Cell"
        );

        // Notify Student
        notificationRepository.save(Notification.builder()
                .user(app.getStudent())
                .message("Success! You have received a job offer from " + app.getJob().getCompanyName() + " for '" + app.getJob().getTitle() + "'! Check your email for further instructions.")
                .build());

        return ResponseEntity.ok(new MessageResponse("Job offer sent to candidate."));
    }
}
