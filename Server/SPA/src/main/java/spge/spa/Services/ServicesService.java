package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.Repositories.ServiceRepository;

@Service
public class ServicesService {
    public ServicesService(ServiceRepository serviceRepository){
        this.serviceRepository = serviceRepository;
    }
    private final ServiceRepository serviceRepository;
}
