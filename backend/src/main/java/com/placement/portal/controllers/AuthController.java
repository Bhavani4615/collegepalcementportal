package com.placement.portal.controllers;

import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.SignupRequest;
import com.placement.portal.dto.JwtResponse;
import com.placement.portal.dto.MessageResponse;
import com.placement.portal.models.CompanyProfile;
import com.placement.portal.models.StudentProfile;
import com.placement.portal.models.User;
import com.placement.portal.repositories.CompanyProfileRepository;
import com.placement.portal.repositories.StudentProfileRepository;
import com.placement.portal.repositories.UserRepository;
import com.placement.portal.security.jwt.JwtUtils;
import com.placement.portal.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentProfileRepository studentProfileRepository;

    @Autowired
    CompanyProfileRepository companyProfileRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();        

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getName(),
                                                 userDetails.getRole()));
    }

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole().toUpperCase())
                .name(signUpRequest.getName())
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create profile based on role
        if ("STUDENT".equalsIgnoreCase(savedUser.getRole())) {
            StudentProfile studentProfile = StudentProfile.builder()
                    .userId(savedUser.getId())
                    .user(savedUser)
                    .cgpa(signUpRequest.getCgpa() != null ? signUpRequest.getCgpa() : 0.0)
                    .branch(signUpRequest.getBranch())
                    .phoneNumber(signUpRequest.getPhoneNumber())
                    .build();
            studentProfileRepository.save(studentProfile);
        } else if ("RECRUITER".equalsIgnoreCase(savedUser.getRole())) {
            CompanyProfile companyProfile = CompanyProfile.builder()
                    .userId(savedUser.getId())
                    .user(savedUser)
                    .companyName(signUpRequest.getCompanyName() != null ? signUpRequest.getCompanyName() : "Company")
                    .description("Campus hiring recruiter partner.")
                    .build();
            companyProfileRepository.save(companyProfile);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
