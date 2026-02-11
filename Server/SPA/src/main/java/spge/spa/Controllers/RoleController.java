package spge.spa.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spge.spa.DTOs.RoleInputDTO;
import spge.spa.DTOs.RoleOutputDTO;
import spge.spa.Services.RoleService;

import java.util.List;

@RestController
@RequestMapping("/SPA/Role")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @PostMapping
    public ResponseEntity<String> createRole(@RequestBody RoleInputDTO roleInputDTO) {
        roleService.createRole(roleInputDTO);
        return ResponseEntity.ok("Role created successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleOutputDTO> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleByIdDTO(id));
    }

    @GetMapping
    public ResponseEntity<List<RoleOutputDTO>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRolesDTO());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateRole(@PathVariable Long id, @RequestBody RoleInputDTO roleInputDTO) {
        roleService.updateRole(id, roleInputDTO);
        return ResponseEntity.ok("Role updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully");
    }
}

