package spge.spa.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SpaServiceInputDTO {
    @NotBlank
    private String name;
    private String description;
    @NotNull
    private Double price;
    @NotNull
    private Boolean isVipOnly;

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

