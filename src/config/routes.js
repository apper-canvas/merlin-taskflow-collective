import Home from '../pages/Home';
import Archive from '../pages/Archive';
import NotFound from '../pages/NotFound';

export const routes = {
  home: {
    id: 'home',
    label: 'Tasks',
    path: '/',
    icon: 'CheckSquare',
    component: Home
  },
  archive: {
    id: 'archive',
    label: 'Archive',
    path: '/archive',
    icon: 'Archive',
    component: Archive
  },
  notFound: {
    id: 'notFound',
    label: 'Not Found',
    path: '/404',
    icon: 'AlertCircle',
    component: NotFound
  }
};

export const routeArray = Object.values(routes).filter(route => route.id !== 'notFound');