package spge.spa.Mappers;

import spge.spa.DTOs.AdminUserInputDTO;
import spge.spa.DTOs.CreateAdminDTO;
import spge.spa.DTOs.UserInputDTO;
import spge.spa.DTOs.UserOutputDTO;
import spge.spa.Models.User;
import spge.spa.Models.enums.RoleName;
import spge.spa.Repositories.UserRepository;
import spge.spa.Services.UserService;

public class UserMapper {
    public UserMapper(UserRepository userRepository){
        this.userRepository = userRepository;
    }
    UserRepository userRepository;
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
                return user;
            }
            else {
                throw new IllegalArgumentException("UserInputDTO is null");
            }
    }
    public User AdminDTOtoUser(AdminUserInputDTO dto){
        if(dto!=null) {
            if(!userRepository.existsByUsername(dto.getUsername())) {
                User user = new User();
                if (dto.getUsername() != null) {
                    user.setUsername(dto.getUsername());
                }
                if (dto.getPassword() != null) {
                    user.setPassword(dto.getPassword());
                }
                if (dto.getName() != null) {
                    user.setName(dto.getName());
                }
                if (dto.getEmail() != null) {
                    user.setEmail(dto.getEmail());
                }
                if (dto.getPhone() != null) {
                    user.setPhone(dto.getPhone());
                }
                if (dto.isVipMember()) {
                    user.setVipMember(dto.isVipMember());
                }
                String role = dto.getRole();
                switch (role.toUpperCase()) {
                    case "ADMIN" -> user.setRole(RoleName.ROLE_ADMIN);
                    case "EMPLOYEE" -> user.setRole(RoleName.ROLE_EMPLOYEE);
                    default -> user.setRole(RoleName.ROLE_CUSTOMER);
                }
                return user;
            }
            else{
               User existingUser = userRepository.findByUsername(dto.getUsername())
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
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
            dto.setRole(user.getRole().toString());
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
            user.setRole(RoleName.ROLE_ADMIN);
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
