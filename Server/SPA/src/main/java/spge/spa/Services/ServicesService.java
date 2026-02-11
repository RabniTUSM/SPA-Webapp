package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.SpaServiceInputDTO;
import spge.spa.DTOs.SpaServiceOutputDTO;
import spge.spa.Mappers.SpaServiceMapper;
import spge.spa.Models.SpaService;
import spge.spa.Repositories.SpaServiceRepository;

import java.util.List;

@Service
public class ServicesService {
    private final SpaServiceRepository spaServiceRepository;
    private final SpaServiceMapper spaServiceMapper;

    public ServicesService(SpaServiceRepository spaServiceRepository, SpaServiceMapper spaServiceMapper) {
        this.spaServiceRepository = spaServiceRepository;
        this.spaServiceMapper = spaServiceMapper;
    }

    public void createService(SpaServiceInputDTO dto) {
        if (dto != null) {
            var spaService = spaServiceMapper.SpaServiceDTOtoSpaService(dto);
            spaServiceRepository.save(spaService);
        } else {
            throw new IllegalArgumentException("SpaServiceInputDTO is null");
        }
    }

    public SpaServiceOutputDTO getServiceById(Long id) {
        if (id != null) {
            var spaService = spaServiceRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
            return spaServiceMapper.SpaServiceToOutputDTO(spaService);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }

    public List<SpaServiceOutputDTO> getAllServices() {
        var services = spaServiceRepository.findAll();
        return services.stream()
                .map(spaServiceMapper::SpaServiceToOutputDTO)
                .toList();
    }

    public void updateService(Long id, SpaServiceInputDTO dto) {
        if (id != null && dto != null) {
            var existingService = spaServiceRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
            spaServiceMapper.updateSpaServiceFromDTO(existingService, dto);
            spaServiceRepository.save(existingService);
        } else {
            throw new IllegalArgumentException("ID or DTO is null");
        }
    }

    public void deleteService(Long id) {
        if (id != null) {
            if (!spaServiceRepository.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found");
            }
            spaServiceRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ID is null");
        }
    }
}
