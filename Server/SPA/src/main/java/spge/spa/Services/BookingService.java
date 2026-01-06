package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.Repositories.BookingRepository;

@Service
public class BookingService {
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }
    private final BookingRepository bookingRepository;
}
