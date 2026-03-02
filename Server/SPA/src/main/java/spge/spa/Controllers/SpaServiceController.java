package spge.spa.Controllers;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import spge.spa.DTOs.SpaServiceInputDTO;
import spge.spa.Services.PriceChartStorageService;
import spge.spa.Services.ServicesService;

@RestController
@RequestMapping("/Service")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SpaServiceController {
    private final ServicesService servicesService;
    private final PriceChartStorageService priceChartStorageService;

    public SpaServiceController(ServicesService servicesService, PriceChartStorageService priceChartStorageService) {
        this.servicesService = servicesService;
        this.priceChartStorageService = priceChartStorageService;
    }

    @PostMapping
    public ResponseEntity<String> createService(@RequestBody SpaServiceInputDTO spaServiceInputDTO) {
        servicesService.createService(spaServiceInputDTO);
        return ResponseEntity.ok("Service created successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(servicesService.getServiceById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAllServices() {
        return ResponseEntity.ok(servicesService.getAllServices());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateService(@PathVariable Long id, @RequestBody SpaServiceInputDTO spaServiceInputDTO) {
        servicesService.updateService(id, spaServiceInputDTO);
        return ResponseEntity.ok("Service updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id) {
        servicesService.deleteService(id);
        return ResponseEntity.ok("Service deleted successfully");
    }

    @PostMapping(value = "/price-chart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadPriceChart(@RequestParam("file") MultipartFile file) {
        priceChartStorageService.save(file);
        return ResponseEntity.ok("Price chart uploaded successfully");
    }

    @GetMapping("/price-chart")
    public ResponseEntity<Resource> downloadPriceChart() {
        Resource pdfResource = priceChartStorageService.load();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"price-chart.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfResource);
    }
}
