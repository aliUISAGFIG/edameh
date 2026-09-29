import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { resetCsrf } from '@/api/client';
import { db, demoPassword, demoUsers, resetDb } from './data';
import { Button } from '@/components/ui/button';
export default function DevToolbar() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const client = useQueryClient(),
    navigate = useNavigate();
  async function switchUser(id: string) {
    setBusy(true);
    try {
      if (id === 'guest') {
        if (db.sessionId) await api.logout();
        client.clear();
        client.setQueryData(['session'], null);
      } else {
        const user = demoUsers.find((u) => u.id === Number(id))!;
        const session = await api.login({ eMail: user.eMail, passwort: demoPassword });
        client.clear();
        client.setQueryData(['session'], session);
      }
      await navigate('/anzeigen');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Demo-Sitzung konnte nicht geändert werden.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside className="fixed bottom-3 left-3 z-40 max-w-[calc(100vw-1.5rem)]">
      <Button size="sm" variant="outline" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Wrench />
        Entwicklung · Mock
      </Button>
      {open && (
        <div className="panel mt-2 w-72 space-y-3 p-4 text-xs">
          <p className="font-semibold">Nur Entwicklung · Daten im Arbeitsspeicher</p>
          <label className="block">
            Demo-Sitzung
            <select
              aria-label="Demo-Benutzer"
              className="field mt-1"
              disabled={busy}
              value={db.sessionId ?? 'guest'}
              onChange={(e) => void switchUser(e.target.value)}
            >
              <option value="guest">Gast</option>
              {demoUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.anzeigename}
                  {u.id === 5 ? ' · leeres Profil' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={db.slow}
              onChange={(e) => {
                db.slow = e.target.checked;
              }}
            />
            Langsame Antworten
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              db.failNext = true;
              void client.invalidateQueries({ queryKey: ['anzeigen'] });
            }}
          >
            Nächste Anfrage mit Fehler
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              resetDb();
              resetCsrf();
              client.clear();
              void navigate('/');
            }}
          >
            Demodaten zurücksetzen
          </Button>
        </div>
      )}
    </aside>
  );
}
