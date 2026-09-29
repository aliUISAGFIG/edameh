import type { ReactNode } from 'react';
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
  return (
    <Primitive.Root open={open} onOpenChange={onOpenChange}>
      <Primitive.Portal>
        <Primitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Primitive.Content
          aria-describedby={description ? 'dialog-description' : undefined}
          className={cn(
            'fixed z-50 max-h-[90dvh] overflow-y-auto border bg-card p-6 shadow-xl',
            sheet
              ? 'inset-y-0 right-0 w-[min(92vw,390px)] max-h-dvh'
              : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl',
          )}
        >
          <Primitive.Title className="pr-8 text-xl font-semibold">{title}</Primitive.Title>
          {description && (
            <Primitive.Description
              id="dialog-description"
              className="mt-3 text-sm text-muted-foreground"
            >
              {description}
            </Primitive.Description>
          )}
          <Primitive.Close
            aria-label="Schließen"
            className="absolute right-4 top-4 rounded-md p-1 hover:bg-muted"
          >
            <X size={18} />
          </Primitive.Close>
          <div className="mt-6">{children}</div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
