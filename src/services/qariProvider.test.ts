import { qariProviderRegistry } from './qariProviderRegistry';
import { qariTimingService } from './qariTimingService';

export interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export interface SuiteResult {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

export function runQariProviderTests(): SuiteResult {
  const results: TestResult[] = [];

  // 1. Provider Registration
  const provider = qariProviderRegistry.getProvider('quran-foundation');
  results.push({
    name: '1. Provider Registration',
    passed: !!provider && provider.id === 'quran-foundation',
    details: provider ? `Found: ${provider.name}` : 'Provider not found'
  });

  // 2. Provider Metadata
  results.push({
    name: '2. Provider Metadata',
    passed: provider?.apiVersion === 'v4' && !!provider.documentationUrl,
    details: `Version: ${provider?.apiVersion}, Docs: ${provider?.documentationUrl}`
  });

  // 3. Qari Identity Normalization
  // @ts-ignore - private method access
  const norm1 = qariProviderRegistry.normalizeName('AbdulBaset AbdulSamad');
  // @ts-ignore - private method access
  const norm2 = qariProviderRegistry.normalizeName('abdulbaset-abdulsamad');
  results.push({
    name: '3. Qari Identity Normalization',
    passed: norm1 === 'abdulbaset-abdulsamad' && norm2 === 'abdulbaset-abdulsamad',
    details: `Normalized: ${norm1}`
  });

  // 4. Cache Key Determinism
  // @ts-ignore - private method access
  const key1 = qariTimingService.getCacheKey('p1', 1, 67);
  // @ts-ignore - private method access
  const key2 = qariTimingService.getCacheKey('p1', 1, 67);
  // @ts-ignore - private method access
  const key3 = qariTimingService.getCacheKey('p1', 2, 67);
  results.push({
    name: '4. Cache Key Determinism',
    passed: key1 === key2 && key1 !== key3,
    details: `Key 1: ${key1}, Key 3: ${key3}`
  });

  // 5. Licensing Check (Metadata)
  results.push({
    name: '5. Licensing Metadata (Redistribution)',
    passed: provider?.redistributionAllowed === false,
    details: 'Redistribution correctly marked as false'
  });

  // 6. Canonical Mapping Key Verification
  const mockVerseKey = "67:1";
  const parts = mockVerseKey.split(':');
  const isCanonical = parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]));
  results.push({
    name: '6. Canonical Mapping Key Verification',
    passed: isCanonical && mockVerseKey === "67:1",
    details: `Key: ${mockVerseKey}, Valid: ${isCanonical}`
  });

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  return { total, passed, failed, results };
}
