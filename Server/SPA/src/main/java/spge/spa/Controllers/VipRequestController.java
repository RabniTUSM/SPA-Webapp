package spge.spa.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spge.spa.DTOs.VipRequestInputDTO;
import spge.spa.Services.VipRequestService;

@RestController
@RequestMapping("/VipRequest")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class VipRequestController {
    private final VipRequestService vipRequestService;

    public VipRequestController(VipRequestService vipRequestService) {
        this.vipRequestService = vipRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody VipRequestInputDTO dto) {
        return ResponseEntity.ok(vipRequestService.createRequest(dto));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests() {
        return ResponseEntity.ok(vipRequestService.getMyRequests());
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        return ResponseEntity.ok(vipRequestService.getPendingRequests());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(vipRequestService.approveRequest(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(vipRequestService.rejectRequest(id));
    }
}
