package com.placement.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewRequest {
    @NotNull
    private Long applicationId;

    @NotNull
    private LocalDateTime scheduledTime;

    @NotBlank
    private String location;

    private String notes;
}
