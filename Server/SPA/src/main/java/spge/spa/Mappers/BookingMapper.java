package spge.spa.Mappers;

import org.springframework.stereotype.Component;
import spge.spa.DTOs.BookingInputDTO;
import spge.spa.DTOs.BookingOutputDTO;
import spge.spa.Models.Booking;
import spge.spa.Repositories.UserRepository;
import spge.spa.Repositories.LocationRepository;
import spge.spa.Repositories.SpaServiceRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class BookingMapper {
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final SpaServiceRepository spaServiceRepository;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public BookingMapper(UserRepository userRepository, LocationRepository locationRepository,
                        SpaServiceRepository spaServiceRepository) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.spaServiceRepository = spaServiceRepository;
    }

    public Booking BookingDTOtoBooking(BookingInputDTO dto) {
        if (dto != null) {
            Booking booking = new Booking();

            if (dto.getCustomerId() != null) {
                var customer = userRepository.findById(dto.getCustomerId())
                        .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
                booking.setCustomer(customer);
            }

            if (dto.getEmployeeId() != null) {
                var employee = userRepository.findById(dto.getEmployeeId())
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
                booking.setEmployee(employee);
            }

            if (dto.getServiceId() != null) {
                var service = spaServiceRepository.findById(dto.getServiceId())
                        .orElseThrow(() -> new IllegalArgumentException("Service not found"));
                booking.setService(service);
            }

            if (dto.getLocationId() != null) {
                var location = locationRepository.findById(dto.getLocationId())
                        .orElseThrow(() -> new IllegalArgumentException("Location not found"));
                booking.setLocation(location);
            }

            if (dto.getStartTime() != null) {
                booking.setStartTime(LocalDateTime.parse(dto.getStartTime(), formatter));
            }

            if (dto.getEndTime() != null) {
                booking.setEndTime(LocalDateTime.parse(dto.getEndTime(), formatter));
            }

            return booking;
        } else {
            throw new IllegalArgumentException("BookingInputDTO is null");
        }
    }

    public BookingOutputDTO BookingToOutputDTO(Booking booking) {
        if (booking != null) {
            BookingOutputDTO dto = new BookingOutputDTO();
            dto.setId(booking.getId());
            dto.setCustomerName(booking.getCustomer().getName());
            dto.setEmployeeName(booking.getEmployee().getName());
            dto.setServiceName(booking.getService().getName());
            dto.setLocationName(booking.getLocation().getName());
            dto.setStartTime(booking.getStartTime().format(formatter));
            dto.setEndTime(booking.getEndTime().format(formatter));
            return dto;
        } else {
            throw new IllegalArgumentException("Booking is null");
        }
    }

    public Booking updateBookingFromDTO(Booking existingBooking, BookingInputDTO dto) {
        if (existingBooking != null && dto != null) {
            if (dto.getCustomerId() != null) {
                var customer = userRepository.findById(dto.getCustomerId())
                        .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
                existingBooking.setCustomer(customer);
            }

            if (dto.getEmployeeId() != null) {
                var employee = userRepository.findById(dto.getEmployeeId())
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
                existingBooking.setEmployee(employee);
            }

            if (dto.getServiceId() != null) {
                var service = spaServiceRepository.findById(dto.getServiceId())
                        .orElseThrow(() -> new IllegalArgumentException("Service not found"));
                existingBooking.setService(service);
            }

            if (dto.getLocationId() != null) {
                var location = locationRepository.findById(dto.getLocationId())
                        .orElseThrow(() -> new IllegalArgumentException("Location not found"));
                existingBooking.setLocation(location);
            }

            if (dto.getStartTime() != null) {
                existingBooking.setStartTime(LocalDateTime.parse(dto.getStartTime(), formatter));
            }

            if (dto.getEndTime() != null) {
                existingBooking.setEndTime(LocalDateTime.parse(dto.getEndTime(), formatter));
            }

            return existingBooking;
        } else {
            throw new IllegalArgumentException("Existing booking or DTO is null");
        }
    }
}


