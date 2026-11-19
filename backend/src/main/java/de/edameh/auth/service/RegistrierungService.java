package de.edameh.auth.service;


import de.edameh.auth.dto.RegistrierungRequest;
import de.edameh.auth.exception.EmailBereitsRegistriertException;
import de.edameh.auth.exception.PasswortBestaetigungException;
import de.edameh.benutzer.domain.Benutzer;
import de.edameh.benutzer.dto.BenutzerResponse;
import de.edameh.benutzer.repository.BenutzerRepository;
import de.edameh.profile.domain.Profil;
import de.edameh.profile.repository.ProfilRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrierungService {

    private final BenutzerRepository benutzerRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfilRepository profilRepository;

    @Transactional // نمیزاره نصف متد اجرا بشه و نصف نشه و کل متود رو یک عملیات واحد میکنه
    public BenutzerResponse registrierung(RegistrierungRequest registergRequest) {

        if (!registergRequest.passwort().equals(registergRequest.passwortBestaetigung())) {
            throw new PasswortBestaetigungException();
        }
        //wenn das E-Mail schon exsistiert wird Exception geworfen
        if (benutzerRepository.existsByeMailIgnoreCase(registergRequest.eMail())) {
            throw new EmailBereitsRegistriertException();
        }

        String hashpaswort =
                passwordEncoder.encode(registergRequest.passwort());

        Benutzer benutzer = new Benutzer(registergRequest.eMail(), hashpaswort, registergRequest.anzeigename());
        Benutzer savedBenutzer = benutzerRepository.save(benutzer);

        Profil profil = new Profil(savedBenutzer);
        profilRepository.save(profil);

        return new BenutzerResponse(
                savedBenutzer.getId(),
                savedBenutzer.getEMail(),
                savedBenutzer.getAnzeigename()
        );
    }


}
