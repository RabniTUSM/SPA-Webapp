package spge.spa.Models;

import jakarta.persistence.*;

@Entity
@Table(name="services")
public class SpaService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column
    private String description;
    @Column
    private Double price;
    @Column(nullable = false)
    private Boolean isVipOnly;


    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String serviceName) {
        this.name = serviceName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String serviceDescription) {
        this.description = serviceDescription;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double servicePrice) {
        this.price = servicePrice;
    }

    public Boolean getVipOnly() {
        return isVipOnly;
    }

    public void setVipOnly(Boolean vipOnly) {
        isVipOnly = vipOnly;
    }
}
