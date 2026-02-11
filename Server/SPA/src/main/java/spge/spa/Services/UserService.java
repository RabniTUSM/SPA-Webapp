package spge.spa.Services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import spge.spa.DTOs.AdminUserInputDTO;
import spge.spa.DTOs.CreateAdminDTO;
import spge.spa.DTOs.UserInputDTO;
import spge.spa.DTOs.UserOutputDTO;
import spge.spa.Mappers.UserMapper;
import spge.spa.Models.User;
import spge.spa.Repositories.UserRepository;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
    }

    public void createUser(UserInputDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())){
            throw new RuntimeException("Username already exists");
        }
        else
        {
            var user = userMapper.UserDTOtoUser(dto);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
        }
    }
    public void adminUserSave(AdminUserInputDTO dto){
        if(dto!=null){
            User appliedUser;
            if(userRepository.existsByUsername(dto.getUsername())){
                appliedUser = userRepository.findByUsername(dto.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found"));
            }
            else{
                appliedUser = new User();
            }
            var user = userMapper.AdminDTOtoUser(dto,appliedUser);
            userRepository.save(user);
        }
        else{
            throw new RuntimeException("DTO is null");
        }
    }

    public void createAdmin(CreateAdminDTO dto){
        if(dto!=null){
            var user = userMapper.CreateAdmin(dto);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
        }
    }

    public UserOutputDTO getUserByUsername(String username){
        if(username!=null){
            var user= userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return userMapper.UserToOutputDTO(user);
        }
        else{
            throw new RuntimeException("Username is null");
        }
    }

    public List<UserOutputDTO> getAllUsers(){
        var users = userRepository.findAll();
        return users.stream()
                .map(userMapper::UserToOutputDTO)
                .toList();
    }

    public void updateUser(UserInputDTO dto){
        if(dto!=null){
            var existingUser = userRepository.findByUsername(dto.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            userMapper.updateUserFromDTO(existingUser, dto);
            if(dto.getPassword()!=null){
                existingUser.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            userRepository.save(existingUser);
        }
        else{
            throw new RuntimeException("DTO is null");
        }
    }


    public void deleteUserById(Long id){
        if(id!=null) {
            userRepository.deleteById(id);
        }
        else{
            throw new RuntimeException("ID is null");
        }
    }


}
