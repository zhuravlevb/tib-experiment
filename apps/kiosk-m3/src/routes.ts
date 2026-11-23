import Attract from './pages/Attract';
import Start from './pages/Start';
import Restaurants from './pages/Restaurants';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Loyalty from './pages/Loyalty';
import Payment from './pages/Payment';
import Done from './pages/Done';

export const routes = [
  { path: '/', component: Attract },
  { path: '/start/', component: Start },
  { path: '/restaurants/', component: Restaurants },
  { path: '/menu/:id/', component: Menu },
  { path: '/cart/', component: Cart },
  { path: '/loyalty/', component: Loyalty },
  { path: '/payment/', component: Payment },
  { path: '/done/', component: Done },
];
