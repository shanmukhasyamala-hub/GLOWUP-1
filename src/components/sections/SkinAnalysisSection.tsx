import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Info, RefreshCw, Upload } from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';
import { AnalysisInput, skinAnalysisService } from '../../services/skinAnalysisService';
import { AnalysisResult } from '../../types/glowup';

// Generates a soft studio portrait preview SVG data URL for quick demonstration testing
function createSamplePortraitDataUrl(tone: 'warm' | 'cool'): string {
  const bg = tone === 'warm' ? '%233D2631' : '%23292236';
  const skin = tone === 'warm' ? '%23E4B598' : '%23ECC4B0';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="520" viewBox="0 0 420 520"><defs><radialGradient id="g" cx="50%" cy="42%" r="60%"><stop offset="0%" stop-color="%23F5DDE6" stop-opacity="0.35"/><stop offset="100%" stop-color="${bg}"/></radialGradient></defs><rect width="420" height="520" fill="${bg}"/><rect width="420" height="520" fill="url(%23g)"/><ellipse cx="210" cy="230" rx="84" ry="112" fill="${skin}" opacity="0.92"/><ellipse cx="176" cy="220" rx="10" ry="6" fill="%23472B35"/><ellipse cx="244" cy="220" rx="10" ry="6" fill="%23472B35"/><path d="M188 278 Q210 292 232 278" stroke="%239C5D63" stroke-width="4" fill="none" stroke-linecap="round"/><text x="210" y="476" text-anchor="middle" fill="%23FFF9F0" font-size="13" font-family="sans-serif" opacity="0.8">Sample Demonstration Portrait (${tone === 'warm' ? 'Warm Daylight' : 'Soft Studio'})</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

export function SkinAnalysisSection() {
  const {
    skinProfile,
    addAnalysisResult,
    scrollToSection,
    isAuthenticated,
    isEmailVerified,
  } = useGlowUp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string>(() => createSamplePortraitDataUrl('warm'));
  const [sourceLabel, setSourceLabel] = useState<string>('Sample Studio Portrait (Demo)');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [climate, setClimate] = useState<AnalysisInput['climate']>('temperate');
  const [sleepHours, setSleepHours] = useState<AnalysisInput['sleepHours']>('6-to-8');
  const [spfHabit, setSpfHabit] = useState<AnalysisInput['spfHabit']>('daily');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedToHistory, setSavedToHistory] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setCameraError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageDataUrl(reader.result);
        setSourceLabel(file.name);
        setResult(null);
        setSavedToHistory(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera capture is not supported in this browser environment. Please upload a photo instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError('Camera permission was declined or unavailable. You can still upload any facial photo from your device.');
    }
  };

  const handleCaptureFrame = () => {
    const video = videoPreviewRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImageDataUrl(canvas.toDataURL('image/jpeg', 0.88));
      setSourceLabel('Camera Snapshot');
      setResult(null);
      setSavedToHistory(false);
    }
    stopCamera();
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setSavedToHistory(false);
    setProgressPct(8);
    try {
      const res = await skinAnalysisService.analyzeSkin(
        {
          imageDataUrl,
          sourceLabel,
          climate,
          sleepHours,
          spfHabit,
          profile: skinProfile,
        },
        (stage, pct) => {
          setProgressStage(stage);
          setProgressPct(pct);
        }
      );
      setResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSnapshot = () => {
    if (!result || savedToHistory) return;
    addAnalysisResult(result);
    if (isAuthenticated && isEmailVerified) {
      setSavedToHistory(true);
    }
  };

  return (
    <section
      id="analysis"
      data-section="analysis"
      className="relative flex min-h-screen items-center py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-medium tracking-[0.24em] text-[#E8DFF5]">
            05 · AI SKIN ANALYSIS (DEMONSTRATION)
          </p>
          <h2 className="font-editorial mt-2 text-4xl font-normal text-[#FFF9F0] sm:text-5xl">
            Understanding your skin starts here.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#F5DDE6]/85 sm:text-base">
            Upload a clear, evenly lit facial photograph or capture a snapshot to preview how GlowUp pairs visual lighting cues with your saved skin profile.
          </p>
        </div>

        {/* Clear Demonstration & Non-Medical Notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#E8DFF5]/25 bg-[#24192C]/80 px-4 py-3.5 text-xs leading-relaxed text-[#E8DFF5]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#D9B18C]" aria-hidden="true" />
          <p>
            <strong className="font-semibold text-[#FFF9F0]">Demonstration Preview (Non-Medical):</strong>{' '}
            This interface runs a clearly labelled local demonstration engine structured for future server-side AI vision integration. It does not perform medical diagnostics or replace a licensed dermatologist.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column: Photo Upload / Camera & Context Assessment */}
          <div className="glow-glass flex flex-col justify-between rounded-2xl p-6 lg:col-span-5">
            <div>
              <div className="relative overflow-hidden rounded-xl border border-[#FFF9F0]/15 bg-[#130C11]">
                {cameraActive ? (
                  <div className="relative aspect-[4/3] w-full">
                    <video
                      ref={videoPreviewRef}
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={handleCaptureFrame}
                        className="min-h-[40px] cursor-pointer rounded-full bg-[#D9B18C] px-5 py-2 text-xs font-semibold text-[#1D1119]"
                      >
                        Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="min-h-[40px] cursor-pointer rounded-full bg-[#1B1118]/85 px-4 py-2 text-xs text-[#FFF9F0]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={imageDataUrl}
                      alt="Selected facial preview for demonstration skin analysis"
                      className="h-full w-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#160F14]/75 px-6 text-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#D9B18C]/25 border-t-[#D9B18C]" />
                        <p className="mt-4 text-xs font-medium text-[#FFF9F0]">
                          {progressStage}
                        </p>
                        <div className="mt-2.5 h-1.5 w-48 overflow-hidden rounded-full bg-[#FFF9F0]/15">
                          <div
                            className="h-full bg-[#D9B18C] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="mt-2.5 truncate text-xs text-[#F5DDE6]/70">
                Active preview: <span className="text-[#FFF9F0]">{sourceLabel}</span>
              </p>

              {cameraError && (
                <p className="mt-2 rounded-lg border border-[#D9B18C]/35 bg-[#D9B18C]/10 px-3 py-2 text-xs text-[#F5DDE6]">
                  {cameraError}
                </p>
              )}

              {/* Upload & Camera Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#FFF9F0]/20 bg-[#FFF9F0]/[0.04] px-3 py-2.5 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
                >
                  <Upload className="h-4 w-4 text-[#D9B18C]" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#FFF9F0]/20 bg-[#FFF9F0]/[0.04] px-3 py-2.5 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
                >
                  <Camera className="h-4 w-4 text-[#D9B18C]" />
                  <span>Use Camera</span>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-[#F5DDE6]/65">
                <span>Quick demo samples:</span>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setImageDataUrl(createSamplePortraitDataUrl('warm'));
                    setSourceLabel('Sample Daylight Portrait (Demo)');
                  }}
                  className="cursor-pointer underline decoration-[#D9B18C]/50 hover:text-[#FFF9F0]"
                >
                  Warm Daylight
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setImageDataUrl(createSamplePortraitDataUrl('cool'));
                    setSourceLabel('Sample Studio Portrait (Demo)');
                  }}
                  className="cursor-pointer underline decoration-[#D9B18C]/50 hover:text-[#FFF9F0]"
                >
                  Soft Studio
                </button>
              </div>

              {/* Contextual Assessment Questions */}
              <div className="mt-6 space-y-3 border-t border-[#FFF9F0]/12 pt-5">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#F5DDE6]/70">Climate</label>
                    <select
                      value={climate}
                      onChange={(e) => setClimate(e.target.value as AnalysisInput['climate'])}
                      className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#150D12] px-2.5 py-2 text-xs text-[#FFF9F0]"
                    >
                      <option value="dry">Dry / Arid</option>
                      <option value="temperate">Temperate</option>
                      <option value="humid">Humid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F5DDE6]/70">Rest</label>
                    <select
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value as AnalysisInput['sleepHours'])}
                      className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#150D12] px-2.5 py-2 text-xs text-[#FFF9F0]"
                    >
                      <option value="under-6">&lt; 6 hrs</option>
                      <option value="6-to-8">6–8 hrs</option>
                      <option value="8-plus">8+ hrs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F5DDE6]/70">SPF Habit</label>
                    <select
                      value={spfHabit}
                      onChange={(e) => setSpfHabit(e.target.value as AnalysisInput['spfHabit'])}
                      className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#150D12] px-2.5 py-2 text-xs text-[#FFF9F0]"
                    >
                      <option value="daily">Daily</option>
                      <option value="occasional">Occasional</option>
                      <option value="rarely">Rarely</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="mt-6 inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D9B18C] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] transition-colors hover:bg-[#E7C6A5] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'ANALYZING PREVIEW...' : 'RUN DEMONSTRATION ANALYSIS'}</span>
            </button>
          </div>

          {/* Right column: Demonstration Results Dashboard */}
          <div className="glow-glass rounded-2xl p-6 sm:p-8 lg:col-span-7">
            {!result ? (
              <div className="flex h-full flex-col justify-center py-10 text-left">
                <p className="text-xs font-medium tracking-[0.2em] text-[#D9B18C]">
                  READY FOR PREVIEW
                </p>
                <h3 className="font-editorial mt-3 text-3xl text-[#FFF9F0]">
                  Educational Observations &amp; Care Guidance
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#F5DDE6]/80">
                  Run the demonstration analysis to generate zone-by-zone observations, lighting confidence notes, and ingredient guidance tailored to your saved <span className="capitalize text-[#FFF9F0]">{skinProfile.skinType}</span> profile.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#FFF9F0]/12 pt-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-[#D9B18C]">Zone Observations</p>
                    <p className="mt-1 text-xs text-[#F5DDE6]/70">Barrier, T-zone, and UV support notes</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#D9B18C]">Confidence Limits</p>
                    <p className="mt-1 text-xs text-[#F5DDE6]/70">Measured ambient photo brightness check</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#D9B18C]">Gentle Guidance</p>
                    <p className="mt-1 text-xs text-[#F5DDE6]/70">Non-medical educational skincare cues</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#FFF9F0]/12 pb-4">
                  <div>
                    <p className="text-xs font-medium tracking-wider text-[#D9B18C]">
                      DEMONSTRATION RESULT · NON-MEDICAL
                    </p>
                    <h3 className="font-editorial mt-1 text-2xl text-[#FFF9F0] sm:text-3xl">
                      Skin Observation Summary
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSnapshot}
                    disabled={savedToHistory}
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#D9B18C]/50 px-4 py-2 text-xs font-medium text-[#FFF9F0] transition-colors hover:bg-[#D9B18C]/20 disabled:cursor-default disabled:opacity-75"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#D9B18C]" />
                    <span>{savedToHistory ? 'Saved to History' : 'Save to Progress History'}</span>
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-[#FFF9F0]/90">{result.summary}</p>

                {/* Zone observations */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {result.observations.map((obs) => (
                    <div
                      key={obs.zone}
                      className="rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-4"
                    >
                      <p className="text-xs font-semibold text-[#D9B18C]">{obs.focusLevel}</p>
                      <h4 className="mt-1 text-sm font-semibold text-[#FFF9F0]">{obs.zone}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-[#F5DDE6]/80">
                        {obs.observation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Possible concerns & recommended ingredients */}
                <div className="grid grid-cols-1 gap-4 border-t border-[#FFF9F0]/12 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-[#D9B18C]">Possible Focus Areas</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-[#FFF9F0]/85">
                      {result.possibleConcerns.map((c) => (
                        <li key={c}>· {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#D9B18C]">Helpful Ingredient Families</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#E8DFF5]">
                      {result.recommendedIngredients.join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Confidence limitations */}
                <div className="rounded-xl border border-[#FFF9F0]/12 bg-[#140C12]/70 p-4">
                  <p className="text-xs font-semibold text-[#F5DDE6]">
                    Confidence &amp; Lighting Limitations
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F5DDE6]/75">
                    {result.confidenceNote}
                  </p>
                </div>

                {/* Educational guidance */}
                <div>
                  <p className="text-xs font-medium text-[#D9B18C]">
                    Personalized Educational Guidance
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#FFF9F0]/85">
                    {result.educationalGuidance.map((tip) => (
                      <li key={tip}>· {tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('products')}
                    className="min-h-[42px] cursor-pointer rounded-full bg-[#F5DDE6] px-5 py-2 text-xs font-semibold text-[#2A1723] transition-colors hover:bg-[#FFF9F0]"
                  >
                    Explore Matching Products
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('routine')}
                    className="min-h-[42px] cursor-pointer rounded-full border border-[#FFF9F0]/25 px-5 py-2 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
                  >
                    Review My Routine
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
