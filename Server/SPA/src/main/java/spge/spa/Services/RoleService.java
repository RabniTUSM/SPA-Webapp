package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.RoleInputDTO;
import spge.spa.DTOs.RoleOutputDTO;
import spge.spa.Models.Role;
import spge.spa.Repositories.RoleRepository;

import java.util.List;
import java.util.Locale;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public void initializeRoles() {
        ensureRole("CUSTOMER", false, "customer");
        ensureRole("ADMIN", true, "admin");
        ensureRole("EMPLOYEE", false, "employee");
        ensureRole("VIP", false, "vip");
    }

    public void saveRole(Role role) {
        roleRepository.save(role);
    }

    public Role getRoleByName(String name) {
        return roleRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    }

    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found");
        }
        roleRepository.deleteById(id);
    }

    public void createRole(RoleInputDTO dto) {
        String normalizedName = normalizeRoleName(dto.getName());
        if (roleRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Role name already exists");
        }
        var role = new Role();
        role.setName(normalizedName);
        role.setHasAdminAccess(dto.isHasAdminAccess());
        role.setDescription(dto.getDescription());
        role.setViewType(resolveViewType(dto.getViewType()));
        roleRepository.save(role);
    }

    public RoleOutputDTO getRoleByIdDTO(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
        return mapToDTO(role);
    }

    public List<RoleOutputDTO> getAllRolesDTO() {
        return roleRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public void updateRole(Long id, RoleInputDTO dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
        String normalizedName = normalizeRoleName(dto.getName());
        var roleWithSameName = roleRepository.findByNameIgnoreCase(normalizedName);
        if (roleWithSameName.isPresent() && !roleWithSameName.get().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Role name already exists");
        }
        role.setName(normalizedName);
        role.setHasAdminAccess(dto.isHasAdminAccess());
        role.setDescription(dto.getDescription());
        role.setViewType(resolveViewType(dto.getViewType()));
        roleRepository.save(role);
    }

    private RoleOutputDTO mapToDTO(Role role) {
        RoleOutputDTO dto = new RoleOutputDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setHasAdminAccess(role.isHasAdminAccess());
        dto.setDescription(role.getDescription());
        dto.setViewType(resolveViewType(role.getViewType()));
        return dto;
    }

    private String resolveViewType(String viewType) {
        if (viewType == null || viewType.isBlank()) {
            return "customer";
        }
        String normalized = viewType.trim().toLowerCase();
        return switch (normalized) {
            case "customer", "vip", "employee", "admin" -> normalized;
            default -> "customer";
        };
    }

    private String normalizeRoleName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role name is required");
        }
        return name.trim().toUpperCase(Locale.ROOT);
    }

    private void ensureRole(String name, boolean hasAdminAccess, String viewType) {
        var existing = roleRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            var role = existing.get();
            boolean changed = false;
            if (!name.equals(role.getName())) {
                role.setName(name);
                changed = true;
            }
            if (role.isHasAdminAccess() != hasAdminAccess) {
                role.setHasAdminAccess(hasAdminAccess);
                changed = true;
            }
            String normalizedView = resolveViewType(role.getViewType());
            if (!normalizedView.equals(role.getViewType()) || !normalizedView.equals(viewType)) {
                role.setViewType(viewType);
                changed = true;
            }
            if (changed) {
                roleRepository.save(role);
            }
            return;
        }

        var role = new Role();
        role.setName(name);
        role.setHasAdminAccess(hasAdminAccess);
        role.setViewType(viewType);
        roleRepository.save(role);
    }
}
