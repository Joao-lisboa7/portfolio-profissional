import { createBrowserRouter } from 'react-router';
import App from './App';
import Home from './pages/home/home';
import About from './pages/about/About';
import Experiences from './pages/experiences/Experiences';
import Statistics from './pages/statistics/Statistics';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <p>Erro ao carregar home. Tente novamente.</p>,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'experiences', element: <Experiences language="pt" /> },
      { path: 'statistics', element: <Statistics language="pt" /> },
      { path: '*', element: <p>Rota não encontrada</p> },
    ],
  },
]);