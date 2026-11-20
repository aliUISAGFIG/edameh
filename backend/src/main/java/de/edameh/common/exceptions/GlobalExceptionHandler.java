package de.edameh.common.exceptions;

import de.edameh.auth.exception.EmailBereitsRegistriertException;
import de.edameh.auth.exception.PasswortBestaetigungException;
import de.edameh.auth.exception.UngueltigeAnmeldedatenException;
import de.edameh.common.dto.ApiFehlerResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailBereitsRegistriertException.class)
    public ResponseEntity<ApiFehlerResponse> emailBereitsRegistriert(
            EmailBereitsRegistriertException exception,
            HttpServletRequest request
    ) {

        return fehler(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", exception.getMessage(), request, Map.of());
    }


    @ExceptionHandler(PasswortBestaetigungException.class)
    public ResponseEntity<ApiFehlerResponse> passwortBestaetigung(
            PasswortBestaetigungException exception,
            HttpServletRequest request
    ) {

        return fehler(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", exception.getMessage(), request, Map.of("passwortBestaetigung", exception.getMessage()));
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiFehlerResponse> validation(
            MethodArgumentNotValidException exception, // این اکسپشن اسپرینک است و وقتی مقدایر @Valid رعایت نشده باشن و با 400 یعنی bad request جواب داده میشه
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(
                        error.getField(),
                        error.getDefaultMessage()
                )
        );

        return fehler(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Die Eingabedaten sind ungültig.", request, fieldErrors);

    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiFehlerResponse> ungueltigesJson(
            HttpMessageNotReadableException exception,
            HttpServletRequest request

    ) {

        return fehler(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Ungültiger JSON-Request.", request, Map.of());

    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiFehlerResponse> httpFehler(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {
        HttpStatusCode status = exception.getStatusCode();

        String code = switch (status.value()) {
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 404 -> "NOT_FOUND";
            case 409 -> "CONFLICT";
            default -> "HTTP_ERROR";
        };

        return fehler(
                status,
                code,
                exception.getReason() != null
                        ? exception.getReason()
                        : "Die Anfrage konnte nicht verarbeitet werden.",
                request,
                Map.of()
        );
    }

    @ExceptionHandler(UngueltigeAnmeldedatenException.class)
    public ResponseEntity<ApiFehlerResponse> ungueltigeAnmeldung(
            UngueltigeAnmeldedatenException exception,
            HttpServletRequest request
    ) {
        return fehler(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class) //این Exception معمولاً وقتی اتفاق می‌افته که عملیات دیتابیس یکی از محدودیت‌هاش رو نقض کنه
    public ResponseEntity<ApiFehlerResponse> datenbankFehler(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        Throwable ursache = exception;

        while (ursache != null) {

            if (ursache instanceof ConstraintViolationException constraint) { //این Exception یعنی یکی از محدودیت‌های دیتابیس نقض شده.

                String constraintName = constraint.getConstraintName();

                boolean emailConstraint =
                        "uq_benutzer_email_lower".equals(constraintName)
                                || "benutzer_e_mail_key".equals(constraintName);

                boolean uniqueViolation = "23505".equals(
                        constraint.getSQLException().getSQLState()
                );

                if (emailConstraint && uniqueViolation) {
                    return fehler(
                            HttpStatus.CONFLICT,
                            "EMAIL_ALREADY_EXISTS",
                            "Diese E-Mail-Adresse ist bereits registriert.",
                            request,
                            Map.of()
                    );
                }
            }

            ursache = ursache.getCause(); //next
        }

        log.error("Unerwarteter Datenbankfehler", exception);

        return fehler(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "DATABASE_ERROR",
                "Ein interner Datenbankfehler ist aufgetreten.",
                request,
                Map.of()
        );
    }



    private ResponseEntity<ApiFehlerResponse> fehler(
            HttpStatusCode status,
            String code,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        ApiFehlerResponse body = new ApiFehlerResponse(
                Instant.now(),
                status.value(),
                code,
                message,
                request.getRequestURI(),
                fieldErrors
        );

        return ResponseEntity.status(status).body(body);
    }


}
