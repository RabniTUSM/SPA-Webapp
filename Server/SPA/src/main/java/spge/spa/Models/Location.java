package spge.spa.Models;

import jakarta.persistence.*;

@Entity
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column
    private String address;
    @Column(nullable = false)
    private Boolean vipServiceAvailable;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String locationName) {
        this.name = locationName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String locationAddress) {
        this.address = locationAddress;
    }

    public Boolean getVipServiceAvailable() {
        return vipServiceAvailable;
    }

    public void setVipServiceAvailable(Boolean vipServiceAvailable) {
        this.vipServiceAvailable = vipServiceAvailable;
    }
}
