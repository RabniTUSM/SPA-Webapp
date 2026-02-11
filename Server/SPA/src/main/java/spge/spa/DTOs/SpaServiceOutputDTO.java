package spge.spa.DTOs;

public class SpaServiceOutputDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Boolean isVipOnly;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Boolean getVipOnly() {
        return isVipOnly;
    }

    public void setVipOnly(Boolean vipOnly) {
        isVipOnly = vipOnly;
    }
}

