import fs from 'fs';
import path from 'path';
import { getCanonicalSurahVerses } from '../../src/data/canonicalQuran';
import { extractAcousticObservations } from '../../src/utils/quranAlignmentEngine';
import { runQuranAlignmentEngine } from '../../src/utils/quranAlignmentEngine';

const wavPath = path.resolve('benchmark/real_audio_yasin/036_16k.wav');
const refPath = path.resolve('benchmark/real_audio_yasin/quran_foundation_reference_36.json');

const wavBuffer = fs.readFileSync(wavPath);
const pcm16 = new Int16Array(wavBuffer.buffer, wavBuffer.byteOffset + 44, (wavBuffer.byteLength - 44) / 2);
const float32 = new Float32Array(pcm16.length);
for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768.0;

const canonicalYasin = getCanonicalSurahVerses(36);
const refJson = JSON.parse(fs.readFileSync(refPath, 'utf8'));
const refVerses = refJson.audio_file.timestamps;

const acoustic = extractAcousticObservations(float32, 16000, { minSilenceMs: 250, minSpeechMs: 200 });

// Let us inspect the current boundaries in detail
const results = runQuranAlignmentEngine(
  canonicalYasin.map(v => ({ verse_key: v.verse_key, text_uthmani: v.text_uthmani, translation: v.translation })),
  {
    pcmData: float32,
    sampleRate: 16000,
    acousticSegments: acoustic.observations.map(o => ({ start: o.start, end: o.end })),
    referencePriors: refVerses.map(r => ({
      verseKey: r.verse_key,
      expectedStartMs: r.timestamp_from,
      expectedEndMs: r.timestamp_to,
      confidence: 1.0,
      source: 'quran-foundation-v4',
      provenance: 'provider'
    })),
    strictRealAudio: true,
    allowProportionalSplit: false,
    allowInterpolation: false,
    allowLegacyFallback: false,
    allowProviderOverride: false
  }
);

console.log('--- CURRENT RUN FOR SUSPECT AYAHS ---');
const suspects = [17, 18, 24, 27, 46, 55, 56, 57];
for (const idx of suspects) {
  const r = results[idx];
  const ref = refVerses[idx];
  const dStart = Math.round(Math.abs(r.startTime - ref.timestamp_from / 1000) * 1000);
  const dEnd = Math.round(Math.abs(r.endTime - ref.timestamp_to / 1000) * 1000);
  console.log(`Ayah ${r.verse_key}: start=${r.startTime}s (ref=${(ref.timestamp_from/1000).toFixed(2)}s, d=${dStart}ms), end=${r.endTime}s (ref=${(ref.timestamp_to/1000).toFixed(2)}s, d=${dEnd}ms)`);
}
