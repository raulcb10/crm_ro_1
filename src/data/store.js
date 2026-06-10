import { SEED } from './seed.js';

const KEYS = {
  usuarios: 'crm_usuarios',
  config: 'crm_config',
  productos: 'crm_productos',
  subproductos: 'crm_subproductos',
  gerencias: 'crm_gerencias',
  equipos: 'crm_equipos',
  categoriasModelo: 'crm_categoriasModelo',
  grilla: 'crm_grilla',
  variables: 'crm_variables',
  pilotos: 'crm_pilotos',
  solicitudes: 'crm_solicitudes',
  modelos: 'crm_modelos',
  bitacora: 'crm_bitacora',
  notificaciones: 'crm_notificaciones',
  pilotoCounter: 'crm_pilotoCounter',
};

// ─── bootstrap ───────────────────────────────────────────────────────────────

export function initStore() {
  if (!localStorage.getItem(KEYS.usuarios)) {
    resetStore();
  }
}

export function resetStore() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.setItem(KEYS.usuarios, JSON.stringify(SEED.usuarios));
  localStorage.setItem(KEYS.config, JSON.stringify(SEED.config));
  localStorage.setItem(KEYS.productos, JSON.stringify(SEED.productos));
  localStorage.setItem(KEYS.subproductos, JSON.stringify(SEED.subproductos));
  localStorage.setItem(KEYS.gerencias, JSON.stringify(SEED.gerencias));
  localStorage.setItem(KEYS.equipos, JSON.stringify(SEED.equipos));
  localStorage.setItem(KEYS.categoriasModelo, JSON.stringify(SEED.categoriasModelo));
  localStorage.setItem(KEYS.grilla, JSON.stringify(SEED.grilla));
  localStorage.setItem(KEYS.variables, JSON.stringify(SEED.variables));
  localStorage.setItem(KEYS.pilotos, JSON.stringify(SEED.pilotos));
  localStorage.setItem(KEYS.solicitudes, JSON.stringify(SEED.solicitudes));
  localStorage.setItem(KEYS.modelos, JSON.stringify(SEED.modelos));
  localStorage.setItem(KEYS.bitacora, JSON.stringify(SEED.bitacora));
  localStorage.setItem(KEYS.notificaciones, JSON.stringify(SEED.notificaciones));
  localStorage.setItem(KEYS.pilotoCounter, '9');
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const get = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const getObj = (key) => JSON.parse(localStorage.getItem(key) || '{}');

function logBitacora(entry) {
  const bits = get(KEYS.bitacora);
  bits.push({ id: `bit-${Date.now()}`, ...entry });
  set(KEYS.bitacora, bits);
}

function createNotif(notif) {
  const notifs = get(KEYS.notificaciones);
  notifs.push({ id: `notif-${Date.now()}-${Math.random()}`, leida: false, ...notif });
  set(KEYS.notificaciones, notifs);
}

// ─── jobs simulados (se ejecutan al leer pilotos) ────────────────────────────

function applyJobs(pilotos) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const changed = [];

  const updated = pilotos.map(p => {
    let modified = { ...p };

    // Job Vigencia: APROBADO → VIGENTE si hoy >= fechaInicio (RN-07/D4)
    if (p.estado === 'APROBADO' && p.fechaInicio) {
      const fi = new Date(p.fechaInicio);
      fi.setHours(0, 0, 0, 0);
      if (hoy >= fi) {
        modified.estado = 'VIGENTE';
        changed.push({ codigo: p.codigo, campo: 'estado', antes: 'APROBADO', despues: 'VIGENTE' });
      }
    }

    // Job Salud: solo si estado VIGENTE y no hay override manual (RN-09/P6/D2)
    if (modified.estado === 'VIGENTE' && !modified.saludManual) {
      const ff = modified.fechaFin ? new Date(modified.fechaFin) : null;
      if (ff) {
        ff.setHours(0, 0, 0, 0);
        const diffMs = ff - hoy;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        let nuevaSalud;
        if (diffDays < 0) {
          nuevaSalud = 'ALERTA'; // D2: fecha_fin ya pasó
        } else if (diffDays <= 30) {
          nuevaSalud = 'EN_OBSERVACION'; // P6: faltan ≤30 días
        } else {
          nuevaSalud = 'SALUDABLE';
        }
        if (nuevaSalud !== modified.salud) {
          if (nuevaSalud === 'ALERTA' && modified.salud !== 'ALERTA') {
            createNotif({
              destinatarioRol: 'GOBIERNO',
              destinatarioId: null,
              mensaje: `Alerta: el piloto ${modified.codigo} "${modified.nombre}" ha vencido y requiere atención.`,
              fechaHora: new Date().toISOString(),
            });
          }
          changed.push({ codigo: modified.codigo, campo: 'salud', antes: modified.salud, despues: nuevaSalud });
          modified.salud = nuevaSalud;
        }
      }
    }

    return modified;
  });

  if (changed.length > 0) {
    set(KEYS.pilotos, updated);
  }
  return updated;
}

