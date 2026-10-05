import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Info,
  Mail,
  X,
  ExternalLink,
  CheckCircle2,
  Copy,
  Send,
  Globe,
  Lock,
  Eye,
  Server,
  Sparkles,
  HelpCircle,
  Building,
  Heart,
  MessageSquare
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'about' | 'contact';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [currentHostname, setCurrentHostname] = useState('CuteCutPro.com');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host && !host.includes('run.app') && !host.includes('localhost') && !host.includes('web.app')) {
        setCurrentHostname(host);
      } else {
        setCurrentHostname('CuteCutPro.com');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@cutecutpro.com').then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }).catch(() => {});
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) return;
    setMessageSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn select-text"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0f0f18] border border-[#2a2a3e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222236] bg-[#141424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">CuteCut Pro Compliance & Legal</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  AdSense Verified
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Domain: <strong className="text-gray-200">{currentHostname}</strong></span>
                <span className="text-gray-600">•</span>
                <span>Last Updated: September 2026</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-[#1e1e30] bg-[#121220] overflow-x-auto custom-scrollbar">
          {[
            { id: 'privacy', label: 'Privacy Policy', sub: 'کوکیز اور اینالیٹکس', icon: Lock },
            { id: 'terms', label: 'Terms of Service', sub: 'استعمال کے ضوابط', icon: FileText },
            { id: 'about', label: 'About Us', sub: 'ہمارے بارے میں', icon: Info },
            { id: 'contact', label: 'Contact Us / Support', sub: 'رابطہ اور مدد', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as LegalTab);
                  setMessageSent(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-[#18182c] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-[9px] text-gray-500 font-normal leading-none">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Body Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-xs sm:text-sm custom-scrollbar leading-relaxed">
          
          {/* ============================================================== */}
          {/* TAB 1: PRIVACY POLICY (AdSense & Cookies Compliant)            */}
          {/* ============================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Privacy Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#16162a] to-blue-950/30 border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Privacy Policy & Data Protection Disclosure</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  CuteCut Pro is committed to protecting your personal privacy and adhering strictly to international data privacy laws including GDPR, CCPA, and <strong>Google AdSense Publisher Policies</strong>.
                </p>
              </div>

              {/* Section 1: Client-Side Processing */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>1. Local-First Video Rendering & Privacy Architecture</span>
                </h3>
                <p className="text-gray-300">
                  CuteCut Pro operates as a modern <strong>client-side WebAssembly and WebCodecs</strong> web application. When you import videos, photos, or voiceover recordings into your timeline, your media files remain on your local device memory. They are <strong>NOT uploaded to any external server</strong> for rendering, transcoding, or storage unless you explicitly choose to backup your project configuration to your personal Google Drive or Firebase Firestore database.
                </p>
              </div>

              {/* Section 2: Cookies and Web Beacons (CRITICAL FOR ADSENSE) */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#141422] border border-[#25253c]">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>2. Cookies, Web Beacons & Google AdSense Disclosures</span>
                </h3>
                <p className="text-gray-300">
                  Like any professional web platform, CuteCut Pro uses cookies and HTML5 LocalStorage to enhance user experience, remember your canvas aspect ratios (9:16 Shorts vs 16:9 Landscape), theme presets, and authentication session.
                </p>
                <div className="space-y-2 pt-2 border-t border-[#222238] text-xs">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <strong className="block text-amber-300 font-bold mb-1">Google AdSense & DoubleClick DART Cookie Policy:</strong>
                    Third-party vendors, including <strong>Google</strong>, use cookies to serve advertisements based on a user's prior visits to this website (<span className="font-mono">{currentHostname}</span>) or other websites on the Internet.
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300">
                    <li>Google's use of advertising cookies enables it and its partners to serve targeted and non-targeted ads to our users based on their visits to CuteCut Pro and/or other sites across the World Wide Web.</li>
                    <li>
                      Users may opt out of personalized advertising at any time by visiting{' '}
                      <a
                        href="https://www.google.com/settings/ads"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline hover:text-cyan-300"
                      >
                        Google Ads Settings (google.com/settings/ads)
                      </a>{' '}
                      or through the Digital Advertising Alliance Consumer Choice page at{' '}
                      <a
                        href="https://www.aboutads.info/choices/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline hover:text-cyan-300"
                      >
                        aboutads.info/choices
                      </a>.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3: Google Analytics & Diagnostic Logs */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>3. Google Analytics & Diagnostic Telemetry</span>
                </h3>
                <p className="text-gray-300">
                  We may utilize Google Analytics and anonymized web performance monitoring to understand visitor trends, identify browser rendering bottlenecks (such as WebGL or Web Audio playback compatibility), and improve our template catalog. These analytics collect aggregate, non-personally identifiable information (such as operating system, browser type, and duration of timeline usage). All IP addresses are masked and anonymized by default.
                </p>
              </div>

              {/* Section 4: Third-Party Media Providers */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>4. Third-Party Verified APIs & Stock Assets</span>
                </h3>
                <p className="text-gray-300">
                  Our video editor integrates with trusted third-party providers for copyright-free assets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-[#141422] border border-[#24243a]">
                    <div className="font-bold text-white mb-0.5">Pexels 4K Media</div>
                    <div className="text-gray-400">Copyright-free stock video clips and background photography licensed for personal and commercial usage.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141422] border border-[#24243a]">
                    <div className="font-bold text-white mb-0.5">Pixabay 4K Stock</div>
                    <div className="text-gray-400">High-resolution cinematic time-lapses and visual loops under the Pixabay Content License.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141422] border border-[#24243a]">
                    <div className="font-bold text-white mb-0.5">EveryAyah Audio API</div>
                    <div className="text-gray-400">Open-source authentic Quranic recitations by renowned international Qaris with zero copyright restrictions.</div>
                  </div>
                </div>
              </div>

              {/* Section 5: GDPR & CCPA Rights */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#141422] border border-[#25253c]">
                <h3 className="text-sm font-extrabold text-white">5. Your Privacy Rights (GDPR & CCPA)</h3>
                <p className="text-gray-300">
                  Depending on your jurisdiction, you have the right to request access to your stored profile data, request deletion of your saved Firestore cloud projects, or restrict processing. Because your videos are rendered locally on your device, deleting your browser cache or clicking "Delete Project" instantly removes all associated local timeline clips permanently.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TERMS OF SERVICE (استعمال کے ضوابط)                      */}
          {/* ============================================================== */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#16162a] to-indigo-950/30 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Terms of Service & User Agreement</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  By accessing CuteCut Pro on <strong className="text-white">{currentHostname}</strong> or through our desktop applications, you agree to comply with and be bound by the following terms.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">1. Ownership of Exported Videos</h3>
                <p className="text-gray-300">
                  <strong>You retain 100% full ownership, intellectual property rights, and commercial copyright</strong> to all video projects, reels, YouTube videos, and content created, edited, and exported using CuteCut Pro. CuteCut Pro claims zero royalties, commissions, or licensing rights over your creative outputs.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">2. Permitted & Acceptable Use</h3>
                <p className="text-gray-300">
                  CuteCut Pro is designed for legitimate, creative video editing, educational Quranic recitation synthesis, podcast production, and cinematic storytelling. You agree not to use the software to generate, render, or distribute unlawful, defamatory, or harmful content.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">3. Pro License & Free Tier</h3>
                <p className="text-gray-300">
                  CuteCut Pro provides robust free timeline editing tools (including multi-track editing, trimming, audio sync, and 1080p export). Pro features (such as 4K HDR neural enhancement, Veo motion animation, and cloud timeline auto-sync) are unlocked via one-time lifetime license keys with no recurring subscription traps.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">4. Disclaimer of Warranty</h3>
                <p className="text-gray-300">
                  CuteCut Pro is provided on an "as is" and "as available" basis. While we optimize timeline performance with hardware acceleration (WebCodecs and Canvas 2D/WebGL), performance may vary according to user hardware specifications and available GPU memory.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: ABOUT US (کیوٹ کٹ پرو اور ٹیم کے بارے میں)                */}
          {/* ============================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-r from-[#1c1236] via-[#101b38] to-[#0c2e3a] border border-white/10 shadow-lg">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400 text-black">
                    Our Mission
                  </span>
                  <h3 className="text-xl font-black text-white">Empowering Global Creators with Next-Gen Video Tools</h3>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                    CuteCut Pro was founded with a singular vision: to bring the speed, precision, and multi-track power of desktop video editors like CapCut and Filmora directly to the web browser — with zero subscriptions, complete user privacy, and specialized tools for Islamic content creators.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#141422] border border-[#25253c] space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Building className="w-4 h-4" />
                    <span>The Team & Vision</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Led by <strong>Guldasta Islam</strong> and supported by an international team of passionate open-source engineers, video creators, and Islamic scholars, CuteCut Pro bridges high-end video technology with cultural and spiritual storytelling.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#141422] border border-[#25253c] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Hardware-Accelerated Engineering</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    CuteCut Pro leverages modern HTML5 Canvas, Web Audio API, WebCodecs, and WebAssembly to achieve smooth 60 FPS multi-track rendering, frame-accurate split/trim, and neural speech synchronization without overloading your device.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141422] border border-[#25253c] space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Domain & Cross-Platform Roadmap:</h4>
                <p className="text-xs text-gray-300">
                  Our platform is engineered for seamless operation on custom domains (<span className="font-mono text-cyan-400">{currentHostname}</span>) and standalone desktop binaries for Windows (<span className="font-mono">.exe</span>), macOS (<span className="font-mono">.dmg</span>), Linux (<span className="font-mono">.AppImage, .deb</span>), and Android (<span className="font-mono">.apk</span>).
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: CONTACT US / SUPPORT (ای میل رابطہ)                      */}
          {/* ============================================================== */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#16162a] to-cyan-950/30 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Official Customer Support & Technical Contact</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Have questions about Custom Domains, Google AdSense monetization, Pro Licensing, or bug reports? We are here to help!
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyEmail}
                    className="px-3 py-1.5 rounded-xl bg-[#1a1a2e] hover:bg-[#252540] border border-[#2e2e48] text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedEmail ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy Support Email'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Email Card */}
              <div className="p-4 rounded-2xl bg-[#141422] border border-[#25253c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Direct Support Email:</span>
                  <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">support@cutecutpro.com</div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Response Time: Within 12-24 Hours</span>
                </div>
              </div>

              {/* Interactive Contact Form */}
              <form onSubmit={handleSendMessage} className="p-5 rounded-2xl bg-[#141422] border border-[#25253c] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>Send Us a Direct Message / رابطہ فارم:</span>
                  </h4>
                  {messageSent && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" /> Message Sent Successfully! شکریہ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Your Name / نام:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Guldasta Creator"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#181828] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Your Email Address / ای میل:</label>
                    <input
                      type="email"
                      required
                      placeholder="creator@gmail.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#181828] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Subject / موضوع:</label>
                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full bg-[#181828] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry / عام معلومات</option>
                    <option value="Custom Domain & AdSense">Custom Domain & Google AdSense Setup</option>
                    <option value="Bug Report">Technical Bug Report / ایڈیٹر مسئلہ</option>
                    <option value="Feature Suggestion">Feature Suggestion / نئی تجویز</option>
                    <option value="Pro Licensing">Pro License Support / لائسنس معلومات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Message / پیغام:</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry, suggestion, or question here..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-[#181828] border border-[#2a2a3e] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-gray-500">
                    We never share your email address. Protected under our Privacy Policy.
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message (پیغام بھیجیں)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-[#1e1e30] bg-[#121220] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-400 flex items-center gap-2 text-[11px]">
            <span>© 2026 CuteCut Pro Studio. All rights reserved.</span>
            <span className="text-gray-600">•</span>
            <span className="text-cyan-400 font-mono">{currentHostname}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#202034] hover:bg-[#282842] text-gray-300 hover:text-white font-semibold text-xs transition cursor-pointer"
            >
              Close (بند کریں)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPagesModal;
