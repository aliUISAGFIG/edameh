import { useId, useRef, type ReactNode } from 'react';
import { Dialog as Primitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  sheet = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  sheet?: boolean;
}) {
  const descriptionId = useId();
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Primitive.Root open={open} onOpenChange={onOpenChange}>
      <Primitive.Portal>
        <Primitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-slate-950/55" />
        <Primitive.Content
          aria-describedby={description ? descriptionId : undefined}
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            if (opener.current?.isConnected) {
              event.preventDefault();
              opener.current.focus();
            }
          }}
          className={cn(
            'dialog-content fixed z-50 max-h-[90dvh] overflow-y-auto overscroll-contain border bg-card p-6 shadow-xl',
            sheet
              ? 'dialog-sheet inset-y-0 right-0 w-[min(92vw,390px)] max-h-dvh'
              : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl',
          )}
        >
          <Primitive.Title className="pr-8 text-xl font-semibold">{title}</Primitive.Title>
          {description && (
            <Primitive.Description
              id={descriptionId}
              className="mt-3 text-sm text-muted-foreground"
            >
              {description}
            </Primitive.Description>
          )}
          <Primitive.Close
            aria-label="Schließen"
            title="Schließen"
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-lg hover:bg-muted"
          >
            <X size={18} />
          </Primitive.Close>
          <div className="mt-6">{children}</div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
