package com.placement.portal.controllers;

import com.placement.portal.dto.MessageResponse;
import com.placement.portal.models.StudentProfile;
import com.placement.portal.repositories.StudentProfileRepository;
import com.placement.portal.security.services.UserDetailsImpl;
import com.placement.portal.services.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.io.IOException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadResume(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: File is empty!"));
        }

        if (!"application/pdf".equals(file.getContentType())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Only PDF resumes are accepted!"));
        }

        String fileName = fileStorageService.storeFile(file, userDetails.getId());

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/resumes/download/")
                .path(fileName)
                .toUriString();

        // Update Student's resume URL in profile database table
        StudentProfile studentProfile = studentProfileRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found. Complete profile details first."));

        studentProfile.setResumeUrl(fileDownloadUri);
        studentProfileRepository.save(studentProfile);

        return ResponseEntity.ok(new MessageResponse(fileDownloadUri));
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadResume(@PathVariable String fileName, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("Could not determine file type.");
        }

        // Fallback to the default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