// ─── catálogos (solo lectura) ─────────────────────────────────────────────────

export const getUsuarios = () => get(KEYS.usuarios);
export const getConfig = () => getObj(KEYS.config);
export const getProductos = () => get(KEYS.productos);
export const getSubproductos = (productoId) => {
  const all = get(KEYS.subproductos);
  return productoId ? all.filter(s => s.productoId === productoId) : all;
};
export const getGerencias = () => get(KEYS.gerencias);
export const getEquipos = () => get(KEYS.equipos);
export const getCategoriasModelo = () => get(KEYS.categoriasModelo);
export const getGrilla = () => getObj(KEYS.grilla);
export const getVariables = () => get(KEYS.variables);

// ─── exclusividad de slots y variables ───────────────────────────────────────

export function getSlotsOcupados(productoId, excluirCodigo = null) {
  const pilotos = get(KEYS.pilotos);
  const activos = ['ENVIADO_A_APROBACION', 'APROBADO', 'VIGENTE'];
  return pilotos
    .filter(p => activos.includes(p.estado)
      && p.codigo !== excluirCodigo
      && p.productoId === productoId)
    .flatMap(p => p.slots || []);
}

export function getVariablesEnUso(excluirCodigo = null) {
  const pilotos = get(KEYS.pilotos);
  const activos = ['ENVIADO_A_APROBACION', 'APROBADO', 'VIGENTE'];
  return pilotos
    .filter(p => activos.includes(p.estado) && p.codigo !== excluirCodigo)
    .flatMap(p => p.variables || []);
}

// ─── pilotos ─────────────────────────────────────────────────────────────────

export function getPilotos() {
  const raw = get(KEYS.pilotos);
  return applyJobs(raw);
}

export function getPilotoByCode(codigo) {
  return getPilotos().find(p => p.codigo === codigo) || null;
}

export function getPilotosByRegistrador(registradorId) {
  return getPilotos().filter(p => p.registradorId === registradorId);
}

export function getPilotosEnviados() {
  return getPilotos().filter(p => p.estado === 'ENVIADO_A_APROBACION');
}

function generarCodigoPiloto() {
  const counter = parseInt(localStorage.getItem(KEYS.pilotoCounter) || '0', 10) + 1;
  localStorage.setItem(KEYS.pilotoCounter, String(counter));
  return `PIL-${String(counter).padStart(6, '0')}`;
}

export function guardarPiloto(datos, usuario) {
  const pilotos = get(KEYS.pilotos);
  const esNuevo = !datos.codigo;
  const codigo = datos.codigo || generarCodigoPiloto();
  const ahora = new Date().toISOString();

  const idx = pilotos.findIndex(p => p.codigo === codigo);
  const piloto = {
    ...(idx >= 0 ? pilotos[idx] : {}),
    ...datos,
    codigo,
    estado: 'REGISTRADO',
  };

  if (idx >= 0) {
    pilotos[idx] = piloto;
  } else {
    piloto.registradorId = usuario.id;
    piloto.fechaCreacion = ahora.split('T')[0];
    piloto.fechaEnvio = null;
    piloto.slots = piloto.slots || [];
    piloto.variables = piloto.variables || [];
    piloto.metricas = piloto.metricas || [];
    pilotos.push(piloto);
  }

  set(KEYS.pilotos, pilotos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'REGISTRADOR',
    modulo: 'PILOTOS',
    entidad: 'PILOTO',
    entidadId: codigo,
    accion: esNuevo ? 'CREAR' : 'EDITAR',
    antes: esNuevo ? null : 'REGISTRADO',
    despues: 'REGISTRADO',
  });

  return codigo;
}

