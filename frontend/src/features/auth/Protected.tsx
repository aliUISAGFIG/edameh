import { Navigate, Outlet, useLocation } from 'react-router';
import { useMe } from '@/api/queries';
import { ErrorState, Skeleton } from '@/components/shared/common';
export function Protected() {
  const me = useMe();
  const location = useLocation();
  if (me.isPending) return <Skeleton />;
  if (me.error) return <ErrorState error={me.error} retry={() => void me.refetch()} />;
  if (!me.data)
    return (
      <Navigate
        replace
        to={`/anmelden?weiter=${encodeURIComponent(location.pathname + location.search)}`}
      />
    );
  return <Outlet />;
}
