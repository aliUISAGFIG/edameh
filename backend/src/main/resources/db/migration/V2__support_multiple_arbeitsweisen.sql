CREATE TABLE anzeige_arbeitsweisen (
                                       anzeige_id BIGINT NOT NULL,
                                       arbeitsweise VARCHAR(20) NOT NULL,

                                       PRIMARY KEY (anzeige_id, arbeitsweise),

                                       CONSTRAINT fk_anzeige_arbeitsweisen_anzeige
                                           FOREIGN KEY (anzeige_id)
                                               REFERENCES anzeigen(id),

                                       CONSTRAINT chk_anzeige_arbeitsweisen_wert
                                           CHECK (
                                               arbeitsweise IN (
                                                                'REMOTE',
                                                                'VOR_ORT',
                                                                'HYBRID'
                                                   )
                                               )
);

INSERT INTO anzeige_arbeitsweisen (anzeige_id, arbeitsweise)
SELECT id, arbeitsweise
FROM anzeigen;

ALTER TABLE anzeigen
    DROP COLUMN arbeitsweise;