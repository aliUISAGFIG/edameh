package de.edameh.benutzer.repository;

import de.edameh.benutzer.domain.Bentuzer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BenutzerRepository extends JpaRepository<Bentuzer , Long> {

    boolean existsByEMailIgnoreCase(String Email);



}
