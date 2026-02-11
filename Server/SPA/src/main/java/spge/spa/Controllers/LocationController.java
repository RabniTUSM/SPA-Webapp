package spge.spa.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spge.spa.DTOs.LocationInputDTO;
import spge.spa.Services.LocationService;

@RestController
@RequestMapping("/Location")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocationController {
    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping
    public ResponseEntity<String> createLocation(@RequestBody LocationInputDTO locationInputDTO) {
        locationService.createLocation(locationInputDTO);
        return ResponseEntity.ok("Location created successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateLocation(@PathVariable Long id, @RequestBody LocationInputDTO locationInputDTO) {
        locationService.updateLocation(id, locationInputDTO);
        return ResponseEntity.ok("Location updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok("Location deleted successfully");
    }
}

