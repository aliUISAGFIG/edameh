package de.edameh.auth.service;

import de.edameh.auth.dto.AnmeldungRequest;
import de.edameh.auth.exception.UngueltigeAnmeldedatenException;
import de.edameh.benutzer.domain.Benutzer;
import de.edameh.benutzer.dto.BenutzerResponse;
import de.edameh.benutzer.repository.BenutzerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnmeldungService {

    private final BenutzerRepository benutzerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public BenutzerResponse anmelden(AnmeldungRequest request) {

        Benutzer benutzer = benutzerRepository
                .findByeMailIgnoreCase(request.eMail())
                .orElseThrow(UngueltigeAnmeldedatenException::new);

        if (!passwordEncoder.matches(
                request.passwort(),
                benutzer.getPasswortHash()
        )) {
            throw new UngueltigeAnmeldedatenException();
        }

        return new BenutzerResponse(
                benutzer.getId(),
                benutzer.getEMail(),
                benutzer.getAnzeigename()
        );

    }

}
