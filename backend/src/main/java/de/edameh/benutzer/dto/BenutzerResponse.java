package de.edameh.benutzer.dto;

public record BenutzerResponse(
        Long id,
        String eMail,
        String anzeigename
) {
}
