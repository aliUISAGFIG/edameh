import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/api/client';
export function applyFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  if (error instanceof ApiError && Object.keys(error.details.fieldErrors ?? {}).length) {
    for (const [name, message] of Object.entries(error.details.fieldErrors))
      setError(name as Path<T>, { message });
  } else
    setError('root', {
      message: error instanceof Error ? error.message : 'Bitte versuche es erneut.',
    });
}
