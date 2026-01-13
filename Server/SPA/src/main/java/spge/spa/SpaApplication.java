package spge.spa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import spge.spa.Services.RoleService;

@SpringBootApplication
public class SpaApplication {
    public static void main(String[] args) {
        RoleService roleService = SpringApplication.run(SpaApplication.class, args).getBean(RoleService.class);
        roleService.initializeRoles();
    }

}
