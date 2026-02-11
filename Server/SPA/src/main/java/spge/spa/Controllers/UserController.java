package spge.spa.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spge.spa.DTOs.AdminUserInputDTO;
import spge.spa.DTOs.CreateAdminDTO;
import spge.spa.DTOs.UserInputDTO;
import spge.spa.Services.UserService;

@RestController
@RequestMapping("/User")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserInputDTO user) {
        userService.createUser(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/admin")
    public ResponseEntity<String> createAdmin(@RequestBody CreateAdminDTO admin) {
        userService.createAdmin(admin);
        return ResponseEntity.ok("Admin created successfully");
    }

    @PostMapping("/admin/user")
    public ResponseEntity<String> adminSaveUser(@RequestBody AdminUserInputDTO adminUserDTO) {
        userService.adminUserSave(adminUserDTO);
        return ResponseEntity.ok("User saved by admin successfully");
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/allUsers")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{username}")
    public ResponseEntity<String> updateUser(@PathVariable String username, @RequestBody UserInputDTO user) {
        user.setUsername(username);
        userService.updateUser(user);
        return ResponseEntity.ok("User updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
