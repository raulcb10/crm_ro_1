import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { initStore } from './data/store.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import MisPilotos from './pages/pilotos/MisPilotos.jsx';
import RegistroPiloto from './pages/pilotos/RegistroPiloto.jsx';
import MisSolicitudes from './pages/pilotos/MisSolicitudes.jsx';
import SolicitarApagado from './pages/pilotos/SolicitarApagado.jsx';
import SolicitarEscalado from './pages/pilotos/SolicitarEscalado.jsx';
import BandejaAprobacion from './pages/pilotos/BandejaAprobacion.jsx';
import DetalleAprobacion from './pages/pilotos/DetalleAprobacion.jsx';
import BandejaSolicitudes from './pages/pilotos/BandejaSolicitudes.jsx';
import Monitoreo from './pages/pilotos/Monitoreo.jsx';
import RegistroModelo from './pages/modelos/RegistroModelo.jsx';
import MantenimientoModelos from './pages/modelos/MantenimientoModelos.jsx';

initStore();

function GuardedRoute({ children, roles }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" replace />;
  if (roles && !roles.some(r => usuario.roles.includes(r))) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { usuario } = useAuth();

  const defaultPath = usuario
    ? usuario.roles.includes('REGISTRADOR') ? '/pilotos/mis-pilotos'
    : usuario.roles.includes('GOBIERNO') ? '/pilotos/bandeja-aprobacion'
    : '/modelos/mantenimiento'
    : '/';

  return (
    <Routes>
      <Route path="/" element={usuario ? <Navigate to={defaultPath} replace /> : <Login />} />

      {/* Módulo Pilotos — Registrador */}
      <Route path="/pilotos/mis-pilotos" element={
        <GuardedRoute roles={['REGISTRADOR']}>
          <MisPilotos />
        </GuardedRoute>
      } />
      <Route path="/pilotos/nuevo" element={
        <GuardedRoute roles={['REGISTRADOR']}>
          <RegistroPiloto />
        </GuardedRoute>
      } />
      <Route path="/pilotos/editar/:codigo" element={
        <GuardedRoute roles={['REGISTRADOR']}>
          <RegistroPiloto />
        </GuardedRoute>
      } />
      <Route path="/pilotos/ver/:codigo" element={
        <GuardedRoute roles={['REGISTRADOR', 'GOBIERNO']}>
          <RegistroPiloto />
        </GuardedRoute>
      } />
      <Route path="/pilotos/solicitudes" element={
        <GuardedRoute roles={['REGISTRADOR']}>
          <MisSolicitudes />
        </GuardedRoute>
      } />
      <Route path="/pilotos/apagado/:codigo" element={
        <GuardedRoute roles={['REGISTRADOR']}>
          <SolicitarApagado />
        </GuardedRoute>
      } />
      <Route path="/pilotos/escalado/:codigo" element={
        <GuardedRoute roles={['REGISTRADOR']}>
          <SolicitarEscalado />
        </GuardedRoute>
      } />

      {/* Módulo Pilotos — Gobierno */}
      <Route path="/pilotos/bandeja-aprobacion" element={
        <GuardedRoute roles={['GOBIERNO']}>
          <BandejaAprobacion />
        </GuardedRoute>
      } />
      <Route path="/pilotos/detalle/:codigo" element={
        <GuardedRoute roles={['GOBIERNO']}>
          <DetalleAprobacion />
        </GuardedRoute>
      } />
      <Route path="/pilotos/bandeja-solicitudes" element={
        <GuardedRoute roles={['GOBIERNO']}>
          <BandejaSolicitudes />
        </GuardedRoute>
      } />

      {/* Monitoreo (ambos roles) */}
      <Route path="/pilotos/monitoreo" element={
        <GuardedRoute roles={['REGISTRADOR', 'GOBIERNO']}>
          <Monitoreo />
        </GuardedRoute>
      } />

      {/* Módulo Catálogo de Modelos */}
      <Route path="/modelos/registro" element={
        <GuardedRoute roles={['RISK_SPECIALIST']}>
          <RegistroModelo />
        </GuardedRoute>
      } />
      <Route path="/modelos/editar/:id" element={
        <GuardedRoute roles={['RISK_SPECIALIST']}>
          <RegistroModelo />
        </GuardedRoute>
      } />
      <Route path="/modelos/mantenimiento" element={
        <GuardedRoute roles={['RISK_SPECIALIST']}>
          <MantenimientoModelos />
        </GuardedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
