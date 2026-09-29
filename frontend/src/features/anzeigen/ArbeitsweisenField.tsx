import { useId, useState, type Ref } from 'react';
import { Tooltip } from 'radix-ui';
import { Info } from 'lucide-react';
import type { Arbeitsweise } from '@/types/api';
import { arbeitsweisen } from '@/lib/labels';

const descriptions: Record<Arbeitsweise, string> = {
  REMOTE: 'Die Zusammenarbeit findet vollständig online statt.',
  VOR_ORT: 'Die Zusammenarbeit findet persönlich an einem gemeinsamen Ort statt.',
  HYBRID: 'Die Zusammenarbeit kombiniert Remote- und Vor-Ort-Termine.',
};

function ArbeitsweiseInfo({ value }: { value: Arbeitsweise }) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label={`Information zu ${arbeitsweisen[value]}`}
          className="mr-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-primary"
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
        >
          <Info size={16} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={8}
          collisionPadding={16}
          className="z-50 max-w-[min(18rem,calc(100vw-2rem))] rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg"
        >
          {descriptions[value]}
          <Tooltip.Arrow className="fill-popover" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function ArbeitsweisenField({
  value,
  onChange,
  onBlur,
  inputRef,
  error,
}: {
  value: Arbeitsweise[];
  onChange: (value: Arbeitsweise[]) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
  error?: string;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}>
      <legend className="label">Arbeitsweisen</legend>
      <p id={`${id}-hint`} className="mb-3 text-xs text-muted-foreground">
        Wähle eine oder mehrere Möglichkeiten der Zusammenarbeit.
      </p>
      <Tooltip.Provider delayDuration={150}>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(arbeitsweisen) as Arbeitsweise[]).map((option, index) => (
            <div
              key={option}
              className="flex min-w-0 items-center rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-primary"
            >
              <label className="flex min-h-14 flex-1 cursor-pointer items-center gap-3 py-3 pl-4 text-sm font-medium">
                <input
                  ref={index === 0 ? inputRef : undefined}
                  type="checkbox"
                  name="arbeitsweisen"
                  value={option}
                  checked={value.includes(option)}
                  onChange={() =>
                    onChange(
                      value.includes(option)
                        ? value.filter((v) => v !== option)
                        : [...value, option],
                    )
                  }
                  onBlur={onBlur}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : `${id}-hint`}
                  className="size-4 shrink-0 accent-primary"
                />
                {arbeitsweisen[option]}
              </label>
              <ArbeitsweiseInfo value={option} />
            </div>
          ))}
        </div>
      </Tooltip.Provider>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
