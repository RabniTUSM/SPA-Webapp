package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
}
