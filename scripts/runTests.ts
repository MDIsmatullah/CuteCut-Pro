import { runCanonicalQuranTests } from '../src/data/canonicalQuran.test';
import { runAllQuranAlignmentTests } from '../src/utils/quranAlignmentEngine.test';
import { runAcousticVadTests } from '../src/utils/acousticVad.test';
import { runAcousticShadowPrototypeTests } from '../src/utils/acousticShadowPrototype.test';
import { runGeneralizedQuranAlignmentTests } from '../src/utils/generalizedQuranAlignment.test';
import { runQariProviderTests } from '../src/services/qariProvider.test';
import { runHybridAlignmentTests } from '../src/utils/__tests__/hybridAlignment.test';
import { runAlignmentHardeningTests } from '../src/utils/__tests__/alignmentHardening.test';
import { runAutoSegmentTemporalIntegrityTests } from '../src/utils/__tests__/autoSegmentTemporalIntegrity.test';
import { runYasinStrictBenchmarkTests } from '../src/utils/__tests__/yasinStrictBenchmark.test';

async function runTests() {
  console.log('=== RUNNING CANONICAL QURAN SCRIPTURE TESTS (PHASE 1) ===');
  const quranRes = runCanonicalQuranTests();
  console.log(`Total Tests: ${quranRes.total} | Passed: ${quranRes.passed} | Failed: ${quranRes.failed}`);
  for (const r of quranRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING ACOUSTIC VAD & PAUSE TESTS (PHASE 2) ===');
  const vadRes = runAcousticVadTests();
  console.log(`Total Tests: ${vadRes.total} | Passed: ${vadRes.passed} | Failed: ${vadRes.failed}`);
  for (const r of vadRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING ACOUSTIC SHADOW PROTOTYPE TESTS (PHASE 3) ===');
  const protoRes = runAcousticShadowPrototypeTests();
  console.log(`Total Tests: ${protoRes.total} | Passed: ${protoRes.passed} | Failed: ${protoRes.failed}`);
  for (const r of protoRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING GENERALIZED ACOUSTIC-CONSTRAINED ALIGNMENT TESTS (PHASE 4) ===');
  const phase4Res = runGeneralizedQuranAlignmentTests();
  console.log(`Total Tests: ${phase4Res.total} | Passed: ${phase4Res.passed} | Failed: ${phase4Res.failed}`);
  for (const r of phase4Res.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING QARI PROVIDER & TIMING TESTS (PHASE 5A) ===');
  const qariRes = runQariProviderTests();
  console.log(`Total Tests: ${qariRes.total} | Passed: ${qariRes.passed} | Failed: ${qariRes.failed}`);
  for (const r of qariRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING HYBRID ACOUSTIC + REFERENCE ALIGNMENT TESTS (PHASE 5B) ===');
  const hybridRes = await runHybridAlignmentTests();
  console.log(`Total Tests: ${hybridRes.total} | Passed: ${hybridRes.passed} | Failed: ${hybridRes.failed}`);
  for (const r of hybridRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING QURAN ALIGNMENT SUITE ===');
  const alignRes = runAllQuranAlignmentTests();
  console.log(`Total Tests: ${alignRes.total} | Passed: ${alignRes.passed} | Failed: ${alignRes.failed}`);
  for (const r of alignRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING ALIGNMENT HARDENING & CALIBRATION TESTS (PHASE 8) ===');
  const hardeningRes = await runAlignmentHardeningTests();
  console.log(`Total Tests: ${hardeningRes.total} | Passed: ${hardeningRes.passed} | Failed: ${hardeningRes.failed}`);
  for (const r of hardeningRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING AUTOSIGMENT TEMPORAL INTEGRITY TESTS ===');
  const temporalRes = runAutoSegmentTemporalIntegrityTests();
  console.log(`Total Tests: ${temporalRes.total} | Passed: ${temporalRes.passed} | Failed: ${temporalRes.failed}`);
  for (const r of temporalRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  console.log('\n=== RUNNING SURAH YASIN STRICT BENCHMARK & REAL-AUDIO VERIFICATION ===');
  const yasinRes = runYasinStrictBenchmarkTests();
  console.log(`Total Tests: ${yasinRes.total} | Passed: ${yasinRes.passed} | Failed: ${yasinRes.failed}`);
  for (const r of yasinRes.results) {
    console.log(r.passed ? '  ✓ [PASS]' : '  ✗ [FAIL]', r.name, r.details ? `-> ${r.details}` : '');
  }

  if (
    quranRes.failed > 0 ||
    vadRes.failed > 0 ||
    protoRes.failed > 0 ||
    phase4Res.failed > 0 ||
    alignRes.failed > 0 ||
    qariRes.failed > 0 ||
    hybridRes.failed > 0 ||
    hardeningRes.failed > 0 ||
    temporalRes.failed > 0 ||
    yasinRes.failed > 0
  ) {
    console.error('One or more test suites failed!');
    process.exit(1);
  } else {
    console.log('\nAll Phase 1 to Phase 8 tests passed flawlessly!');
  }
}

runTests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});

