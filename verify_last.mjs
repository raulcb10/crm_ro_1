import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

let allPass = true;
function check(label, condition) {
  console.log(`${condition ? '✅' : '❌'} ${label}`);
  if (!condition) allPass = false;
}

// Ingresar como Pedro Ruiz
await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');
await page.click('text=Pedro Ruiz');
await page.waitForSelector('text=Mis Pilotos', { timeout: 8000 });

// Formulario Registro Modelo
await page.click('text=Registrar Modelo');
await page.waitForSelector('text=Registrar Nuevo Modelo', { timeout: 8000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/reg_modelo_blank.png' });

// Seleccionar Challenger usando nth-select específico (Estado del Modelo es el 4to select)
const estadoSelect = page.locator('select').filter({ has: page.locator('option[value="CHALLENGER"]') }).first();
await estadoSelect.selectOption('CHALLENGER');
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/reg_modelo_challenger.png' });
const t1 = await page.textContent('body');
check('Challenger: campo Código Piloto presente y habilitado', t1.includes('Código de Piloto'));

// Intentar registrar sin llenar nada → errores obligatorios
await page.click('button:has-text("Registrar Modelo")');
await page.waitForTimeout(400);
const t2 = await page.textContent('body');
check('Registro Modelo: errores de obligatorio al enviar vacío', t2.includes('Obligatorio'));
await page.screenshot({ path: '/tmp/reg_modelo_errores.png' });

// Ingresar código de piloto inválido
const pilotInput = page.locator('input[placeholder="Ej: PIL-000001"]');
await pilotInput.fill('PIL-INVALIDO');
await page.click('button:has-text("Registrar Modelo")');
await page.waitForTimeout(400);
const t3 = await page.textContent('body');
check('RN-B2: piloto inválido → mensaje de error', 
  t3.includes('No existe') || t3.includes('no es válido') || t3.includes('no existe'));
await page.screenshot({ path: '/tmp/reg_modelo_piloto_invalido.png' });

// Ingresar código de piloto válido (PIL-000005 = VIGENTE)
await pilotInput.fill('PIL-000005');
await page.click('button:has-text("Registrar Modelo")');
await page.waitForTimeout(400);
const t4 = await page.textContent('body');
// Should still have other required field errors, but not piloto error
check('RN-B2: piloto válido (PIL-000005 VIGENTE) no genera error de piloto',
  !t4.includes('No existe') && !t4.includes('no es válido'));
await page.screenshot({ path: '/tmp/reg_modelo_piloto_valido.png' });

// Monitoreo con Ana García
await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');
await page.click('text=Ana García');
await page.waitForSelector('text=Mis Pilotos', { timeout: 8000 });
await page.click('text=Monitoreo');
await page.waitForSelector('text=Resumen General', { timeout: 8000 });
await page.waitForLoadState('networkidle');
// Cambiar a tab Performance
await page.click('text=Performance (Power BI)');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/monitoreo_powerbi.png' });
const t5 = await page.textContent('body');
check('Performance: placeholder Power BI visible', t5.includes('iframe Power BI'));

await browser.close();
console.log('\n' + (allPass ? '🎉 All checks PASS' : '⚠️  Some checks FAILED'));
