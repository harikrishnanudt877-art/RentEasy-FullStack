package com.renteasy.repository;

import com.renteasy.entity.RentPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentPaymentRepository extends JpaRepository<RentPayment, Long> {

    List<RentPayment> findByTenantTenantIdOrderByPaymentMonthDesc(Long tenantId);

    boolean existsByTenantTenantIdAndPaymentMonth(Long tenantId, String paymentMonth);

    List<RentPayment> findByPaymentMonth(String paymentMonth);
}