export function enviarPilotoAprobacion(codigo, usuario) {
  const pilotos = get(KEYS.pilotos);
  const idx = pilotos.findIndex(p => p.codigo === codigo);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  pilotos[idx].estado = 'ENVIADO_A_APROBACION';
  pilotos[idx].fechaEnvio = ahora.split('T')[0];
  pilotos[idx].comentarioDevolucion = null;
  set(KEYS.pilotos, pilotos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'REGISTRADOR',
    modulo: 'PILOTOS',
    entidad: 'PILOTO',
    entidadId: codigo,
    accion: 'ENVIAR_APROBACION',
    antes: 'REGISTRADO',
    despues: 'ENVIADO_A_APROBACION',
  });

  createNotif({
    destinatarioRol: 'GOBIERNO',
    destinatarioId: null,
    mensaje: `El piloto ${codigo} "${pilotos[idx].nombre}" ha sido enviado para aprobación.`,
    fechaHora: ahora,
  });
}

export function aprobarPiloto(codigo, usuario) {
  const pilotos = get(KEYS.pilotos);
  const idx = pilotos.findIndex(p => p.codigo === codigo);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  pilotos[idx].estado = 'APROBADO';
  set(KEYS.pilotos, pilotos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'GOBIERNO',
    modulo: 'PILOTOS',
    entidad: 'PILOTO',
    entidadId: codigo,
    accion: 'APROBAR',
    antes: 'ENVIADO_A_APROBACION',
    despues: 'APROBADO',
  });

  createNotif({
    destinatarioId: pilotos[idx].registradorId,
    destinatarioRol: null,
    mensaje: `Tu piloto ${codigo} "${pilotos[idx].nombre}" ha sido aprobado.`,
    fechaHora: ahora,
  });
}

export function devolverPiloto(codigo, comentario, usuario) {
  const pilotos = get(KEYS.pilotos);
  const idx = pilotos.findIndex(p => p.codigo === codigo);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  // RN-P5: los slots/variables se mantienen reservados al devolver
  pilotos[idx].estado = 'REGISTRADO';
  pilotos[idx].comentarioDevolucion = comentario;
  set(KEYS.pilotos, pilotos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'GOBIERNO',
    modulo: 'PILOTOS',
    entidad: 'PILOTO',
    entidadId: codigo,
    accion: 'DEVOLVER',
    antes: 'ENVIADO_A_APROBACION',
    despues: 'REGISTRADO',
  });

  createNotif({
    destinatarioId: pilotos[idx].registradorId,
    destinatarioRol: null,
    mensaje: `Tu piloto ${codigo} "${pilotos[idx].nombre}" fue devuelto. Observación: ${comentario}`,
    fechaHora: ahora,
  });
}

export function actualizarUniversoVariablesGobierno(codigo, slots, variables, usuario) {
  const pilotos = get(KEYS.pilotos);
  const idx = pilotos.findIndex(p => p.codigo === codigo);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  pilotos[idx].slots = slots;
  pilotos[idx].variables = variables;
  set(KEYS.pilotos, pilotos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'GOBIERNO',
    modulo: 'PILOTOS',
    entidad: 'PILOTO',
    entidadId: codigo,
    accion: 'EDITAR_UNIVERSO_VARIABLES',
    antes: null,
    despues: `slots: ${slots.join(',')}, variables: ${variables.join(',')}`,
  });
}

export function ajustarSaludManual(codigo, salud, usuario) {
  const pilotos = get(KEYS.pilotos);
  const idx = pilotos.findIndex(p => p.codigo === codigo);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  const antes = pilotos[idx].salud;
  pilotos[idx].salud = salud;
  pilotos[idx].saludManual = true;
  set(KEYS.pilotos, pilotos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'GOBIERNO',
    modulo: 'PILOTOS',
    entidad: 'PILOTO',
    entidadId: codigo,
    accion: 'AJUSTAR_SALUD',
    antes,
    despues: salud,
  });
}

