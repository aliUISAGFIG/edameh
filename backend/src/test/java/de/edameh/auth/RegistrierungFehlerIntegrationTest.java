package de.edameh.auth;

import de.edameh.auth.dto.RegistrierungRequest;
import de.edameh.auth.service.RegistrierungService;
import de.edameh.benutzer.repository.BenutzerRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class RegistrierungFehlerIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private RegistrierungService registrierungService;

    @Autowired
    private BenutzerRepository benutzerRepository;


    @Test
    void doppelteEmailErhaelt409() throws Exception {

        String email = "duplicate-" + UUID.randomUUID() + "@example.com";

        // Benutzer einmal erfolgreich erstellen
        registrierungService.registrierung(
                new RegistrierungRequest(
                        email,
                        "TestBenutzer",
                        "TestPasswort123",
                        "TestPasswort123"
                )
        );

        long anzahlRepoVorher = benutzerRepository.count();

        Cookie csrf = csrfCookie();
        String json = """
                {
                  "eMail": "%s",
                  "anzeigename": "ZweiterBenutzer",
                  "passwort": "TestPasswort123",
                  "passwortBestaetigung": "TestPasswort123"
                }
                """.formatted(email.toUpperCase(Locale.ROOT));

        mvc.perform(
                        post("/api/registrierung")
                                .cookie(csrf)
                                .header("X-XSRF-TOKEN", csrf.getValue())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"));

        // Kein zweiter Benutzer wurde gespeichert
        assertEquals(anzahlRepoVorher, benutzerRepository.count());

    }
    @Test
    void unterschiedlichePasswoerterErhalten400() throws Exception {

        String email = "mismatch-" + UUID.randomUUID() + "@example.com";
        Cookie csrf = csrfCookie();

        String json = """
                {
                  "eMail": "%s",
                  "anzeigename": "TestBenutzer",
                  "passwort": "TestPasswort123",
                  "passwortBestaetigung": "AnderesPasswort123"
                }
                """.formatted(email);

        mvc.perform(

                post("/api/registrierung")
                        .cookie(csrf)
                        .header("X-XSRF-TOKEN", csrf.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                                                   )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.passwortBestaetigung").exists());

        assertFalse(benutzerRepository.existsByeMailIgnoreCase(email));

    }


    @Test
    void ungueltigeEmailErhaelt400() throws Exception {

        Cookie csrf = csrfCookie();

        String json = """
                {
                  "eMail": "keine-gueltige-email",
                  "anzeigename": "TestBenutzer",
                  "passwort": "TestPasswort123",
                  "passwortBestaetigung": "TestPasswort123"
                }
                """;

        mvc.perform(
                        post("/api/registrierung")
                                .cookie(csrf)
                                .header("X-XSRF-TOKEN", csrf.getValue())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code")
                        .value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.eMail").exists());
    }

    private Cookie csrfCookie() throws Exception {

        MvcResult result = mvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie cookie =
                result.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(cookie);
        return cookie;
    }


}
