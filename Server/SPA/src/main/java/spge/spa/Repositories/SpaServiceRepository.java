package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.SpaService;

@Repository
public interface SpaServiceRepository extends JpaRepository<SpaService, Long> {
}
