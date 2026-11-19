package de.edameh.auth.exception;

public class UngueltigeAnmeldedatenException extends RuntimeException {
    public UngueltigeAnmeldedatenException() {
        super("Email oder Passwort ist falsch.");
    }
}
