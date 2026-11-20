CREATE UNIQUE INDEX uq_benutzer_email_lower
    ON benutzer (lower(e_mail));