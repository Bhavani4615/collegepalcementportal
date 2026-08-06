package com.placement.portal.dto;

import lombok.Data;

@Data
public class StudentProfileDto {
    private String name;
    private Double cgpa;
    private String branch;
    private String resumeUrl;
    private String phoneNumber;
    private String skills;
}
