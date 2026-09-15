import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Download, 
  Play, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Monitor,
  Smartphone,
  Maximize
} from 'lucide-react';
import { QuranAlignmentSegment } from '../../types/quranAlignment';
import { RenderTimeline, VideoLayout, RESOLUTIONS, RenderManifest } from '../../types/video';
import { ScenePlanner } from '../../services/video/scenePlanner';

interface VideoExportProps {
  projectId: string;
  alignment: QuranAlignmentSegment[];
  audioSource: string;
  onClose: () => void;
}

export const VideoExport: React.FC<VideoExportProps> = ({
  projectId,
  alignment,
  audioSource,
  onClose
}) => {
  const [layout, setLayout] = useState<VideoLayout>('centered-quran');
  const [resolutionKey, setResolutionKey] = useState<string>('1080p');
  const [showTranslation, setShowTranslation] = useState(true);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<RenderManifest | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Poll for status if rendering
  useEffect(() => {
    let interval: any;
    if (renderId && isRendering) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/video/status/${renderId}`);
          if (res.ok) {
            const data = await res.json();
            setManifest(data);
            if (data.status === 'completed' || data.status === 'failed') {
              setIsRendering(false);
            }
          }
        } catch (err) {
          console.error('Failed to poll render status:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [renderId, isRendering]);

  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderId(null);
    setManifest(null);

    const timeline: RenderTimeline = {
      projectId,
      scenes: ScenePlanner.planScenes(alignment, {
        layout,
        highlightMode: { type: 'word' },
        backgroundType: 'color',
        showTranslation
      }),
      audioSource,
      totalDuration: alignment.length > 0 ? alignment[alignment.length - 1].endTime : 0,
      resolution: RESOLUTIONS[resolutionKey],
      fps: 30,
      metadata: {
        surahName: 'Quran Recitation'
      }
    };

    try {
      const res = await fetch('/api/video/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline })
      });

      if (res.ok) {
        const data = await res.json();
        setRenderId(data.renderId);
      } else {
        setIsRendering(false);
        alert('Failed to start rendering');
      }
    } catch (err) {
      console.error('Render request failed:', err);
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1c1c26] border border-[#2d2d3c] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#2d2d3c] flex items-center justify-between bg-[#242432]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Video</h2>
              <p className="text-sm text-gray-400">Synthesize professional Quran video</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#2d2d3c] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {!renderId ? (
            <div className="space-y-8">
              {/* Layout Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Layout Style
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'centered-quran', label: 'Centered Quran', icon: Maximize },
                    { id: 'cinematic', label: 'Cinematic', icon: Monitor },
                    { id: 'social-vertical', label: 'Social Vertical', icon: Smartphone },
                    { id: 'landscape', label: 'Classic Landscape', icon: Play },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLayout(item.id as VideoLayout)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                        layout === item.id 
                          ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                          : 'bg-[#242432] border-[#2d2d3c] text-gray-400 hover:border-[#3d3d4c]'
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution & Settings */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Resolution</label>
                  <select 
                    value={resolutionKey}
                    onChange={(e) => setResolutionKey(e.target.value)}
                    className="w-full bg-[#242432] border border-[#2d2d3c] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {Object.entries(RESOLUTIONS).map(([key, res]) => (
                      <option key={key} value={key}>{res.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Subtitles</label>
                  <button 
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`w-full p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      showTranslation 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                        : 'bg-[#242432] border-[#2d2d3c] text-gray-400'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${showTranslation ? 'opacity-100' : 'opacity-30'}`} />
                    {showTranslation ? 'Translation Enabled' : 'Arabic Only'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartRender}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Download className="w-5 h-5" /> Start Rendering
              </button>
            </div>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center text-center space-y-4">
                {manifest?.status === 'rendering' || manifest?.status === 'pending' ? (
                  <>
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {manifest.progress}%
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Rendering Video...</h3>
                      <p className="text-gray-400 mt-1">Please wait while we synthesize your masterpiece.</p>
                    </div>
                  </>
                ) : manifest?.status === 'completed' ? (
                  <>
                    <div className="p-4 bg-green-500/20 rounded-full">
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Render Successful!</h3>
                      <p className="text-gray-400 mt-1">Your video is ready for download.</p>
                    </div>
                    <a 
                      href={manifest.outputPath} 
                      download 
                      className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all mt-4"
                    >
                      <Download className="w-5 h-5" /> Download Video
                    </a>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-red-500/20 rounded-full">
                      <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Render Failed</h3>
                      <p className="text-red-400 mt-1">{manifest?.error || 'An unexpected error occurred during rendering.'}</p>
                    </div>
                    <button 
                      onClick={() => setRenderId(null)}
                      className="text-gray-400 hover:text-white text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              {(manifest?.status === 'rendering' || manifest?.status === 'pending') && (
                <div className="space-y-2">
                  <div className="h-2 bg-[#2d2d3c] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${manifest.progress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-mono uppercase tracking-wider">
                    <span>Processing Scenes...</span>
                    <span>{manifest.progress}% Complete</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#242432] text-center border-t border-[#2d2d3c]">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">
            Powered by Multi-Stage Video Synthesis Engine v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};
