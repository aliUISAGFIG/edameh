package de.edameh.benutzer.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "benutzer")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bentuzer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "e_mail" , nullable = false , unique = true , length = 255)
    private String eMail;

    @Column(name = "passwort_hash" , nullable = false , length = 255)
    private String passwortHash;

    @Column(name = "anzeigename" , nullable = false , length = 50)
    private String anzeigename;

    @Column(name = "erstellt_am" , nullable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "aktualisiert_am" , nullable = false)
    private LocalDateTime aktualisiertAm;

    public Bentuzer(String eMail, String passwortHash, String anzeigename) {
        this.eMail = eMail;
        this.passwortHash = passwortHash;
        this.anzeigename = anzeigename;
    }

    @PrePersist
    void vorDemSpeichern(){

    }

    @PreUpdate
    void vorDemAktualisieren(){

    }

}
