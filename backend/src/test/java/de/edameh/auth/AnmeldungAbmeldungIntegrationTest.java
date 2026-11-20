package de.edameh.auth;
import de.edameh.auth.dto.RegistrierungRequest;
import de.edameh.auth.service.RegistrierungService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AnmeldungAbmeldungIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private RegistrierungService registrierungService;

    @Test
    void anmeldungUndAbmeldungFunktionieren() throws Exception {

        String email = "login-" + UUID.randomUUID() + "@example.com";
        String passwort = "TestPasswort123";

        // 1. Benutzer für den Test erstellen
        registrierungService.registrierung(
                new RegistrierungRequest(
                        email,
                        "TestBenutzer",
                        passwort,
                        passwort
                )
        );

        // 2. CSRF-Token vor der Anmeldung holen
        MvcResult csrfResult = mvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie csrfCookie =
                csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(csrfCookie);

        String anmeldungJson = """
                {
                  "eMail": "%s",
                  "passwort": "%s"
                }
                """.formatted(email, passwort);

        // 3. Mit echtem Passwort anmelden
        MvcResult anmeldungResult = mvc.perform(
                        post("/api/anmeldung")
                                .cookie(csrfCookie)
                                .header("X-XSRF-TOKEN", csrfCookie.getValue())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(anmeldungJson)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eMail").value(email))
                .andReturn();
//Session ساخته‌شده هنگام Login رو می‌گیریم تا در درخواست‌های بعدی ازش استفاده کنیم.
        MockHttpSession jsessionId = (MockHttpSession) anmeldungResult.getRequest().getSession(false);

        assertNotNull(jsessionId);

        // 4. Geschützten Endpoint mit Session aufrufen
        mvc.perform(
                        get("/api/benutzer/ich")
                                .session(jsessionId)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eMail").value(email));

        // 5. Frischen CSRF-Token nach der Anmeldung holen
        MvcResult csrfNachAnmeldung = mvc.perform(
                        get("/api/csrf")
                                .session(jsessionId)
                )
                .andExpect(status().isOk())
                .andReturn();

        Cookie logoutCsrfCookie =
                csrfNachAnmeldung.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(logoutCsrfCookie);

        // 6. Abmelden
        MvcResult logoutResult  = mvc.perform(
                        post("/api/abmeldung")
                                .session(jsessionId)
                                .cookie(logoutCsrfCookie)
                                .header(
                                        "X-XSRF-TOKEN",
                                        logoutCsrfCookie.getValue()
                                )
                )
                .andExpect(status().isNoContent())
                .andReturn();

        // 7. Die alte Session muss nach abmeldeung ungültig sein
        assertTrue(jsessionId.isInvalid());

        //der alte CSRF cookie muss gelöscht werden
        Cookie geloeschterCsrfCokie =
                logoutResult.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(geloeschterCsrfCokie);
        assertEquals(0 , geloeschterCsrfCokie.getMaxAge());


        // 9. Nach Logout einen neuen CSRF-Token holen
        MvcResult csrfNachLogout = mvc.perform(
                        get("/api/csrf")
                )
                .andExpect(status().isOk())
                .andReturn();

        Cookie neuerCsrfCookie =
                csrfNachLogout.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(neuerCsrfCookie);

        // Der neue Token darf nicht der alte sein
        assertNotEquals(
                logoutCsrfCookie.getValue(),
                neuerCsrfCookie.getValue()
        );

        // 8. Ohne gültige Session kein Zugriff
        mvc.perform(get("/api/benutzer/ich"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void falschesPasswortErhaelt401() throws Exception {

        String email = "login-" + UUID.randomUUID() + "@example.com";

        registrierungService.registrierung(
                new RegistrierungRequest(
                        email,
                        "TestBenutzer",
                        "RichtigesPasswort123",
                        "RichtigesPasswort123"
                )
        );

        MvcResult csrfResult = mvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie csrfCookie =
                csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(csrfCookie);

        String anmeldungJson = """
                {
                  "eMail": "%s",
                  "passwort": "FalschesPasswort123"
                }
                """.formatted(email);

        mvc.perform(
                   post("/api/anmeldung")
                         .cookie(csrfCookie)
                         .header("X-XSRF-TOKEN", csrfCookie.getValue())
                         .contentType(MediaType.APPLICATION_JSON)
                         .content(anmeldungJson)
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        jsonPath("$.code").value("INVALID_CREDENTIALS")
                );
    }



}
