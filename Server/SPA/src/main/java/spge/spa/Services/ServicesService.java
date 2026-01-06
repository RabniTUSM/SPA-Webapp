package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.Repositories.SpaServiceRepository;

@Service
public class ServicesService {
    public ServicesService(SpaServiceRepository spaServiceRepository){
        this.spaServiceRepository = spaServiceRepository;
    }
    private final SpaServiceRepository spaServiceRepository;
}
