package spge.spa.Models.enums;

import java.util.Arrays;

public enum RoleName{
    ROLE_ADMIN,
    ROLE_EMPLOYEE,
    ROLE_CUSTOMER;
    public static RoleName fromString(String value) {
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase("ROLE_" + value)
                        || r.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid role"));
    }
}

