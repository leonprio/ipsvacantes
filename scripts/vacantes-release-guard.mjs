import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROTECTED_SURFACES = [
  'App.tsx',
  'components/NationalSummary.tsx',
  'components/DashboardTable.tsx',
  'utils/calculations.ts',
  'types.ts',
  'components/weekly-analysis/AnalisisListView.tsx',
  'hooks/useWeeklyAnalysis.ts',
  'tests/utils.test.ts'
];

const REQUIRED_PASS_FIELDS = [
  'NORMAL=PASS',
  'MIN=PASS',
  'PRESENT=PASS',
  'S28=PASS',
  'S29=PASS',
  'S31=PASS',
  'DYNAMIC_GOALS=PASS',
  'WEEKLY_COMPARISONS=PASS',
  'OBSERVATIONS=PASS',
  'OPERATIVE_VACANCIES_COMPARISON=PASS',
  'TOTAL_REGIONAL=PASS'
];

function runCmd(cmd) {
  console.log(`\n🛡️ [GUARD RUN]: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ [GUARD ERROR]: Falló el comando "${cmd}". Execution aborted.`);
    process.exit(1);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  let evidence = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--evidence' && args[i + 1]) {
      evidence = args[i + 1];
      i++;
    }
  }
  return { evidence };
}

function main() {
  console.log('====================================================');
  console.log('🛡️  IPS VACANTES RELEASE GUARD v11.1.2 - RUNNING');
  console.log('====================================================');

  const { evidence } = parseArgs();

  // 1. Verificar árbol limpio
  let statusOutput = '';
  try {
    statusOutput = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  } catch (err) {
    console.error('❌ Error al ejecutar git status.');
    process.exit(1);
  }

  if (statusOutput.length > 0) {
    console.error('❌ [GUARD ERROR]: El árbol de trabajo tiene cambios sin commitear (dirty tree).');
    console.error('Realice commit o stash antes de ejecutar guard:release.');
    console.log(statusOutput);
    process.exit(1);
  }

  // 2. Obtener HEAD y rama
  const currentHead = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

  console.log(`📌 Rama actual: ${currentBranch}`);
  console.log(`📌 HEAD actual: ${currentHead}`);

  // 3. Obtener diff contra origin/main
  let diffFiles = [];
  try {
    const originMain = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
    const diffOutput = execSync(`git diff --name-only ${originMain} ${currentHead}`, { encoding: 'utf8' });
    diffFiles = diffOutput.split(/\r?\n/).map(f => f.trim()).filter(Boolean);
  } catch (err) {
    // Si origin/main no está disponible o falla, comparar contra main
    try {
      const diffOutput = execSync(`git diff --name-only main ${currentHead}`, { encoding: 'utf8' });
      diffFiles = diffOutput.split(/\r?\n/).map(f => f.trim()).filter(Boolean);
    } catch (e) {
      diffFiles = [];
    }
  }

  const touchedProtected = diffFiles.filter(f => PROTECTED_SURFACES.includes(f));

  console.log(`🔍 Archivos modificados vs origen/main (${diffFiles.length}):`);
  diffFiles.forEach(f => console.log(`   - ${f}`));

  if (touchedProtected.length > 0) {
    console.log(`⚠️  SUPERFICIES PROTEGIDAS MODIFICADAS (${touchedProtected.length}):`);
    touchedProtected.forEach(f => console.log(`   🛡️  ${f}`));

    if (!evidence) {
      console.error('\n❌ [GUARD ERROR]: Se modificaron superficies protegidas pero no se proporcionó la bandera --evidence.');
      console.error('Uso requerido: npm run guard:release -- --evidence docs/validation/<archivo>.md');
      process.exit(1);
    }

    const evidencePath = path.resolve(process.cwd(), evidence);
    if (!fs.existsSync(evidencePath)) {
      console.error(`\n❌ [GUARD ERROR]: El archivo de evidencia especificado no existe: ${evidencePath}`);
      process.exit(1);
    }

    const evidenceContent = fs.readFileSync(evidencePath, 'utf8');

    // Validar HEAD en evidencia
    if (!evidenceContent.includes(currentHead)) {
      console.error(`\n❌ [GUARD ERROR]: El HEAD registrado en la evidencia no coincide con el HEAD actual (${currentHead}).`);
      process.exit(1);
    }

    // Validar campos PASS en evidencia
    const missingFields = REQUIRED_PASS_FIELDS.filter(field => !evidenceContent.includes(field));
    if (missingFields.length > 0) {
      console.error(`\n❌ [GUARD ERROR]: El archivo de evidencia carece de las siguientes validaciones PASS requeridas:`);
      missingFields.forEach(f => console.error(`   - ${f}`));
      process.exit(1);
    }

    console.log(`✅ Evidencia visual validada correctamente: ${evidence}`);
  } else {
    console.log('✅ Ninguna superficie protegida crítica fue modificada.');
  }

  // 4. Ejecución de comandos secuenciales
  runCmd('git diff --check');
  runCmd('npx tsc --noEmit');
  runCmd('npx vitest run --pool=vmThreads');
  runCmd('npm run build');

  // 5. Escribir registro en .git/vacantes-release-guard.json
  const gitDir = path.resolve(process.cwd(), '.git');
  if (!fs.existsSync(gitDir)) {
    console.error('❌ [GUARD ERROR]: Directorio .git no encontrado.');
    process.exit(1);
  }

  const guardRecordPath = path.join(gitDir, 'vacantes-release-guard.json');
  const record = {
    head: currentHead,
    branch: currentBranch,
    timestamp: new Date().toISOString(),
    modifiedFiles: diffFiles,
    protectedFilesTouched: touchedProtected,
    evidenceFile: evidence || null,
    status: 'PASS'
  };

  fs.writeFileSync(guardRecordPath, JSON.stringify(record, null, 2), 'utf8');

  console.log('====================================================');
  console.log(`✅ RELEASE GUARD PASS REGISTRADO EXITOSAMENTE PARA HEAD: ${currentHead}`);
  console.log(`📄 Registro guardado en: ${guardRecordPath}`);
  console.log('====================================================');
}

main();
