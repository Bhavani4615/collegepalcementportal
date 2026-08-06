package com.placement.portal.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:your_email@gmail.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        // Output mock console log regardless for visibility during testing
        logger.info("[CAMPUS EMAIL DISPATCH] TO: {} | SUBJECT: {} | CONTENT: {}", to, subject, text);
        
        if (mailSender == null || "your_email@gmail.com".equals(fromEmail)) {
            logger.info("[MOCK EMAIL MODE] SMTP credentials unconfigured. Skipping real email transmission.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            logger.info("Real email dispatched successfully to: {}", to);
        } catch (Exception ex) {
            logger.error("Failed to send real email to: {}. Error: {}", to, ex.getMessage());
        }
    }
}
