package com.placement.portal.repositories;

import com.placement.portal.models.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
}
