package com.renteasy.repository;

import com.renteasy.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByPhone(String phone);

    List<Tenant> findByActiveTrue();

    List<Tenant> findByActiveFalse();
}
