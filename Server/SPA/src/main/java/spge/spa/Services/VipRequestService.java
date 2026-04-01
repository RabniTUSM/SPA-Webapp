package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.VipRequestInputDTO;
import spge.spa.DTOs.VipRequestOutputDTO;
import spge.spa.Models.Role;
import spge.spa.Models.User;
import spge.spa.Models.VipRequest;
import spge.spa.Repositories.RoleRepository;
import spge.spa.Repositories.UserRepository;
import spge.spa.Repositories.VipRequestRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class VipRequestService {
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_APPROVED = "approved";
    private static final String STATUS_REJECTED = "rejected";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final VipRequestRepository vipRequestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public VipRequestService(
            VipRequestRepository vipRequestRepository,
            UserRepository userRepository,
            RoleRepository roleRepository
    ) {
        this.vipRequestRepository = vipRequestRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public VipRequestOutputDTO createRequest(VipRequestInputDTO dto) {
        User requester = requireAuthenticatedUser();
        String roleName = normalizeValue(requester.getRole() == null ? null : requester.getRole().getName());
        String viewType = normalizeValue(requester.getRole() == null ? null : requester.getRole().getViewType());

        if ("vip".equals(roleName) || "vip".equals(viewType)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have VIP access");
        }

        if ("admin".equals(roleName) || "employee".equals(roleName)
                || "admin".equals(viewType) || "employee".equals(viewType)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only customer accounts can request VIP access");
        }

        if (vipRequestRepository.existsByUserAndStatusIgnoreCase(requester, STATUS_PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending VIP request");
        }

        String message = normalizeMessage(dto == null ? null : dto.getMessage());

        VipRequest request = new VipRequest();
        request.setUser(requester);
        request.setMessage(message);
        request.setRequestedAt(LocalDateTime.now());
        request.setStatus(STATUS_PENDING);

        return mapToDTO(vipRequestRepository.save(request));
    }

    public List<VipRequestOutputDTO> getMyRequests() {
        User requester = requireAuthenticatedUser();
        return vipRequestRepository.findByUserOrderByRequestedAtDesc(requester).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<VipRequestOutputDTO> getPendingRequests() {
        return vipRequestRepository.findByStatusIgnoreCaseOrderByRequestedAtDesc(STATUS_PENDING).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public VipRequestOutputDTO approveRequest(Long id) {
        User reviewer = requireAuthenticatedUser();
        VipRequest request = requirePendingRequest(id);

        Role vipRole = roleRepository.findByNameIgnoreCase("VIP")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "VIP role not found"));

        User targetUser = request.getUser();
        targetUser.setRole(vipRole);
        userRepository.save(targetUser);

        request.setStatus(STATUS_APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(reviewer);

        return mapToDTO(vipRequestRepository.save(request));
    }

    public VipRequestOutputDTO rejectRequest(Long id) {
        User reviewer = requireAuthenticatedUser();
        VipRequest request = requirePendingRequest(id);

        request.setStatus(STATUS_REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(reviewer);

        return mapToDTO(vipRequestRepository.save(request));
    }

    private VipRequest requirePendingRequest(Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VIP request id is required");
        }

        VipRequest request = vipRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "VIP request not found"));

        if (!STATUS_PENDING.equalsIgnoreCase(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VIP request is already processed");
        }

        return request;
    }

    private String normalizeMessage(String message) {
        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VIP request message is required");
        }

        String normalized = message.trim();
        if (normalized.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VIP request message must be 1000 characters or fewer");
        }
        return normalized;
    }

    private String normalizeValue(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private User requireAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String principal = authentication.getName();
        String username = principal == null ? "" : principal.trim().toLowerCase(Locale.ROOT);
        if (username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        if ("guest".equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Guest users cannot manage VIP requests");
        }

        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private VipRequestOutputDTO mapToDTO(VipRequest request) {
        VipRequestOutputDTO dto = new VipRequestOutputDTO();
        dto.setId(request.getId());
        dto.setUsername(request.getUser().getUsername());
        dto.setName(request.getUser().getName());
        dto.setMessage(request.getMessage());
        dto.setRequestedAt(request.getRequestedAt() == null ? null : request.getRequestedAt().format(FORMATTER));
        dto.setStatus(request.getStatus());
        return dto;
    }
}
