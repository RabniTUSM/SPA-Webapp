package spge.spa.DTOs;

public class LocationOutputDTO {
    private Long id;
    private String name;
    private String address;
    private Boolean vipServiceAvailable;

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

