import { Routes } from '@angular/router';
import { Alertas } from './pages/alertas/alertas';
import { Inicio } from './pages/inicio/inicio';
import { Insumos } from './pages/insumos/insumos';
import { Pedidos } from './pages/pedidos/pedidos';
import { Productos } from './pages/productos/productos';
import { Proveedores } from './pages/proveedores/proveedores';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
   // Ruta pública
  { path: 'login', component: Login },
    // Rutas protegidas
  { path: '', component: Inicio, canActivate: [AuthGuard] },
  { path: 'productos', component: Productos, canActivate: [AuthGuard] },
  { path: 'proveedores', component: Proveedores, canActivate: [AuthGuard] },
  { path: 'insumos', component: Insumos, canActivate: [AuthGuard] },
  { path: 'pedidos', component: Pedidos, canActivate: [AuthGuard] },
  { path: 'alertas', component: Alertas, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
