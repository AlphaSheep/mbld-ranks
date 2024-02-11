import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';


const HomePage = lazy(() => import('./pages/home'));
const PersonPage = lazy(() => import('./pages/person'));
const PersonProvider = lazy(() => import('./contexts/person-context'));
const CompetitionPage = lazy(() => import('./pages/competition'));
const CompetitionProvider = lazy(() => import('./contexts/competition-context'));
const RankingsPage = lazy(() => import('./pages/rankings'));
const RankingsProvider = lazy(() => import('./contexts/rankings-context'));
const RecordsPage = lazy(() => import('./pages/records'));
const RecordsProvider = lazy(() => import('./contexts/records-context'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/person',
    element: <PersonProvider><PersonPage /></PersonProvider>,
  },
  {
    path: '/competition',
    element: <CompetitionProvider><CompetitionPage /></CompetitionProvider>,
  },
  {
    path: '/rankings',
    element: <RankingsProvider><RankingsPage /></RankingsProvider>,
  },
  {
    path: '/records',
    element: <RecordsProvider><RecordsPage /></RecordsProvider>,
  },
])

const AppRouter = () => {
  return (
    <>
      <Suspense fallback={<div className="lazy-loading">Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
};

export default AppRouter;
