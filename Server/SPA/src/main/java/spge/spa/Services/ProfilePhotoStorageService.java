package spge.spa.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import spge.spa.Models.User;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;

@Service
public class ProfilePhotoStorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private final Path photosDirectory;

    public ProfilePhotoStorageService(@Value("${spa.profile-photo.directory-path:./uploads/profile-photos}") String directoryPath) {
        this.photosDirectory = Path.of(directoryPath).toAbsolutePath().normalize();
    }

    public String save(User user, MultipartFile file) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user");
        }
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile photo file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile photo must be 5MB or smaller");
        }

        String extension = resolveAllowedExtension(file);
        String targetFilename = "user-" + user.getId() + "." + extension;
        Path targetPath = photosDirectory.resolve(targetFilename).normalize();

        try {
            Files.createDirectories(photosDirectory);
            if (!targetPath.startsWith(photosDirectory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile photo path");
            }
            deleteOldPhotoIfNeeded(user.getProfilePhotoFilename(), targetFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return targetFilename;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save profile photo");
        }
    }

    public Resource load(String filename) {
        String safeFilename = requireSafeFilename(filename);
        Path filePath = photosDirectory.resolve(safeFilename).normalize();
        if (!filePath.startsWith(photosDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile photo path");
        }
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found");
        }
        return new PathResource(filePath);
    }

    public MediaType resolveMediaType(String filename) {
        String extension = extensionOf(filename);
        return switch (extension) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

    private void deleteOldPhotoIfNeeded(String existingFilename, String nextFilename) throws IOException {
        if (existingFilename == null || existingFilename.isBlank() || existingFilename.equals(nextFilename)) {
            return;
        }
        String safeExistingFilename = requireSafeFilename(existingFilename);
        Path existingPath = photosDirectory.resolve(safeExistingFilename).normalize();
        if (existingPath.startsWith(photosDirectory)) {
            Files.deleteIfExists(existingPath);
        }
    }

    private String requireSafeFilename(String filename) {
        String normalized = filename == null ? "" : filename.trim();
        if (normalized.isBlank() || !normalized.matches("[a-zA-Z0-9._-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile photo filename");
        }
        return normalized;
    }

    private String resolveAllowedExtension(MultipartFile file) {
        String filenameExtension = extensionOf(file.getOriginalFilename());
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (ALLOWED_EXTENSIONS.contains(filenameExtension)) {
            return filenameExtension;
        }
        return switch (contentType) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, or WEBP files are allowed");
        };
    }

    private String extensionOf(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
