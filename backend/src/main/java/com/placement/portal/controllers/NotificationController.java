package com.placement.portal.controllers;

import com.placement.portal.dto.MessageResponse;
import com.placement.portal.models.Notification;
import com.placement.portal.repositories.NotificationRepository;
import com.placement.portal.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    NotificationRepository notificationRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(new MessageResponse("Notification marked as read."));
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read."));
    }
}
