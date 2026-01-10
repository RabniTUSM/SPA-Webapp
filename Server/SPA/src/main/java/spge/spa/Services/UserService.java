package spge.spa.Services;

import org.springframework.stereotype.Service;
import spge.spa.DTOs.AdminUserInputDTO;
import spge.spa.DTOs.CreateAdminDTO;
import spge.spa.DTOs.UserInputDTO;
import spge.spa.DTOs.UserOutputDTO;
import spge.spa.Mappers.UserMapper;
import spge.spa.Repositories.UserRepository;

import java.util.List;

@Service
public class UserService {
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    private final UserMapper userMapper= new UserMapper(userRepository);

    public void createUser(UserInputDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())){
            throw new RuntimeException("Username already exists");
        }
        else
        {
            var user = userMapper.UserDTOtoUser(dto);
            userRepository.save(user);
        }
    }
    public void adminUserSave(AdminUserInputDTO dto){
        if(dto!=null){
            var user = userMapper.AdminDTOtoUser(dto);
            userRepository.save(user);
        }
        else{
            throw new RuntimeException("DTO is null");
        }
    }

    public void createAdmin(CreateAdminDTO dto){
        if(dto!=null){
            var user = userMapper.CreateAdmin(dto);
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
            existingUser = userMapper.UserDTOtoUser(dto);
            userRepository.save(existingUser);
        }
        else{
            throw new RuntimeException("DTO is null");
        }
    }


    public void deleteUserById(Long id){
        if(id!=null) {
            userRepository.deleteUserById(id).orElseThrow(() -> new RuntimeException("User not found"));
        }
        else{
            throw new RuntimeException("ID is null");
        }
    }


}
