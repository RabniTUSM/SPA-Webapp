package spge.spa.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserInputDTO {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;
    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
    @NotBlank
    @Size(min = 3, max = 100)
    private String name;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Size(min = 10, max = 10)
    private String phone;
}
