package de.edameh.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrierungRequest(
        @NotBlank
        @Email
        @Size(max = 254)
        String eMail,

        @NotBlank
        @Size(min = 3, max = 50)
        String anzeigename,

        @NotBlank
        @Size(min = 8, max = 100)
        String passwort,

        @NotBlank
        @Size(min = 8, max = 100)
        String passwortBestaetigung
) {

}
