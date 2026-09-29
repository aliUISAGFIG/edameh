import { lazy } from 'react';
import { createBrowserRouter, Link, useRouteError } from 'react-router';
import { Layout } from '@/components/layout/Layout';
import { Protected } from '@/features/auth/Protected';
import { EmptyState, ErrorState } from '@/components/shared/common';
import { Button } from '@/components/ui/button';
const Discover = lazy(() =>
  import('@/features/anzeigen/DiscoverPage').then((m) => ({ default: m.DiscoverPage })),
);
const Detail = lazy(() =>
  import('@/features/anzeigen/DetailPage').then((m) => ({ default: m.DetailPage })),
);
const Editor = lazy(() =>
  import('@/features/anzeigen/AnzeigeFormPage').then((m) => ({ default: m.AnzeigeFormPage })),
);
const MyAds = lazy(() =>
  import('@/features/anzeigen/MyAdsPage').then((m) => ({ default: m.MyAdsPage })),
);
const Auth = lazy(() => import('@/features/auth/AuthPage').then((m) => ({ default: m.AuthPage })));
const Profile = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const ProfileEdit = lazy(() =>
  import('@/features/profile/ProfileEditPage').then((m) => ({ default: m.ProfileEditPage })),
);
const Inbox = lazy(() =>
  import('@/features/unterhaltungen/InboxPage').then((m) => ({ default: m.InboxPage })),
);
function RouteError() {
  return (
    <div className="container-app py-12">
      <ErrorState error={useRouteError()} />
    </div>
  );
}
export const routes = [
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Discover /> },
      { path: '/anzeigen', element: <Discover /> },
      { path: '/anzeigen/:id', element: <Detail /> },
      { path: '/anmelden', element: <Auth /> },
      { path: '/registrieren', element: <Auth register /> },
      { path: '/profile/:id', element: <Profile /> },
      {
        element: <Protected />,
        children: [
          { path: '/anzeigen/neu', element: <Editor /> },
          { path: '/anzeigen/:id/bearbeiten', element: <Editor /> },
          { path: '/meine-anzeigen', element: <MyAds /> },
          { path: '/profil', element: <Profile /> },
          { path: '/profil/bearbeiten', element: <ProfileEdit /> },
          { path: '/nachrichten', element: <Inbox /> },
          { path: '/nachrichten/:id', element: <Inbox /> },
        ],
      },
      {
        path: '*',
        element: (
          <EmptyState
            title="Hier gibt es noch nichts zu entdecken"
            description="Diese Seite wurde nicht gefunden. Dein nächstes Projekt wartet bei den Anzeigen."
            action={
              <Button asChild>
                <Link to="/anzeigen">Anzeigen entdecken</Link>
              </Button>
            }
          />
        ),
      },
    ],
  },
];
export const router = createBrowserRouter(routes);
