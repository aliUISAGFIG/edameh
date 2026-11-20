package de.edameh.auth;

import de.edameh.benutzer.domain.Benutzer;
import de.edameh.benutzer.repository.BenutzerRepository;
import de.edameh.common.dto.ApiFehlerResponse;
import de.edameh.common.exceptions.GlobalExceptionHandler;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.Locale;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class BenutzerEmailUniqueIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private BenutzerRepository benutzerRepo;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;



    /**
     * Prüft, ob PostgreSQL eine zweite E-Mail-Adresse ablehnt
     * die sich nur durch Groß- und Kleinschreibung unterscheidet.
     * Dabei wird das echte BenutzerRepository verwendet.
     */
    @Test
    void emailUniqueIndexVerhindertDoppelteEmail() {

        String email = "unique-" + UUID.randomUUID() + "@example.com";

        Benutzer erster = new Benutzer(
                email,
                "TestHash",
                "ErsterBenutzer"
        );


        benutzerRepo.saveAndFlush(erster);


        Benutzer zweiter = new Benutzer(
                email.toUpperCase(Locale.ROOT),
                "TestHash",
                "ZweiterBenutzer"
        );

        // Prüfen, ob PostgreSQL den zweiten INSERT mit einem Fehler ablehnt
        assertThrows(
                DataIntegrityViolationException.class,
                () -> benutzerRepo.saveAndFlush(zweiter)
        );
    }


    @Test
    void andererDatenbankfehlerErhaeltNicht409() {
        SQLException sqlFehler =
                new SQLException("Foreign-Key-Fehler", "23503");

        ConstraintViolationException hibernateFehler =
                new ConstraintViolationException(
                        "Simulierter Foreign-Key-Fehler",
                        sqlFehler,
                        "fk_profile_benutzer"
                );

        DataIntegrityViolationException exception =
                new DataIntegrityViolationException(
                        "Datenbankfehler",
                        hibernateFehler
                );

        MockHttpServletRequest request =
                new MockHttpServletRequest(
                        "POST",
                        "/api/registrierung"
                );

        ResponseEntity<ApiFehlerResponse> antwort =
                globalExceptionHandler.datenbankFehler(
                        exception,
                        request
                );

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                antwort.getStatusCode()
        );

        assertNotNull(antwort.getBody());
        assertEquals("DATABASE_ERROR", antwort.getBody().code());



    }
}
