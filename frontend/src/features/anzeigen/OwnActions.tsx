import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Archive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { Anzeigenstatus } from '@/types/api';
export function OwnActions({
  id,
  status,
  redirect = false,
}: {
  id: number;
  status: Anzeigenstatus;
  redirect?: boolean;
}) {
  const [action, setAction] = useState<'close' | 'delete' | null>(null);
  const client = useQueryClient(),
    navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (value: 'close' | 'delete') =>
      value === 'close' ? api.closeAnzeige(id) : api.deleteAnzeige(id),
    onSuccess: async (_, value) => {
      await client.invalidateQueries({ queryKey: ['anzeigen'] });
      await client.invalidateQueries({ queryKey: ['profile'] });
      toast.success(value === 'close' ? 'Anzeige wurde geschlossen.' : 'Anzeige wurde gelöscht.');
      setAction(null);
      if (value === 'delete' && redirect) await navigate('/meine-anzeigen');
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/anzeigen/${id}/bearbeiten`}>
            <Pencil />
            Bearbeiten
          </Link>
        </Button>
        {status === 'ACTIVE' && (
          <Button variant="outline" size="sm" onClick={() => setAction('close')}>
            <Archive />
            Schließen
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => setAction('delete')}
        >
          <Trash2 />
          Löschen
        </Button>
      </div>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setAction(null);
        }}
        title={action === 'delete' ? 'Anzeige wirklich löschen?' : 'Anzeige schließen?'}
        description={
          action === 'delete'
            ? 'Die Anzeige wird ausgeblendet und ist nicht mehr aufrufbar. Bestehende Nachrichten bleiben erhalten.'
            : 'Die Anzeige verschwindet aus der öffentlichen Liste. Bestehende Unterhaltungen bleiben nutzbar.'
        }
      >
        <div className="form-actions">
          <Button variant="outline" disabled={mutation.isPending} onClick={() => setAction(null)}>
            Abbrechen
          </Button>
          <Button
            variant={action === 'delete' ? 'destructive' : 'default'}
            disabled={mutation.isPending}
            onClick={() => action && mutation.mutate(action)}
          >
            {mutation.isPending
              ? 'Wird gespeichert …'
              : action === 'delete'
                ? 'Anzeige löschen'
                : 'Anzeige schließen'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