// ─── solicitudes de apagado/escalado ────────────────────────────────────────

export function getSolicitudesPendientes() {
  return get(KEYS.solicitudes).filter(s => s.estado === 'PENDIENTE');
}

export function getSolicitudesByPiloto(pilotoCodigo) {
  return get(KEYS.solicitudes).filter(s => s.pilotoCodigo === pilotoCodigo);
}

export function crearSolicitud(solicitud, usuario) {
  const solicitudes = get(KEYS.solicitudes);
  const ahora = new Date().toISOString();
  const nueva = {
    id: `sol-${Date.now()}`,
    ...solicitud,
    solicitanteId: usuario.id,
    fecha: ahora.split('T')[0],
    estado: 'PENDIENTE',
  };
  solicitudes.push(nueva);
  set(KEYS.solicitudes, solicitudes);

  const piloto = getPilotoByCode(solicitud.pilotoCodigo);
  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'REGISTRADOR',
    modulo: 'PILOTOS',
    entidad: 'SOLICITUD',
    entidadId: nueva.id,
    accion: `SOLICITAR_${solicitud.tipo}`,
    antes: null,
    despues: 'PENDIENTE',
  });

  createNotif({
    destinatarioRol: 'GOBIERNO',
    destinatarioId: null,
    mensaje: `Solicitud de ${solicitud.tipo} pendiente para el piloto ${solicitud.pilotoCodigo} "${piloto?.nombre || ''}"`,
    fechaHora: ahora,
  });

  return nueva.id;
}

export function confirmarSolicitud(solicitudId, usuario) {
  const solicitudes = get(KEYS.solicitudes);
  const idx = solicitudes.findIndex(s => s.id === solicitudId);
  if (idx < 0) return;

  const sol = solicitudes[idx];
  const ahora = new Date().toISOString();
  solicitudes[idx].estado = 'CONFIRMADA';
  set(KEYS.solicitudes, solicitudes);

  // Cambiar estado del piloto y liberar recursos (D5/RN-12)
  const pilotos = get(KEYS.pilotos);
  const pIdx = pilotos.findIndex(p => p.codigo === sol.pilotoCodigo);
  if (pIdx >= 0) {
    const antes = pilotos[pIdx].estado;
    pilotos[pIdx].estado = sol.tipo;
    pilotos[pIdx].slots = [];
    pilotos[pIdx].variables = [];
    set(KEYS.pilotos, pilotos);

    logBitacora({
      fechaHora: ahora,
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      rol: 'GOBIERNO',
      modulo: 'PILOTOS',
      entidad: 'PILOTO',
      entidadId: sol.pilotoCodigo,
      accion: `CONFIRMAR_${sol.tipo}`,
      antes,
      despues: sol.tipo,
    });

    createNotif({
      destinatarioId: pilotos[pIdx].registradorId,
      destinatarioRol: null,
      mensaje: `Tu solicitud de ${sol.tipo} para el piloto ${sol.pilotoCodigo} "${pilotos[pIdx].nombre}" fue confirmada.`,
      fechaHora: ahora,
    });
  }
}

export function rechazarSolicitud(solicitudId, usuario) {
  const solicitudes = get(KEYS.solicitudes);
  const idx = solicitudes.findIndex(s => s.id === solicitudId);
  if (idx < 0) return;

  const sol = solicitudes[idx];
  const ahora = new Date().toISOString();
  solicitudes[idx].estado = 'RECHAZADA';
  set(KEYS.solicitudes, solicitudes);

  const piloto = getPilotoByCode(sol.pilotoCodigo);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'GOBIERNO',
    modulo: 'PILOTOS',
    entidad: 'SOLICITUD',
    entidadId: solicitudId,
    accion: `RECHAZAR_${sol.tipo}`,
    antes: 'PENDIENTE',
    despues: 'RECHAZADA',
  });

  createNotif({
    destinatarioId: piloto?.registradorId,
    destinatarioRol: null,
    mensaje: `Tu solicitud de ${sol.tipo} para el piloto ${sol.pilotoCodigo} "${piloto?.nombre || ''}" fue rechazada. Puedes iniciar una nueva solicitud.`,
    fechaHora: ahora,
  });
}

