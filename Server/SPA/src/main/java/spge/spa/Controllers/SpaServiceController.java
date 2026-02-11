package spge.spa.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spge.spa.DTOs.SpaServiceInputDTO;
import spge.spa.Services.PdfExportService;
import spge.spa.Services.ServicesService;

@RestController
@RequestMapping("/SPA/Service")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SpaServiceController {
    private final ServicesService servicesService;
    @Autowired
    private PdfExportService pdfExportService;

    public SpaServiceController(ServicesService servicesService) {
        this.servicesService = servicesService;
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

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportServicesPdf() {
        try {
            byte[] pdfBytes = pdfExportService.generateServicesPdf();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=spa_services.pdf")
                    .header("Content-Type", "application/pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
