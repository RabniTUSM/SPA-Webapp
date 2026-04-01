package spge.spa.Services;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.DTOs.AdminUserInputDTO;
import spge.spa.DTOs.CreateAdminDTO;
import spge.spa.DTOs.UserInputDTO;
import spge.spa.DTOs.UserOutputDTO;
import spge.spa.Mappers.UserMapper;
import spge.spa.Models.User;
import spge.spa.Repositories.UserRepository;
import spge.spa.Repositories.RoleRepository;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ProfilePhotoStorageService profilePhotoStorageService;


    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            ProfilePhotoStorageService profilePhotoStorageService
    ) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.profilePhotoStorageService = profilePhotoStorageService;
    }

    public void createUser(UserInputDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User payload is required");
        }

        String username = requireNormalizedUsername(dto.getUsername());
        String email = requireNormalizedEmail(dto.getEmail());

        if (userRepository.existsByUsernameIgnoreCase(username)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        var user = userMapper.UserDTOtoUser(dto);
        user.setUsername(username);
        user.setEmail(email);
        user.setName(normalizeText(user.getName()));
        user.setPhone(normalizeText(user.getPhone()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        saveUser(user);
    }

    public void adminUserSave(AdminUserInputDTO dto){
        if(dto == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User payload is required");
        }

        String normalizedUsername = requireNormalizedUsername(dto.getUsername());
        User appliedUser = userRepository.findByUsernameIgnoreCase(normalizedUsername).orElseGet(User::new);

        var user = userMapper.AdminDTOtoUser(dto, appliedUser);
        user.setUsername(normalizedUsername);
        user.setEmail(requireNormalizedEmail(user.getEmail()));
        user.setName(normalizeText(user.getName()));
        user.setPhone(normalizeText(user.getPhone()));

        ensureUniqueUserData(user, appliedUser.getId());

        if(dto.getPassword()!=null && !dto.getPassword().isBlank()){
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        saveUser(user);
    }

    public void createAdmin(CreateAdminDTO dto){
        if(dto == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin payload is required");
        }

        String username = requireNormalizedUsername(dto.getUsername());
        String email = requireNormalizedEmail(dto.getEmail());

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        var user = userMapper.CreateAdmin(dto);
        user.setUsername(username);
        user.setEmail(email);
        user.setName(normalizeText(user.getName()));
        user.setPhone(normalizeText(user.getPhone()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        saveUser(user);
    }

    public void createBootstrapAdmin(CreateAdminDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin payload is required");
        }

        var adminRole = roleRepository.findByNameIgnoreCase("ADMIN")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ADMIN role not found"));

        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() != null && adminRole.getId().equals(user.getRole().getId()));

        if (adminExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Admin already exists");
        }

        createAdmin(dto);
    }

    public UserOutputDTO getUserByUsername(String username){
        String normalizedUsername = requireNormalizedUsername(username);
        var user= userRepository.findByUsernameIgnoreCase(normalizedUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return userMapper.UserToOutputDTO(user);
    }

    public List<UserOutputDTO> getAllUsers(){
        var users = userRepository.findAll();
        return users.stream()
                .map(userMapper::UserToOutputDTO)
                .toList();
    }

    public void updateUser(UserInputDTO dto){
        if(dto == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User payload is required");
        }

        String normalizedUsername = requireNormalizedUsername(dto.getUsername());
        var existingUser = userRepository.findByUsernameIgnoreCase(normalizedUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userMapper.updateUserFromDTO(existingUser, dto);
        existingUser.setUsername(normalizedUsername);
        existingUser.setEmail(requireNormalizedEmail(existingUser.getEmail()));
        existingUser.setName(normalizeText(existingUser.getName()));
        existingUser.setPhone(normalizeText(existingUser.getPhone()));
        if(dto.getPassword()!=null && !dto.getPassword().isBlank()){
            existingUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        ensureUniqueUserData(existingUser, existingUser.getId());
        saveUser(existingUser);
    }


    public void deleteUserById(Long id){
        if(id!=null) {
            userRepository.deleteById(id);
        }
        else{
            throw new RuntimeException("ID is null");
        }
    }

    public void uploadProfilePhoto(String targetUsername, MultipartFile file, String principalUsername) {
        if (principalUsername == null || principalUsername.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authentication required");
        }

        String requesterUsername = principalUsername.trim().toLowerCase(Locale.ROOT);
        if ("guest".equals(requesterUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Guest users cannot upload profile photos");
        }

        String normalizedTargetUsername = requireNormalizedUsername(targetUsername);
        var requester = userRepository.findByUsernameIgnoreCase(requesterUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Requester not found"));
        boolean isAdmin = requester.getRole() != null && "ADMIN".equalsIgnoreCase(requester.getRole().getName());
        boolean isSelf = requesterUsername.equals(normalizedTargetUsername);
        if (!isAdmin && !isSelf) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can upload only your own profile photo");
        }

        var targetUser = userRepository.findByUsernameIgnoreCase(normalizedTargetUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String targetRole = targetUser.getRole() == null ? "" : targetUser.getRole().getName();
        if (!"EMPLOYEE".equalsIgnoreCase(targetRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile photos can be uploaded only for employees");
        }

        String filename = profilePhotoStorageService.save(targetUser, file);
        targetUser.setProfilePhotoFilename(filename);
        saveUser(targetUser);
    }

    public ProfilePhotoPayload loadProfilePhoto(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String filename = user.getProfilePhotoFilename();
        if (filename == null || filename.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found");
        }
        Resource resource = profilePhotoStorageService.load(filename);
        MediaType mediaType = profilePhotoStorageService.resolveMediaType(filename);
        return new ProfilePhotoPayload(resource, mediaType);
    }


    private void ensureUniqueUserData(User user, Long currentUserId) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            userRepository.findByUsernameIgnoreCase(user.getUsername()).ifPresent(existing -> {
                if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
                }
            });
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            userRepository.findByEmailIgnoreCase(user.getEmail()).ifPresent(existing -> {
                if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
                }
            });
        }
    }

    private void saveUser(User user) {
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw mapUniqueViolation(ex);
        }
    }

    private ResponseStatusException mapUniqueViolation(DataIntegrityViolationException ex) {
        var mostSpecificCause = ex.getMostSpecificCause();
        var message = mostSpecificCause != null ? mostSpecificCause.getMessage() : ex.getMessage();
        var lowerMessage = message == null ? "" : message.toLowerCase(Locale.ROOT);

        if (lowerMessage.contains("email")) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        if (lowerMessage.contains("username")) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        return new ResponseStatusException(HttpStatus.CONFLICT, "User with provided data already exists");
    }

    private String requireNormalizedUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        return username.trim().toLowerCase(Locale.ROOT);
    }

    private String requireNormalizedEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }

    public record ProfilePhotoPayload(Resource resource, MediaType mediaType) {}

}
