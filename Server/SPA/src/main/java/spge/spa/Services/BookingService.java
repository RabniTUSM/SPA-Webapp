package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.BookingInputDTO;
import spge.spa.DTOs.BookingOutputDTO;
import spge.spa.Mappers.BookingMapper;
import spge.spa.Models.Booking;
import spge.spa.Repositories.BookingRepository;
import spge.spa.Repositories.LocationRepository;
import spge.spa.Repositories.SpaServiceRepository;
import spge.spa.Repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final UserRepository userRepository;
    private final SpaServiceRepository spaServiceRepository;
    private final LocationRepository locationRepository;

    public BookingService(
            BookingRepository bookingRepository,
            BookingMapper bookingMapper,
            UserRepository userRepository,
            SpaServiceRepository spaServiceRepository,
            LocationRepository locationRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.userRepository = userRepository;
        this.spaServiceRepository = spaServiceRepository;
        this.locationRepository = locationRepository;
    }

    public void createBooking(BookingInputDTO dto) {
        if (dto != null) {
            var requester = getRequesterContext();
            validateCreateOrUpdatePermissions(requester, dto, null);
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
            var requester = getRequesterContext();
            var existingBooking = bookingRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            validateCreateOrUpdatePermissions(requester, dto, existingBooking);
            bookingMapper.updateBookingFromDTO(existingBooking, dto);
            bookingRepository.save(existingBooking);
        } else {
            throw new IllegalArgumentException("ID or DTO is null");
        }
    }

    public void deleteBooking(Long id) {
        if (id != null) {
            var requester = getRequesterContext();
            var booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            validateDeletePermissions(requester, booking);
            bookingRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }

    private void validateCreateOrUpdatePermissions(RequesterContext requester, BookingInputDTO dto, Booking existingBooking) {
        if (requester.isGuest) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Guest users cannot manage bookings");
        }

        if (requester.user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }

        Long targetCustomerId = dto.getCustomerId();
        if (!requester.isStaffOrAdmin && (targetCustomerId == null || !targetCustomerId.equals(requester.user.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can manage only your own bookings");
        }

        if (!requester.isStaffOrAdmin && existingBooking != null && !existingBooking.getCustomer().getId().equals(requester.user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can manage only your own bookings");
        }

        var service = spaServiceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        var location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

        boolean vipOnlyService = Boolean.TRUE.equals(service.getVipOnly());
        if (!vipOnlyService) {
            return;
        }

        if (!requester.hasVipAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "VIP service requires VIP membership");
        }

        if (!Boolean.TRUE.equals(location.getVipServiceAvailable())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected location does not support VIP services");
        }
    }

    private void validateDeletePermissions(RequesterContext requester, Booking booking) {
        if (requester.isGuest) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Guest users cannot manage bookings");
        }
        if (requester.user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        if (!requester.isStaffOrAdmin && !booking.getCustomer().getId().equals(requester.user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can manage only your own bookings");
        }
        if (!requester.isStaffOrAdmin && booking.getEndTime() != null && !booking.getEndTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Past bookings cannot be canceled");
        }
    }

    private RequesterContext getRequesterContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String principal = authentication.getName();
        String username = principal == null ? "" : principal.trim().toLowerCase(Locale.ROOT);
        if (username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        if ("guest".equals(username)) {
            return new RequesterContext(null, false, false, true);
        }

        var requesterUser = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String role = requesterUser.getRole() == null ? "" : requesterUser.getRole().getName().toUpperCase(Locale.ROOT);
        boolean isStaffOrAdmin = "ADMIN".equals(role) || "EMPLOYEE".equals(role);
        boolean hasVipAccess = isStaffOrAdmin || "VIP".equals(role);

        return new RequesterContext(requesterUser, isStaffOrAdmin, hasVipAccess, false);
    }

    private record RequesterContext(
            spge.spa.Models.User user,
            boolean isStaffOrAdmin,
            boolean hasVipAccess,
            boolean isGuest
    ) {}
}
