package spge.spa.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import spge.spa.Models.User;
import spge.spa.Repositories.UserRepository;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[aby]?\\$\\d\\d\\$[./A-Za-z0-9]{53}$");

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalized = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByUsernameIgnoreCase(normalized)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String storedPassword = user.getPassword() == null ? "" : user.getPassword();
        if (!storedPassword.startsWith("{") && !isBcrypt(storedPassword)) {
            storedPassword = "{noop}" + storedPassword;
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(storedPassword)
                .roles(user.getRole().getName())
                .build();
    }

    private boolean isBcrypt(String password) {
        return BCRYPT_PATTERN.matcher(password).matches();
    }
}
