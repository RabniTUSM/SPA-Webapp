package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.Repositories.LocationRepository;

@Service
public class LocationService {
    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }
    private final LocationRepository locationRepository;
}
