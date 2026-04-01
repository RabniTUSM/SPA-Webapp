package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.User;
import spge.spa.Models.VipRequest;

import java.util.List;

@Repository
public interface VipRequestRepository extends JpaRepository<VipRequest, Long> {
    List<VipRequest> findByUserOrderByRequestedAtDesc(User user);
    List<VipRequest> findByStatusIgnoreCaseOrderByRequestedAtDesc(String status);
    boolean existsByUserAndStatusIgnoreCase(User user, String status);
}
