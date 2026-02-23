package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.Role;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role,Long> {
    Optional< Role> getRoleByName(String name);
    Optional<Role> findByNameIgnoreCase(String name);
    Boolean existsByNameIgnoreCase(String name);
}
