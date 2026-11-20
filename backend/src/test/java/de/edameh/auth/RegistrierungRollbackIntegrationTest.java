package de.edameh.auth;


import de.edameh.auth.dto.RegistrierungRequest;
import de.edameh.auth.service.RegistrierungService;
import de.edameh.benutzer.repository.BenutzerRepository;
import de.edameh.benutzer.service.BenutzerService;
import de.edameh.profile.domain.Profil;
import de.edameh.profile.repository.ProfilRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest

public class RegistrierungRollbackIntegrationTest extends AbstractPostgresIntegrationTest  {

    @MockitoBean
    private ProfilRepository profilRepository;

    @Autowired
    private BenutzerRepository benutzerRepository;

    @Autowired
    private RegistrierungService registrierungService;

    @Test
    void fehlerBeimProfilSpeichernRolltBenutzerZurueck(){

        String email = "rollback-" + UUID.randomUUID() + "@example.com";

            when(profilRepository.save(any(Profil.class)))
                    .thenThrow(new DataIntegrityViolationException("simulieren Datenbankfehler"));

        RegistrierungRequest request = new RegistrierungRequest(
                email ,
                "RollbackTest",
                "TestPasswort123",
                "TestPasswort123"
        );

assertThrows(DataIntegrityViolationException.class , () -> registrierungService.registrierung(request));

verify(profilRepository).save(any(Profil.class));


// Benutzer darf nach dem Rollback nicht existieren
        assertFalse(
                benutzerRepository.existsByeMailIgnoreCase(email)
        );

    }





}
