package com.placement.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class JobRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String companyName;

    @NotBlank
    private String salaryPackage;

    private String location;

    private Double minCgpa;

    private LocalDate deadline;
}
