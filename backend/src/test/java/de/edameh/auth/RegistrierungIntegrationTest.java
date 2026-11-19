package de.edameh.auth;


import jakarta.servlet.http.Cookie;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("local")
public class RegistrierungIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Test
        void registrierungMeldetBenutzerAutomatischAn() throws Exception {
        String email = "integration-" + java.util.UUID.randomUUID() + "@example.com";

        MvcResult csrfResult = mvc.perform(
                get("/api/csrf"))
                .andExpect(status().isOk()).andReturn();

        Cookie csrfcookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(csrfcookie);

        String json = """
                {
                  "eMail": "%s",
                  "anzeigename": "TestBenutzer",
                  "passwort": "TestPasswort123",
                  "passwortBestaetigung": "TestPasswort123"
                }
                """.formatted(email);

        MvcResult registrierung  = mvc.perform(
                        post("/api/registrierung")
                                .cookie(csrfcookie)
                                .header("X-XSRF-TOKEN", csrfcookie.getValue())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eMail").value(email))
                .andReturn();


        MockHttpSession session = (MockHttpSession) registrierung.getRequest().getSession(false);
        assertNotNull(session);

        mvc.perform(get("/api/benutzer/ich")
                .session(session))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.eMail").value(email));

    }
    @Test
    void registrierungOhneCsrfErhaelt403() throws Exception {

        mvc.perform(
                post("/api/registrierung")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
        )
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.code").value("FORBIDDEN"));

    }

    @Test
    void benutzerOhneSessionErhaelt401() throws Exception {

        mvc.perform(
                        get("/api/benutzer/ich")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void abmeldungOhneSessionErhaelt401() throws Exception {
        // 1. CSRF-Token vom echten Endpoint holen
        MvcResult csrfResult = mvc.perform(
                        get("/api/csrf")
                )
                .andExpect(status().isOk())
                .andReturn();

        // 2. CSRF-Cookie aus der Antwort lesen
        Cookie csrfCookie =
                csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(csrfCookie);

        // 3. Logout ohne Anmeldung, aber mit gültigem CSRF
        mvc.perform(
                        post("/api/abmeldung")
                                .cookie(csrfCookie)
                                .header("X-XSRF-TOKEN", csrfCookie.getValue())
                )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void abmeldungOhneCsrfErhaelt403() throws Exception {
        mvc.perform(post("/api/abmeldung")).andExpect(status().isForbidden());

    }




}
