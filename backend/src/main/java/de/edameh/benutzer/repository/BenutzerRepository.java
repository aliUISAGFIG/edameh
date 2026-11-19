package de.edameh.benutzer.repository;

import de.edameh.benutzer.domain.Benutzer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BenutzerRepository extends JpaRepository<Benutzer, Long> {

    boolean existsByeMailIgnoreCase(String eMail);


    List<Benutzer> id(Long id);

    Optional<Benutzer> findByeMailIgnoreCase(String eMail);
}
