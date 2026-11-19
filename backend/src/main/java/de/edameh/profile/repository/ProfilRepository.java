package de.edameh.profile.repository;

import de.edameh.profile.domain.Profil;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfilRepository extends JpaRepository<Profil,Long> {
}
