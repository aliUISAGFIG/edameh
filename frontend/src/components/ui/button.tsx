import type { ComponentProps } from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui Button pattern, adapted to Edameh's design tokens.
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,opacity,transform] duration-150 motion-safe:active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm',
        outline: 'border bg-card hover:bg-muted',
        ghost: 'hover:bg-muted',
        destructive: 'bg-destructive text-[var(--destructive-foreground)] hover:opacity-90',
      },
      size: { default: 'h-11 px-4', sm: 'h-11 px-3 text-sm sm:h-10', icon: 'size-11' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
