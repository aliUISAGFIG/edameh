package de.edameh.profile.domain;


import de.edameh.benutzer.domain.Benutzer;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Profil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "benutzer_id", nullable = false, unique = true
    )
    private Benutzer benutzer;


    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;


    @Column(name = "aktualisiert_am", nullable = false)
    private LocalDateTime aktualisiertAm;

    public Profil(Benutzer benutzer) {
        this.benutzer = benutzer;
    }

    @PrePersist
    void vorDemSpeichern() {
        LocalDateTime jetzt = LocalDateTime.now();
        this.aktualisiertAm = jetzt;
        this.erstelltAm = jetzt;
    }

    @PreUpdate
    void vorDemAktualisieren() {
        this.aktualisiertAm = LocalDateTime.now();
    }


}
