package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
}
