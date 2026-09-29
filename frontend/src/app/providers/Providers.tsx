import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const expire = () => {
      queryClient.clear();
      queryClient.setQueryData(['session'], null);
    };
    window.addEventListener('edameh:session-expired', expire);
    return () => window.removeEventListener('edameh:session-expired', expire);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster richColors position="bottom-right" closeButton />
      </MotionConfig>
    </QueryClientProvider>
  );
}
