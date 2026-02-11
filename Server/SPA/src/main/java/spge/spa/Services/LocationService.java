package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.LocationInputDTO;
import spge.spa.DTOs.LocationOutputDTO;
import spge.spa.Mappers.LocationMapper;
import spge.spa.Models.Location;
import spge.spa.Repositories.LocationRepository;

import java.util.List;

@Service
public class LocationService {
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public LocationService(LocationRepository locationRepository, LocationMapper locationMapper) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
    }

    public void createLocation(LocationInputDTO dto) {
        if (dto != null) {
            var location = locationMapper.LocationDTOtoLocation(dto);
            locationRepository.save(location);
        } else {
            throw new IllegalArgumentException("LocationInputDTO is null");
        }
    }

    public LocationOutputDTO getLocationById(Long id) {
        if (id != null) {
            var location = locationRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
            return locationMapper.LocationToOutputDTO(location);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }

    public List<LocationOutputDTO> getAllLocations() {
        var locations = locationRepository.findAll();
        return locations.stream()
                .map(locationMapper::LocationToOutputDTO)
                .toList();
    }

    public void updateLocation(Long id, LocationInputDTO dto) {
        if (id != null && dto != null) {
            var existingLocation = locationRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
            locationMapper.updateLocationFromDTO(existingLocation, dto);
            locationRepository.save(existingLocation);
        } else {
            throw new IllegalArgumentException("ID or DTO is null");
        }
    }

    public void deleteLocation(Long id) {
        if (id != null) {
            if (!locationRepository.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
            }
            locationRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }
}
