package com.placement.portal.repositories;

import com.placement.portal.models.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(String status);
    List<Job> findByRecruiterId(Long recruiterId);
    long countByStatus(String status);
}
