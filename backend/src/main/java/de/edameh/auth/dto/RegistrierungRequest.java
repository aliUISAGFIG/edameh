package de.edameh.auth.dto;

public record RegistrierungRequest(String eMail, String anzeigename ,
                                   String passwort,
                                   String passwortBestaetigung) {



}
