package com.placement.portal.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsDto {
    private long totalJobs;
    private long pendingJobs;
    private long approvedJobs;
    private long totalApplications;
    private long totalInterviews;
    private long totalStudents;
    private long totalCompanies;
}
