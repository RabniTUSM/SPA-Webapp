package spge.spa.DTOs;

import jakarta.validation.constraints.NotBlank;

public class LocationInputDTO {
    @NotBlank
    private String name;
    private String address;
    private Boolean vipServiceAvailable;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getVipServiceAvailable() {
        return vipServiceAvailable;
    }

    public void setVipServiceAvailable(Boolean vipServiceAvailable) {
        this.vipServiceAvailable = vipServiceAvailable;
    }
}

