package com.placement.portal.controllers;

import com.placement.portal.dto.CompanyProfileDto;
import com.placement.portal.dto.MessageResponse;
import com.placement.portal.dto.StudentProfileDto;
import com.placement.portal.models.CompanyProfile;
import com.placement.portal.models.StudentProfile;
import com.placement.portal.models.User;
import com.placement.portal.repositories.CompanyProfileRepository;
import com.placement.portal.repositories.StudentProfileRepository;
import com.placement.portal.repositories.UserRepository;
import com.placement.portal.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentProfileRepository studentProfileRepository;

    @Autowired
    CompanyProfileRepository companyProfileRepository;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getStudentProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        StudentProfile profile = studentProfileRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        StudentProfileDto dto = new StudentProfileDto();
        dto.setName(userDetails.getName());
        dto.setCgpa(profile.getCgpa());
        dto.setBranch(profile.getBranch());
        dto.setResumeUrl(profile.getResumeUrl());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setSkills(profile.getSkills());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateStudentProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                  @RequestBody StudentProfileDto dto) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile profile = studentProfileRepository.findById(userDetails.getId())
                .orElseGet(() -> StudentProfile.builder().userId(userDetails.getId()).user(user).build());

        // Update User Name if modified
        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
            userRepository.save(user);
        }

        profile.setCgpa(dto.getCgpa());
        profile.setBranch(dto.getBranch());
        profile.setResumeUrl(dto.getResumeUrl());
        profile.setPhoneNumber(dto.getPhoneNumber());
        profile.setSkills(dto.getSkills());

        studentProfileRepository.save(profile);
        return ResponseEntity.ok(new MessageResponse("Student profile updated successfully!"));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCompanyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        CompanyProfile profile = companyProfileRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Company profile not found"));

        CompanyProfileDto dto = new CompanyProfileDto();
        dto.setName(userDetails.getName());
        dto.setCompanyName(profile.getCompanyName());
        dto.setDescription(profile.getDescription());
        dto.setWebsite(profile.getWebsite());
        dto.setContactNumber(profile.getContactNumber());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/company")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> updateCompanyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                  @RequestBody CompanyProfileDto dto) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CompanyProfile profile = companyProfileRepository.findById(userDetails.getId())
                .orElseGet(() -> CompanyProfile.builder().userId(userDetails.getId()).user(user).build());

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
            userRepository.save(user);
        }

        profile.setCompanyName(dto.getCompanyName());
        profile.setDescription(dto.getDescription());
        profile.setWebsite(dto.getWebsite());
        profile.setContactNumber(dto.getContactNumber());

        companyProfileRepository.save(profile);
        return ResponseEntity.ok(new MessageResponse("Company profile updated successfully!"));
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<?> getAllStudents() {
        List<StudentProfile> profiles = studentProfileRepository.findAll();
        List<StudentProfileDto> dtos = profiles.stream().map(p -> {
            StudentProfileDto dto = new StudentProfileDto();
            dto.setName(p.getUser().getName());
            dto.setCgpa(p.getCgpa());
            dto.setBranch(p.getBranch());
            dto.setResumeUrl(p.getResumeUrl());
            dto.setPhoneNumber(p.getPhoneNumber());
            dto.setSkills(p.getSkills());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
