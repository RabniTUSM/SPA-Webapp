package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.Repositories.UserRepository;

@Service
public class UserService {
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    private final UserRepository userRepository;
}
