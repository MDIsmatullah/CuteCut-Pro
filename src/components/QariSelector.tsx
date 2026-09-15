import React, { useState, useEffect } from 'react';
import { Qari } from '../types/qari';
import { qariProviderRegistry } from '../services/qariProviderRegistry';
import { qariTimingService } from '../services/qariTimingService';

interface QariSelectorProps {
  onQariSelected: (qari: Qari | null) => void;
  onTimingsFetched: (timings: any[]) => void;
  surahNumber: number;
}

export const QariSelector: React.FC<QariSelectorProps> = ({ 
  onQariSelected, 
  onTimingsFetched,
  surahNumber 
}) => {
  const [qaris, setQaris] = useState<Qari[]>([]);
  const [selectedQariId, setSelectedQariId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadQaris = async () => {
      const list = await qariProviderRegistry.fetchReciters('quran-foundation');
      setQaris(list.slice(0, 50)); // Limit for UI performance
    };
    loadQaris();
  }, []);

  const handleQariChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qariId = e.target.value;
    setSelectedQariId(qariId);
    
    if (!qariId) {
      onQariSelected(null);
      onTimingsFetched([]);
      return;
    }

    const qari = qaris.find(q => String(q.providerReciterId) === qariId);
    if (qari) {
      onQariSelected(qari);
      setLoading(true);
      try {
        const timings = await qariTimingService.getSurahTiming(
          qari.providerId,
          qari.providerReciterId,
          surahNumber
        );
        onTimingsFetched(timings);
      } catch (err) {
        console.error('Failed to fetch timings', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <label className="text-sm font-medium text-slate-700">Reference Qari (Optional)</label>
      <select 
        className="p-2 border rounded bg-white text-slate-900"
        value={selectedQariId}
        onChange={handleQariChange}
        disabled={loading}
      >
        <option value="">-- No Reference (AutoSegment only) --</option>
        {qaris.map(q => (
          <option key={q.providerReciterId} value={q.providerReciterId}>
            {q.name} ({q.style})
          </option>
        ))}
      </select>
      {loading && <div className="text-xs text-blue-600 animate-pulse">Fetching reference timings...</div>}
    </div>
  );
};
