package spge.spa.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;

@Service
public class PriceChartStorageService {

    private final Path priceChartFilePath;

    public PriceChartStorageService(@Value("${spa.price-chart.file-path:./uploads/price-chart.pdf}") String filePath) {
        this.priceChartFilePath = Path.of(filePath).toAbsolutePath().normalize();
    }

    public void save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required");
        }

        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        boolean looksLikePdf = filename.endsWith(".pdf") || contentType.contains("pdf");
        if (!looksLikePdf) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        try {
            Path parent = priceChartFilePath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Files.copy(file.getInputStream(), priceChartFilePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save PDF file");
        }
    }

    public Resource load() {
        if (!Files.exists(priceChartFilePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Price chart PDF is not uploaded yet");
        }
        return new PathResource(priceChartFilePath);
    }
}
