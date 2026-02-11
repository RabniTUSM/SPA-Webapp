package spge.spa.Mappers;

import org.springframework.stereotype.Component;
import spge.spa.DTOs.LocationInputDTO;
import spge.spa.DTOs.LocationOutputDTO;
import spge.spa.Models.Location;

@Component
public class LocationMapper {
    public Location LocationDTOtoLocation(LocationInputDTO dto) {
        if (dto != null) {
            Location location = new Location();
            if (dto.getName() != null) {
                location.setName(dto.getName());
            }
            if (dto.getAddress() != null) {
                location.setAddress(dto.getAddress());
            }
            if (dto.getVipServiceAvailable() != null) {
                location.setVipServiceAvailable(dto.getVipServiceAvailable());
            } else {
                location.setVipServiceAvailable(false);
            }
            return location;
        } else {
            throw new IllegalArgumentException("LocationInputDTO is null");
        }
    }

    public LocationOutputDTO LocationToOutputDTO(Location location) {
        if (location != null) {
            LocationOutputDTO dto = new LocationOutputDTO();
            dto.setId(location.getId());
            dto.setName(location.getName());
            dto.setAddress(location.getAddress());
            dto.setVipServiceAvailable(location.getVipServiceAvailable());
            return dto;
        } else {
            throw new IllegalArgumentException("Location is null");
        }
    }

    public Location updateLocationFromDTO(Location existingLocation, LocationInputDTO dto) {
        if (existingLocation != null && dto != null) {
            if (dto.getName() != null) {
                existingLocation.setName(dto.getName());
            }
            if (dto.getAddress() != null) {
                existingLocation.setAddress(dto.getAddress());
            }
            if (dto.getVipServiceAvailable() != null) {
                existingLocation.setVipServiceAvailable(dto.getVipServiceAvailable());
            }
            return existingLocation;
        } else {
            throw new IllegalArgumentException("Existing location or DTO is null");
        }
    }
}