// ─── modelos ─────────────────────────────────────────────────────────────────

export function getModelos() {
  return get(KEYS.modelos).filter(m => !m.eliminado);
}

export function getModeloById(id) {
  return get(KEYS.modelos).find(m => m.id === id) || null;
}

export function registrarModelo(datos, usuario) {
  const modelos = get(KEYS.modelos);
  const ahora = new Date().toISOString();
  const nuevo = {
    id: `m-${Date.now()}`,
    ...datos,
    eliminado: false,
  };
  modelos.push(nuevo);
  set(KEYS.modelos, modelos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'RISK_SPECIALIST',
    modulo: 'MODELOS',
    entidad: 'MODELO',
    entidadId: nuevo.id,
    accion: 'CREAR',
    antes: null,
    despues: JSON.stringify(datos),
  });

  return nuevo.id;
}

export function actualizarModelo(id, datos, usuario) {
  const modelos = get(KEYS.modelos);
  const idx = modelos.findIndex(m => m.id === id);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  const antes = { ...modelos[idx] };
  modelos[idx] = { ...modelos[idx], ...datos };
  set(KEYS.modelos, modelos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'RISK_SPECIALIST',
    modulo: 'MODELOS',
    entidad: 'MODELO',
    entidadId: id,
    accion: 'EDITAR',
    antes: JSON.stringify(antes),
    despues: JSON.stringify(datos),
  });
}

export function eliminarModelo(id, usuario) {
  const modelos = get(KEYS.modelos);
  const idx = modelos.findIndex(m => m.id === id);
  if (idx < 0) return;

  const ahora = new Date().toISOString();
  modelos[idx].eliminado = true;
  set(KEYS.modelos, modelos);

  logBitacora({
    fechaHora: ahora,
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    rol: 'RISK_SPECIALIST',
    modulo: 'MODELOS',
    entidad: 'MODELO',
    entidadId: id,
    accion: 'ELIMINAR',
    antes: 'activo',
    despues: 'eliminado (baja lógica)',
  });
}

export function isCodigoModeloUnique(codigo, excludeId = null) {
  const modelos = get(KEYS.modelos);
  return !modelos.some(m => m.codigo === codigo && m.id !== excludeId && !m.eliminado);
}

export function isPilotoAsociadoAModelo(codigoPiloto, excludeModeloId = null) {
  const modelos = get(KEYS.modelos);
  return modelos.some(m =>
    m.codigoPiloto === codigoPiloto
    && m.estado === 'CHALLENGER'
    && !m.eliminado
    && m.id !== excludeModeloId
  );
}

// ─── bitácora ─────────────────────────────────────────────────────────────────

export function getBitacora() {
  return get(KEYS.bitacora).sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
}

export function getBitacoraByEntidad(entidadId) {
  return getBitacora().filter(b => b.entidadId === entidadId);
}

// ─── notificaciones ───────────────────────────────────────────────────────────

export function getNotificaciones(usuario) {
  return get(KEYS.notificaciones)
    .filter(n =>
      (n.destinatarioId && n.destinatarioId === usuario.id) ||
      (n.destinatarioRol && usuario.roles.includes(n.destinatarioRol))
    )
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
}

export function marcarNotifLeida(id) {
  const notifs = get(KEYS.notificaciones);
  const idx = notifs.findIndex(n => n.id === id);
  if (idx >= 0) {
    notifs[idx].leida = true;
    set(KEYS.notificaciones, notifs);
  }
}

export function marcarTodasLeidas(usuario) {
  const notifs = get(KEYS.notificaciones);
  notifs.forEach(n => {
    if (
      (n.destinatarioId && n.destinatarioId === usuario.id) ||
      (n.destinatarioRol && usuario.roles.includes(n.destinatarioRol))
    ) {
      n.leida = true;
    }
  });
  set(KEYS.notificaciones, notifs);
}
