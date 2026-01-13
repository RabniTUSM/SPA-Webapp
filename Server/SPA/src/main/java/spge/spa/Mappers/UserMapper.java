package spge.spa.Mappers;

import org.springframework.stereotype.Component;
import spge.spa.DTOs.AdminUserInputDTO;
import spge.spa.DTOs.CreateAdminDTO;
import spge.spa.DTOs.UserInputDTO;
import spge.spa.DTOs.UserOutputDTO;
import spge.spa.Models.User;
import spge.spa.Services.RoleService;

@Component
public class UserMapper {
    private final RoleService roleService;
    public UserMapper(RoleService roleService) {
        this.roleService = roleService;
    }
    public User UserDTOtoUser(UserInputDTO dto) {
            if(dto!=null) {
                User user = new User();
                if(dto.getUsername()!=null) {
                    user.setUsername(dto.getUsername());
                }
                if(dto.getPassword()!=null) {
                    user.setPassword(dto.getPassword());
                }
                if(dto.getName()!=null){
                user.setName(dto.getName());
                }
                if(dto.getEmail()!=null) {
                    user.setEmail(dto.getEmail());
                }
                if(dto.getPhone()!=null) {
                    user.setPhone(dto.getPhone());
                }
                user.setRole(roleService.getRoleByName("CUSTOMER"));
                return user;
            }
            else {
                throw new IllegalArgumentException("UserInputDTO is null");
            }
    }
    public User AdminDTOtoUser(AdminUserInputDTO dto, User user) {
        if(dto!=null) {
            if (dto.getUsername() != null) user.setUsername(dto.getUsername());
            if (dto.getPassword() != null) user.setPassword(dto.getPassword());
            if (dto.getName() != null) user.setName(dto.getName());
            if (dto.getEmail() != null) user.setEmail(dto.getEmail());
            if (dto.getPhone() != null) user.setPhone(dto.getPhone());
            if(user.getVipMember() || dto.isVipMember()) {
                user.setVipMember(true);
            }
            if (dto.getRole() != null) {
                user.setRole(roleService.getRoleByName(dto.getRole()));
            }
            return user;
        }
        else{
            throw new IllegalArgumentException("AdminUserInputDTO is null");
        }
    }
    public UserOutputDTO UserToOutputDTO(User user){
        if(user!=null) {
            UserOutputDTO dto = new UserOutputDTO();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setVipMember(user.getVipMember());
             dto.setRole(user.getRole().getName());
            return dto;
        }
        else{
            throw new IllegalArgumentException("User is null");
        }
    }

    public User CreateAdmin(CreateAdminDTO dto){
        if(dto!=null) {
            User user = new User();
            if(dto.getUsername()!=null) {
                user.setUsername(dto.getUsername());
            }
            if(dto.getPassword()!=null) {
                user.setPassword(dto.getPassword());
            }
            if(dto.getName()!=null) {
                user.setName(dto.getName());
            }
            if(dto.getEmail()!=null) {
                user.setEmail(dto.getEmail());
            }
            if(dto.getPhone()!=null) {
                user.setPhone(dto.getPhone());
            }
            user.setRole(roleService.getRoleByName("ADMIN"));
            return user;
        }
        else{
            throw new IllegalArgumentException("CreateAdminDTO is null");
        }
    }

    public User updateUserFromDTO(User existingUser, UserInputDTO dto){
        if(existingUser!=null && dto!=null) {
            if(dto.getUsername()!=null) {
                existingUser.setUsername(dto.getUsername());
            }
            if(dto.getPassword()!=null) {
                existingUser.setPassword(dto.getPassword());
            }
            if(dto.getName()!=null){
                existingUser.setName(dto.getName());
            }
            if(dto.getEmail()!=null) {
                existingUser.setEmail(dto.getEmail());
            }
            if(dto.getPhone()!=null) {
                existingUser.setPhone(dto.getPhone());
            }
            return existingUser;
        }
        else{
            throw new IllegalArgumentException("Existing user or DTO is null");
        }
    }
}
