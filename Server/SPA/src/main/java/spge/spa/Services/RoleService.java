package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.Repositories.RoleRepository;

@Service
public class RoleService {
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    private final RoleRepository roleRepository;
}
