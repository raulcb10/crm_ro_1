import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage();
await p.setViewportSize({ width: 1440, height: 900 });

const nav = (path) => p.evaluate((path) => window.history.pushState({}, '', path) || window.dispatchEvent(new PopStateEvent('popstate')), path);

// Login como Ana García
await p.goto('http://localhost:5173');
await p.waitForLoadState('networkidle');
await p.click('text=Ana García');
await p.waitForSelector('text=4 pilotos registrados');

// Formulario Nuevo Piloto
await p.click('text=Nuevo Piloto');
await p.waitForSelector('text=1. Registro y Datos Generales');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_nuevo_piloto2.png', fullPage: true });

// Editar PIL-000002 (devuelto con comentario)
await p.click('text=← Mis Pilotos');
await p.waitForSelector('text=4 pilotos registrados');
const editBtn = p.locator('tr', { has: p.locator('text=PIL-000002') }).locator('button', { hasText: 'Editar' });
await editBtn.click();
await p.waitForSelector('text=Piloto devuelto por Gobierno');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_editar_devuelto.png', fullPage: true });

// Monitoreo
await p.click('text=Monitoreo');
await p.waitForSelector('text=Resumen General');
await p.waitForTimeout(1200);
await p.screenshot({ path: '/tmp/s_monitoreo2.png', fullPage: false });

// Bandeja Aprobación (María Torres)
await p.click('text=Cambiar usuario');
await p.waitForSelector('text=Acceso SSO');
await p.click('text=María Torres');
await p.waitForSelector('text=Bandeja de Aprobación');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_bandeja2.png', fullPage: false });

// Detalle con slots y variables
await p.click('text=Abrir →');
await p.waitForSelector('text=Revisión de Piloto');
await p.waitForTimeout(400);
await p.screenshot({ path: '/tmp/s_detalle2.png', fullPage: true });

// Registro Modelo (Pedro Ruiz)
await p.click('text=Cambiar usuario');
await p.waitForSelector('text=Acceso SSO');
await p.click('text=Pedro Ruiz');
await p.waitForSelector('text=Mis Pilotos');
await p.click('text=Registrar Modelo');
await p.waitForSelector('text=Registrar Nuevo Modelo');
await p.waitForLoadState('networkidle');
await p.screenshot({ path: '/tmp/s_reg_modelo2.png', fullPage: false });

await b.close();
console.log('done');
