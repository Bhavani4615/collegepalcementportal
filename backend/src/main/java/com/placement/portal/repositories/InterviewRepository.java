package com.placement.portal.repositories;

import com.placement.portal.models.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationStudentId(Long studentId);
    List<Interview> findByApplicationJobRecruiterId(Long recruiterId);
}
