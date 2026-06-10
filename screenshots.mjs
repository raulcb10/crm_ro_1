import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage();
await p.setViewportSize({ width: 1440, height: 900 });

// Login
await p.goto('http://localhost:5173');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_login.png', fullPage: false });

// Mis Pilotos (Ana García)
await p.click('text=Ana García');
await p.waitForSelector('text=Mis Pilotos');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_mis_pilotos.png', fullPage: false });

// Nuevo Piloto — formulario completo
await p.click('text=Nuevo Piloto');
await p.waitForSelector('text=Nuevo Piloto');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_nuevo_piloto.png', fullPage: true });

// Monitoreo
await p.click('text=Monitoreo');
await p.waitForSelector('text=Resumen General');
await p.waitForLoadState('networkidle');
await p.waitForTimeout(800); // let recharts render
await p.screenshot({ path: '/tmp/s_monitoreo.png', fullPage: false });

// Gobierno — Bandeja Aprobación
await p.click('text=Cambiar usuario');
await p.waitForSelector('text=Acceso SSO');
await p.click('text=María Torres');
await p.waitForSelector('text=Bandeja de Aprobación');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_bandeja.png', fullPage: false });

// Detalle piloto
await p.click('text=Abrir →');
await p.waitForSelector('text=Revisión de Piloto');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_detalle.png', fullPage: true });

// Bandeja Solicitudes
await p.click('text=Bandeja Solicitudes');
await p.waitForSelector('text=Bandeja de Solicitudes');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_solicitudes.png', fullPage: false });

// Catálogo Modelos (Pedro Ruiz)
await p.click('text=Cambiar usuario');
await p.waitForSelector('text=Acceso SSO');
await p.click('text=Pedro Ruiz');
await p.waitForSelector('text=Mis Pilotos');
await p.click('text=Mantenimiento');
await p.waitForSelector('text=Mantenimiento de Modelos');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_modelos.png', fullPage: false });

// Registro Modelo
await p.click('text=Registrar Modelo');
await p.waitForSelector('text=Registrar Nuevo Modelo');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_reg_modelo.png', fullPage: false });

await b.close();
console.log('done');
