package spge.spa.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spge.spa.Models.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role,Long> {
}
