import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function verifyGuardPass() {
  const gitDir = path.resolve(process.cwd(), '.git');
  const guardRecordPath = path.join(gitDir, 'vacantes-release-guard.json');

  if (!fs.existsSync(guardRecordPath)) {
    console.error('❌ [PUSH BLOCKED]: No existe registro de validación (.git/vacantes-release-guard.json).');
    console.error('Debe ejecutar: npm run guard:release antes de realizar git push.');
    process.exit(1);
  }

  let currentHead = '';
  try {
    currentHead = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('❌ [PUSH BLOCKED]: No se pudo obtener git rev-parse HEAD.');
    process.exit(1);
  }

  let statusOutput = '';
  try {
    statusOutput = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('❌ [PUSH BLOCKED]: No se pudo obtener git status.');
    process.exit(1);
  }

  if (statusOutput.length > 0) {
    console.error('❌ [PUSH BLOCKED]: El árbol de trabajo tiene cambios pendientes sin commitear.');
    console.error('Realice commit antes de ejecutar npm run guard:release.');
    process.exit(1);
  }

  let record = null;
  try {
    record = JSON.parse(fs.readFileSync(guardRecordPath, 'utf8'));
  } catch (e) {
    console.error('❌ [PUSH BLOCKED]: Error al leer el registro .git/vacantes-release-guard.json.');
    process.exit(1);
  }

  if (record.status !== 'PASS') {
    console.error('❌ [PUSH BLOCKED]: El estado del guard no es PASS.');
    console.error('Debe ejecutar: npm run guard:release');
    process.exit(1);
  }

  if (record.head !== currentHead) {
    console.error(`❌ [PUSH BLOCKED]: El HEAD aprobado (${record.head}) no coincide con el HEAD actual (${currentHead}).`);
    console.error('Ha realizado nuevos commits. Ejecute nuevamente: npm run guard:release');
    process.exit(1);
  }

  console.log(`✅ [PRE-PUSH GUARD OK]: Validado PASS para HEAD: ${currentHead}`);
  process.exit(0);
}

verifyGuardPass();
