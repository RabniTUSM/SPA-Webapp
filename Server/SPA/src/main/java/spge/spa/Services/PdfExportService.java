package spge.spa.Services;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spge.spa.Models.SpaService;
import spge.spa.Repositories.SpaServiceRepository;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfExportService {
    @Autowired
    private SpaServiceRepository spaServiceRepository;

    public byte[] generateServicesPdf() throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        // Add title
        document.add(new Paragraph("SPA Services & Prices")
                .setFontSize(24)
                .setTextAlignment(TextAlignment.CENTER)
                .setBold());

        // Create table with 3 columns: Name, Description, Price
        float[] columnWidths = {3, 4, 2};
        Table table = new Table(columnWidths);

        // Add header row
        table.addHeaderCell(new Cell().add(new Paragraph("Service Name").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Price").setBold()));

        // Get all services
        List<SpaService> services = spaServiceRepository.findAll();

        // Add service rows
        for (SpaService service : services) {
            table.addCell(new Cell().add(new Paragraph(service.getName())));
            table.addCell(new Cell().add(new Paragraph(service.getDescription() != null ? service.getDescription() : "N/A")));
            table.addCell(new Cell().add(new Paragraph(String.format("$%.2f", service.getPrice()))));
        }

        document.add(table);
        document.close();

        return outputStream.toByteArray();
    }
}

