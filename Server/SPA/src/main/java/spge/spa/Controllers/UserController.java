package spge.spa.Controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    @PostMapping("/bootstrap-admin")
    public ResponseEntity<String> bootstrapAdmin(@RequestBody CreateAdminDTO admin) {
        userService.createBootstrapAdmin(admin);
        return ResponseEntity.ok("Bootstrap admin created successfully");
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

    @PostMapping(value = "/{username}/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadProfilePhoto(
            @PathVariable String username,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        String principalUsername = authentication == null ? null : authentication.getName();
        userService.uploadProfilePhoto(username, file, principalUsername);
        return ResponseEntity.ok("Profile photo uploaded successfully");
    }

    @GetMapping("/profile-photo/{userId}")
    public ResponseEntity<?> getProfilePhoto(@PathVariable Long userId) {
        var payload = userService.loadProfilePhoto(userId);
        return ResponseEntity.ok()
                .contentType(payload.mediaType())
                .body(payload.resource());
    }
}
