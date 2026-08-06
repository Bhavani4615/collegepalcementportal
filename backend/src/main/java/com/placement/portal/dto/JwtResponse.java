package com.placement.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String name;
    private String role;

    public JwtResponse(String accessToken, Long id, String email, String name, String role) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}
