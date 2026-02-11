package spge.spa.Services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.RoleInputDTO;
import spge.spa.DTOs.RoleOutputDTO;
import spge.spa.Models.Role;
import spge.spa.Repositories.RoleRepository;

import java.util.List;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public void initializeRoles() {
        if (roleRepository.count() == 0) {
            var userRole = new Role();
            userRole.setName("CUSTOMER");
            userRole.setHasAdminAccess(false);
            roleRepository.save(userRole);

            var adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole.setHasAdminAccess(true);
            roleRepository.save(adminRole);

            var employeeRole = new Role();
            employeeRole.setName("EMPLOYEE");
            employeeRole.setHasAdminAccess(false);
            roleRepository.save(employeeRole);

            var vipRole = new Role();
            vipRole.setName("VIP");
            vipRole.setHasAdminAccess(false);
            roleRepository.save(vipRole);
        }
    }

    public void saveRole(Role role) {
        roleRepository.save(role);
    }

    public Role getRoleByName(String name) {
        return roleRepository.getRoleByName(name)
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
        var role = new Role();
        role.setName(dto.getName());
        role.setHasAdminAccess(dto.isHasAdminAccess());
        role.setDescription(dto.getDescription());
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
        role.setName(dto.getName());
        role.setHasAdminAccess(dto.isHasAdminAccess());
        role.setDescription(dto.getDescription());
        roleRepository.save(role);
    }

    private RoleOutputDTO mapToDTO(Role role) {
        RoleOutputDTO dto = new RoleOutputDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setHasAdminAccess(role.isHasAdminAccess());
        dto.setDescription(role.getDescription());
        return dto;
    }
}


