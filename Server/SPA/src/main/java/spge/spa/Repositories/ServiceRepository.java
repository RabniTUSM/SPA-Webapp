package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
}
