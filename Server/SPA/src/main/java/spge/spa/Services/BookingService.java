package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.BookingInputDTO;
import spge.spa.DTOs.BookingOutputDTO;
import spge.spa.Mappers.BookingMapper;
import spge.spa.Models.Booking;
import spge.spa.Repositories.BookingRepository;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    public BookingService(BookingRepository bookingRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
    }

    public void createBooking(BookingInputDTO dto) {
        if (dto != null) {
            var booking = bookingMapper.BookingDTOtoBooking(dto);
            bookingRepository.save(booking);
        } else {
            throw new IllegalArgumentException("BookingInputDTO is null");
        }
    }

    public BookingOutputDTO getBookingById(Long id) {
        if (id != null) {
            var booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            return bookingMapper.BookingToOutputDTO(booking);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }

    public List<BookingOutputDTO> getAllBookings() {
        var bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(bookingMapper::BookingToOutputDTO)
                .toList();
    }

    public void updateBooking(Long id, BookingInputDTO dto) {
        if (id != null && dto != null) {
            var existingBooking = bookingRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            bookingMapper.updateBookingFromDTO(existingBooking, dto);
            bookingRepository.save(existingBooking);
        } else {
            throw new IllegalArgumentException("ID or DTO is null");
        }
    }

    public void deleteBooking(Long id) {
        if (id != null) {
            if (!bookingRepository.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
            }
            bookingRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }
}
