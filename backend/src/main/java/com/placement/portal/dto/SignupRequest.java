package com.placement.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(max = 100)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    @Size(max = 20)
    private String role; // "STUDENT", "RECRUITER", "ADMIN"

    @NotBlank
    @Size(max = 100)
    private String name;

    // Recruiter Specific Field
    private String companyName;

    // Student Specific Fields
    private Double cgpa;
    private String branch;
    private String phoneNumber;
}
