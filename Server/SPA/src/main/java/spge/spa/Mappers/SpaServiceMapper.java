package spge.spa.Mappers;

import org.springframework.stereotype.Component;
import spge.spa.DTOs.SpaServiceInputDTO;
import spge.spa.DTOs.SpaServiceOutputDTO;
import spge.spa.Models.SpaService;

@Component
public class SpaServiceMapper {
    public SpaService SpaServiceDTOtoSpaService(SpaServiceInputDTO dto) {
        if (dto != null) {
            SpaService spaService = new SpaService();
            if (dto.getName() != null) {
                spaService.setName(dto.getName());
            }
            if (dto.getDescription() != null) {
                spaService.setDescription(dto.getDescription());
            }
            if (dto.getPrice() != null) {
                spaService.setPrice(dto.getPrice());
            }
            if (dto.getVipOnly() != null) {
                spaService.setVipOnly(dto.getVipOnly());
            } else {
                spaService.setVipOnly(false);
            }
            return spaService;
        } else {
            throw new IllegalArgumentException("SpaServiceInputDTO is null");
        }
    }

    public SpaServiceOutputDTO SpaServiceToOutputDTO(SpaService spaService) {
        if (spaService != null) {
            SpaServiceOutputDTO dto = new SpaServiceOutputDTO();
            dto.setId(spaService.getId());
            dto.setName(spaService.getName());
            dto.setDescription(spaService.getDescription());
            dto.setPrice(spaService.getPrice());
            dto.setVipOnly(spaService.getVipOnly());
            return dto;
        } else {
            throw new IllegalArgumentException("SpaService is null");
        }
    }

    public SpaService updateSpaServiceFromDTO(SpaService existingService, SpaServiceInputDTO dto) {
        if (existingService != null && dto != null) {
            if (dto.getName() != null) {
                existingService.setName(dto.getName());
            }
            if (dto.getDescription() != null) {
                existingService.setDescription(dto.getDescription());
            }
            if (dto.getPrice() != null) {
                existingService.setPrice(dto.getPrice());
            }
            if (dto.getVipOnly() != null) {
                existingService.setVipOnly(dto.getVipOnly());
            }
            return existingService;
        } else {
            throw new IllegalArgumentException("Existing service or DTO is null");
        }
    }
}

