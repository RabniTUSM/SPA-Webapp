package spge.spa.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import spge.spa.Security.JwtUtil;
import spge.spa.Repositories.UserRepository;

@RestController
@RequestMapping("/SPA/User")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        var user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().getName());
        return ResponseEntity.ok(new JwtResponse(token, user.getRole().getName()));
    }

    public static class LoginRequest {
        private String username;
        private String password;
        // getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class JwtResponse {
        private String token;
        private String role;
        public JwtResponse(String token, String role) {
            this.token = token;
            this.role = role;
        }
        public String getToken() { return token; }
        public String getRole() { return role; }
    }

    @PostMapping("/guest-login")
    public ResponseEntity<JwtResponse> guestLogin() {
        // Create a guest token with CUSTOMER role (no persistence)
        String guestToken = jwtUtil.generateToken("guest_" + System.currentTimeMillis(), "CUSTOMER");
        return ResponseEntity.ok(new JwtResponse(guestToken, "CUSTOMER"));
    }
}
