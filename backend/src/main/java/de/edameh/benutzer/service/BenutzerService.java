package de.edameh.benutzer.service;

import de.edameh.benutzer.domain.Benutzer;
import de.edameh.benutzer.dto.BenutzerResponse;
import de.edameh.benutzer.repository.BenutzerRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BenutzerService {
private final BenutzerRepository benutzerRepository;

@Transactional(readOnly = true) //یعنی این Method صرفاً برای خواندن اطلاعات از Database طراحی شده.
 public BenutzerResponse findeNachId(Long benutzerid){
       Benutzer benutzer = benutzerRepository.findById(benutzerid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Benutzer nicht mehr vorhanden."));

       return new BenutzerResponse(
                benutzer.getId() ,
                benutzer.getEMail() ,
                benutzer.getAnzeigename());

    }

}
