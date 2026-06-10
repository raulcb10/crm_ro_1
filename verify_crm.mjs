import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

let allPass = true;
function check(label, condition) {
  console.log(`${condition ? '✅' : '❌'} ${label}`);
  if (!condition) allPass = false;
}

async function goToLogin() {
  const btn = page.locator('button', { hasText: 'Cambiar usuario' });
  if (await btn.isVisible()) {
    await btn.click();
    await page.waitForSelector('text=Acceso SSO corporativo', { timeout: 8000 });
  }
}

// ── 1. Login ──────────────────────────────────────────────────────────────────
await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/01_login.png' });
const t1 = await page.textContent('body');
check('Login: 4 usuarios (Ana García, Carlos López, María Torres, Pedro Ruiz)',
  t1.includes('Ana García') && t1.includes('Carlos López') && t1.includes('María Torres') && t1.includes('Pedro Ruiz'));
check('Login: roles visibles (Analista, Gobierno, Risk Specialist)', 
  t1.includes('Analista de Riesgos') && t1.includes('Gobierno A/B Testing') && t1.includes('Risk Specialist'));
check('Login: SSO simulado', t1.includes('SSO'));

// ── 2. Mis Pilotos (Ana García) ───────────────────────────────────────────────
await page.click('text=Ana García');
await page.waitForSelector('text=Mis Pilotos', { timeout: 8000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/02_mis_pilotos.png' });
const t2 = await page.textContent('body');
check('Mis Pilotos: PIL-000001 y PIL-000002 visibles', t2.includes('PIL-000001') && t2.includes('PIL-000002'));
check('Mis Pilotos: badges de estado (Vigente, Apagado)', t2.includes('Vigente') && t2.includes('Apagado'));
check('Mis Pilotos: semáforo Alerta y En Observación', t2.includes('Alerta') && t2.includes('Observación'));
check('Mis Pilotos: botón Nuevo Piloto + campana notificaciones', t2.includes('Nuevo Piloto') && t2.includes('🔔'));

// ── 3. Bandeja Aprobación (María Torres = Gobierno) ───────────────────────────
await goToLogin();
await page.click('text=María Torres');
await page.waitForSelector('text=Bandeja de Aprobación', { timeout: 8000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/03_bandeja.png' });
const t3 = await page.textContent('body');
check('Bandeja: PIL-000003 + botón Abrir', t3.includes('PIL-000003') && t3.includes('Abrir'));
check('Gobierno NO tiene Mis Pilotos en menú (RBAC)', !t3.includes('Mis Pilotos'));

// Detalle del piloto
await page.click('text=Abrir →');
await page.waitForSelector('text=Revisión de Piloto', { timeout: 8000 });
await page.screenshot({ path: '/tmp/04_detalle.png' });
const t4 = await page.textContent('body');
check('Detalle: botones Aprobar y Devolver', t4.includes('Aprobar') && t4.includes('Devolver'));
check('Detalle: grilla de Slots visible', t4.includes('Grilla de Slots'));
check('Detalle: selector de Variables', t4.includes('Variables'));
check('Detalle: bitácora expandible', t4.includes('Bitácora'));

// ── 4. Bandeja Solicitudes ────────────────────────────────────────────────────
await page.click('text=Bandeja Solicitudes');
await page.waitForSelector('text=Bandeja de Solicitudes', { timeout: 8000 });
await page.screenshot({ path: '/tmp/05_solicitudes.png' });
const t5 = await page.textContent('body');
check('Solicitudes: APAGADO y ESCALADO pendientes', t5.includes('APAGADO') && t5.includes('ESCALADO'));
check('Solicitudes: botones Confirmar y Rechazar', t5.includes('Confirmar') && t5.includes('Rechazar'));

// ── 5. Catálogo Modelos (Pedro Ruiz) ──────────────────────────────────────────
await goToLogin();
await page.click('text=Pedro Ruiz');
// Pedro tiene REGISTRADOR + RISK_SPECIALIST → aterriza en Mis Pilotos
await page.waitForSelector('text=Mis Pilotos', { timeout: 8000 });
// Navegar al módulo de Modelos desde el menú
await page.click('text=Mantenimiento');
await page.waitForSelector('text=Mantenimiento de Modelos', { timeout: 8000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/06_modelos.png' });
const t6 = await page.textContent('body');
check('Modelos: tabla con 5 modelos seed (MOD-SC-001)', t6.includes('MOD-SC-001'));
check('Modelos: Champion y Challenger visibles', t6.includes('Champion') && t6.includes('Challenger'));
check('Modelos: código piloto PIL-000004 en fila Challenger', t6.includes('PIL-000004'));
check('Pedro ve ambos módulos en menú (doble rol)', t6.includes('Módulo Pilotos') && t6.includes('Catálogo de Modelos'));

// ── 6. Formulario Registro Modelo — validación Challenger ────────────────────
await page.click('text=Registrar Modelo');
await page.waitForSelector('text=Registrar Nuevo Modelo', { timeout: 8000 });
await page.waitForLoadState('networkidle');
// Seleccionar Challenger — campo Código Piloto debe activarse
await page.selectOption('select', { label: 'Challenger' });
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/07_reg_modelo_challenger.png' });
const t7 = await page.textContent('body');
check('Registro Modelo: campo Código Piloto habilitado al seleccionar Challenger', 
  t7.includes('Código de Piloto'));
// Intentar registrar con piloto inválido
await page.fill('input[placeholder="Ej: PIL-000001"]', 'PIL-INVALIDO');
await page.click('button:has-text("Registrar Modelo")');
await page.waitForTimeout(400);
const t7b = await page.textContent('body');
check('Registro Modelo: bloquea si piloto no existe (RN-B2)', 
  t7b.includes('No existe') || t7b.includes('no es válido') || t7b.includes('Obligatorio'));
await page.screenshot({ path: '/tmp/08_modelo_piloto_invalido.png' });

// ── 7. Nuevo Piloto — validaciones ───────────────────────────────────────────
await page.click('text=Mis Pilotos');
await page.waitForSelector('text=Mis Pilotos', { timeout: 8000 });
await page.click('text=Nuevo Piloto');
await page.waitForSelector('text=Nuevo Piloto', { timeout: 8000 });
await page.waitForLoadState('networkidle');
// Guardar vacío → errores
await page.click('button:has-text("Guardar")');
await page.waitForTimeout(400);
const t8 = await page.textContent('body');
check('Probe: guardar sin campos → "Obligatorio" visible', t8.includes('Obligatorio'));
await page.screenshot({ path: '/tmp/09_guardar_vacio.png' });

// ── 8. Probe RBAC: Registrador no accede a bandeja de Gobierno ───────────────
await page.goto('http://localhost:5173/pilotos/bandeja-aprobacion');
await page.waitForLoadState('networkidle');
const t9 = await page.textContent('body');
check('Probe RBAC: redirigido a Mis Pilotos (no ve Bandeja de Aprobación)', 
  t9.includes('Mis Pilotos') && !t9.includes('Bandeja de Aprobación'));
await page.screenshot({ path: '/tmp/10_rbac_probe.png' });

// ── 9. Monitoreo ──────────────────────────────────────────────────────────────
await page.click('text=Monitoreo');
await page.waitForSelector('text=Resumen General', { timeout: 8000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/11_monitoreo.png' });
const t10 = await page.textContent('body');
check('Monitoreo: KPIs (Total pilotos, Vigentes, En Alerta)', 
  t10.includes('Total pilotos') && t10.includes('Vigentes') && t10.includes('En Alerta'));
check('Monitoreo: gráficos (Distribución por Estado, Salud)', 
  t10.includes('Distribución por Estado') && t10.includes('Salud de Pilotos'));
check('Monitoreo: tab Performance Power BI', t10.includes('Power BI'));

await browser.close();
console.log('\n' + (allPass ? '🎉 All checks PASS' : '⚠️  Some checks FAILED'));
console.log('Screenshots: /tmp/01_login.png … /tmp/11_monitoreo.png');
