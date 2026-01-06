
import React, { useState } from 'react';
import { PhotoState, AspectRatio } from './types';
import { analyzePhoto, enhancePhoto } from './services/geminiService';
import PhotoUploader from './components/PhotoUploader';
import ComparisonSlider from './components/ComparisonSlider';

const App: React.FC = () => {
  const [state, setState] = useState<PhotoState>({
    originalUrl: null,
    editedUrl: null,
    isAnalyzing: false,
    isProcessing: false,
    analysis: null,
    error: null,
  });

  const [currentBase64, setCurrentBase64] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tone, setTone] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [bokeh, setBokeh] = useState(0);
  const [zoom, setZoom] = useState(0); // -50 to 50
  const [cameraView, setCameraView] = useState("default");
  const [autoColor, setAutoColor] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");

  const handleUpload = async (base64: string, url: string) => {
    setCurrentBase64(base64);
    setState(prev => ({ 
      ...prev, 
      originalUrl: url, 
      editedUrl: null, 
      analysis: null, 
      isAnalyzing: true,
      error: null 
    }));

    try {
      const analysis = await analyzePhoto(base64);
      setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isAnalyzing: false, error: "Failed to analyze photo." }));
    }
  };

  const handleEnhance = async (prompt?: string) => {
    if (!currentBase64) return;
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null 
    }));

    try {
      const resultUrl = await enhancePhoto(
        currentBase64, 
        prompt || "", 
        state.analysis || undefined, 
        tone, 
        autoColor, 
        aspectRatio, 
        sharpness,
        cameraView,
        zoom,
        bokeh
      );
      setState(prev => ({ 
        ...prev, 
        editedUrl: resultUrl, 
        isProcessing: false
      }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: "Failed to process image." 
      }));
    }
  };

  const reset = () => {
    setState({
      originalUrl: null,
      editedUrl: null,
      isAnalyzing: false,
      isProcessing: false,
      analysis: null,
      error: null,
    });
    setCurrentBase64(null);
    setCustomPrompt("");
    setTone(0);
    setSharpness(0);
    setBokeh(0);
    setZoom(0);
    setCameraView("default");
    setAutoColor(true);
    setAspectRatio("1:1");
  };

  const aspectRatios: { label: string; value: AspectRatio; icon: string }[] = [
    { label: "1:1", value: "1:1", icon: "fa-square" },
    { label: "4:3", value: "4:3", icon: "fa-rectangle" },
    { label: "16:9", value: "16:9", icon: "fa-panorama" },
    { label: "3:4", value: "3:4", icon: "fa-file-image" },
    { label: "9:16", value: "9:16", icon: "fa-mobile-screen-button" },
  ];

  const cameraPerspectives = [
    { label: "Original", value: "default", icon: "fa-camera" },
    { label: "Portrait", value: "portrait", icon: "fa-user" },
    { label: "Close Up", value: "close_up", icon: "fa-eye" },
    { label: "Mid Shot", value: "mid_shot", icon: "fa-user-tie" },
    { label: "Profile L", value: "left_side", icon: "fa-arrow-left" },
    { label: "Profile R", value: "right_side", icon: "fa-arrow-right" },
    { label: "Top View", value: "top_view", icon: "fa-arrow-down-long" },
    { label: "Full Body", value: "full_body", icon: "fa-child" },
  ];

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, -50), 50));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-wand-magic-sparkles text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Visionary <span className="text-blue-500">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Pro Photography Studio</p>
            </div>
          </div>
          {state.originalUrl && (
            <button 
              onClick={reset}
              className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Start Over</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col">
        {!state.originalUrl ? (
          <div className="max-w-xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-4">Fix your photography.</h2>
              <p className="text-zinc-400 text-lg">
                Not just filters. AI analysis of lighting, composition, and optics, 
                virtually reshooting your scene to professional standards.
              </p>
            </div>
            <PhotoUploader onUpload={handleUpload} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-stretch flex-1">
            {/* Visual Area - Fixed Height Viewport Constraint */}
            <div className="lg:col-span-8 flex flex-col min-h-0">
              <div className="flex-1 relative bg-zinc-900/20 rounded-3xl border border-zinc-800/50 backdrop-blur-sm shadow-2xl overflow-hidden flex items-center justify-center p-2 min-h-[500px] lg:min-h-0 lg:max-h-[calc(100vh-200px)]">
                {state.editedUrl ? (
                  <ComparisonSlider original={state.originalUrl} edited={state.editedUrl} />
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img 
                      src={state.originalUrl} 
                      className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-500" 
                      alt="Current" 
                    />
                    {(state.isProcessing || state.isAnalyzing) && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-40 rounded-3xl">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-semibold text-lg animate-pulse">
                          {state.isAnalyzing ? "Analyzing Composition..." : "Developing Masterpiece..."}
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {state.isAnalyzing ? "Checking optics and lighting" : "Applying professional grade edits"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {state.error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center gap-3">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {state.error}
                </div>
              )}
            </div>

            {/* Controls Area - Scrollable Column */}
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-1 max-h-[calc(100vh-160px)] custom-scrollbar">
              <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-xl">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-camera-rotate"></i>
                  Camera Perspectives
                </h3>

                <div className="grid grid-cols-2 gap-2 mb-8">
                  {cameraPerspectives.map((cp) => (
                    <button
                      key={cp.value}
                      disabled={state.isProcessing}
                      onClick={() => setCameraView(cp.value)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        cameraView === cp.value 
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      } disabled:opacity-50`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cameraView === cp.value ? 'bg-blue-500/20' : 'bg-zinc-900'}`}>
                        <i className={`fa-solid ${cp.icon} text-sm`}></i>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{cp.label}</span>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2 pt-4 border-t border-zinc-800">
                  <i className="fa-solid fa-sliders"></i>
                  Studio Controls
                </h3>
                
                <div className="space-y-6">
                  {/* Zoom Controls */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Focal Length / Zoom</p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustZoom(-10)}
                        disabled={state.isProcessing}
                        className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                      >
                        <i className="fa-solid fa-magnifying-glass-minus text-sm"></i>
                        <span className="text-[10px] font-bold uppercase">Zoom Out</span>
                      </button>
                      <button 
                        onClick={() => adjustZoom(10)}
                        disabled={state.isProcessing}
                        className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                      >
                        <i className="fa-solid fa-magnifying-glass-plus text-sm"></i>
                        <span className="text-[10px] font-bold uppercase">Zoom In</span>
                      </button>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-blue-500">
                        {zoom === 0 ? "Default Lens" : zoom > 0 ? `Telephoto (${zoom}%)` : `Wide Angle (${Math.abs(zoom)}%)`}
                      </span>
                    </div>
                  </div>

                  {/* Bokeh Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>Sharp BG</span>
                      <span className="text-zinc-300">Artful Bokeh</span>
                      <span>Deep Blur</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={bokeh}
                      disabled={state.isProcessing}
                      onChange={(e) => setBokeh(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-zinc-800 via-zinc-600 to-indigo-500 accent-white disabled:opacity-30"
                      style={{ WebkitAppearance: 'none' }}
                    />
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Output Aspect Ratio</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {aspectRatios.map((ar) => (
                        <button
                          key={ar.value}
                          disabled={state.isProcessing}
                          onClick={() => setAspectRatio(ar.value)}
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${
                            aspectRatio === ar.value 
                              ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          } disabled:opacity-50`}
                        >
                          <i className={`fa-solid ${ar.icon} text-sm`}></i>
                          <span className="text-[10px] font-bold">{ar.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>Cold</span>
                      <span className="text-zinc-300">Tone Shift</span>
                      <span>Warm</span>
                    </div>
                    <input 
                      type="range"
                      min="-100"
                      max="100"
                      value={tone}
                      disabled={state.isProcessing}
                      onChange={(e) => setTone(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-500 via-zinc-700 to-orange-500 accent-white disabled:opacity-30"
                      style={{ WebkitAppearance: 'none' }}
                    />
                  </div>

                  {/* Sharpness Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>Standard</span>
                      <span className="text-zinc-300">Sharpness</span>
                      <span>Ultra</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={sharpness}
                      disabled={state.isProcessing}
                      onChange={(e) => setSharpness(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-zinc-700 to-cyan-400 accent-white disabled:opacity-30"
                      style={{ WebkitAppearance: 'none' }}
                    />
                  </div>

                  <button 
                    disabled={state.isProcessing || state.isAnalyzing}
                    onClick={() => handleEnhance()}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Apply Changes
                  </button>

                  <div className="relative pt-4 border-t border-zinc-800">
                    <p className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-tighter">Custom AI Commands</p>
                    <textarea 
                      value={customPrompt}
                      disabled={state.isProcessing}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. 'Add a retro film grain' or 'Make it nighttime'..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24 transition-all disabled:opacity-50"
                    />
                    <button 
                      disabled={!customPrompt.trim() || state.isProcessing}
                      onClick={() => handleEnhance(customPrompt)}
                      className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      Apply Custom Edit
                    </button>
                  </div>
                </div>
              </div>

              {state.editedUrl && (
                <div className="pb-8">
                  <a 
                    href={state.editedUrl} 
                    download="visionary_ai_edit.png"
                    className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg"
                  >
                    <i className="fa-solid fa-download"></i>
                    Download Result
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini 2.5 Flash Image • Professional AI Studio</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default App;
