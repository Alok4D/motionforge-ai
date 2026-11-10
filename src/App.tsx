import { useState } from 'react';
import { Header } from './components/header/Header';
import { VideoImageHub } from './components/ai-hub/VideoImageHub';
import { LiveContainer } from './components/preview/LiveContainer';
import { PromptEditor } from './components/prompt-engine/PromptEditor';
import { ChromaCustomizer } from './components/color-customizer/ChromaCustomizer';
import { AdvancedCreatorTools } from './components/creator-tools/AdvancedCreatorTools';
import { VideoExportPanel } from './components/export/VideoExportPanel';
import { SeoPanel } from './components/seo-expert/SeoPanel';
import { ApiKeyPool } from './components/key-pool/ApiKeyPool';
import { DEFAULT_TEMPLATES } from './constants/defaultPresets';
import type { MotionStyle, AspectRatio, ColorCustomizerSettings, CreatorToolsSettings } from './types/motion.types';
import type { StockMetadata } from './types/seo.types';
import { generateMotionFromImage, editCurrentMotion, generateFromTextPrompt } from './services/gemini/geminiClient';
import { generateLocalStockMetadata } from './services/seo/seoService';
import { keyRotator } from './services/gemini/keyRotator';
import { Toaster, toast } from 'react-hot-toast';

export function App() {
  // Current animation state initialized with default preset
  const [currentCode, setCurrentCode] = useState<string>(DEFAULT_TEMPLATES[0].code);
  const [currentTitle, setCurrentTitle] = useState<string>(DEFAULT_TEMPLATES[0].title);

  // Input & Generation State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState<MotionStyle>('3D Cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('Auto');
  const [promptText, setPromptText] = useState<string>(DEFAULT_TEMPLATES[0].prompt || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // API Key Management Modal State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const activeKeyCount = keyRotator.getState().totalActive;

  // SEO Microstock Metadata State
  const [stockMetadata, setStockMetadata] = useState<StockMetadata>(() =>
    generateLocalStockMetadata(DEFAULT_TEMPLATES[0].title, DEFAULT_TEMPLATES[0].style)
  );

  // Color & Creator Customizer States
  const [colorSettings, setColorSettings] = useState<ColorCustomizerSettings>({
    enabled: true,
    chromaBgColor: '#050712',
    isGreenScreen: false,
    videoElementMode: 'solid',
    elementColor: '#00f0ff',
  });

  const [creatorSettings, setCreatorSettings] = useState<CreatorToolsSettings>({
    speed: 1,
    audioPreset: 'none',
    customAudioFile: null,
    customAudioUrl: null,
    watermarkText: '',
  });

  // Generate Motion from Image (AI Vision Call)
  const handleGenerateFromImage = async (motionPrompt?: string) => {
    if (!imagePreview) {
      toast.error('Please upload or paste an image first');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Analyzing image geometry & extracting colors with Gemini AI...');
    const loadingToast = toast.loading('Gemini AI is analyzing image contours, colors & generating 60FPS motion code...');

    const res = await generateMotionFromImage(imagePreview, style, aspectRatio, motionPrompt);
    setIsProcessing(false);

    if (res.success && res.code) {
      setCurrentCode(res.code);
      setStatusMessage('✓ Procedural motion graphic synthesized successfully!');
      const newTitle = motionPrompt?.trim() || `Procedural ${style} Motion Matrix`;
      setCurrentTitle(newTitle);
      setStockMetadata(generateLocalStockMetadata(newTitle, style));
      toast.success('Motion graphic synthesized successfully!', { id: loadingToast });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      toast.error(`AI Generation Failed: ${res.error || 'Check API Key'}`, { id: loadingToast, duration: 6000 });
      setStatusMessage(null);
    }
  };

  // Create Variation
  const handleCreateVariation = async () => {
    setIsProcessing(true);
    setStatusMessage('Generating creative variation...');
    const loadingToast = toast.loading('Generating creative variation...');

    const instruction = 'Create a fresh visual variation of this procedural motion concept with alternative orbital dynamics and particle flow while keeping the aesthetic harmony.';
    const res = await editCurrentMotion(currentCode, instruction);
    setIsProcessing(false);

    if (res.success && res.code) {
      setCurrentCode(res.code);
      setStatusMessage('✓ Variation synthesized successfully!');
      toast.success('Variation synthesized successfully!', { id: loadingToast });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      toast.error(`Variation Error: ${res.error}`, { id: loadingToast });
      setStatusMessage(null);
    }
  };

  // Edit Current Motion (Natural Language Bengali / English prompt)
  const handleEditCurrentMotion = async () => {
    if (!promptText.trim()) {
      toast.error('Please enter a modification prompt first');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Applying natural language prompt modifications to current code...');
    const loadingToast = toast.loading('Applying modifications with Gemini AI...');

    const res = await editCurrentMotion(currentCode, promptText.trim());
    setIsProcessing(false);

    if (res.success && res.code) {
      setCurrentCode(res.code);
      setStatusMessage('✓ Motion successfully modified!');
      setCurrentTitle(promptText.trim());
      setStockMetadata(generateLocalStockMetadata(promptText.trim(), style));
      toast.success('Motion successfully modified!', { id: loadingToast });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      toast.error(`Modification Error: ${res.error}`, { id: loadingToast });
      setStatusMessage(null);
    }
  };

  // Generate from Text Prompt
  const handleGenerateFromPrompt = async () => {
    if (!promptText.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Synthesizing procedural code from prompt...');
    const loadingToast = toast.loading('Synthesizing procedural code from prompt...');

    const res = await generateFromTextPrompt(promptText.trim(), style, aspectRatio);
    setIsProcessing(false);

    if (res.success && res.code) {
      setCurrentCode(res.code);
      setStatusMessage('✓ Generated from prompt successfully!');
      setCurrentTitle(promptText.trim());
      setStockMetadata(generateLocalStockMetadata(promptText.trim(), style));
      toast.success('Generated from prompt successfully!', { id: loadingToast });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      toast.error(`Generation Error: ${res.error}`, { id: loadingToast });
      setStatusMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast notifications container */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '10px',
            border: '1px solid #334155'
          }
        }} 
      />

      {/* BYOK API Key Modal */}
      {isApiKeyModalOpen && (
        <ApiKeyPool
          isModal={true}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}

      {/* Top Header */}
      <Header 
        pipelineActive={true} 
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        activeKeyCount={activeKeyCount}
      />

      {/* Main Studio Body Grid */}
      <main className="max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Sidebar Hub (4 Cols on large screens) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Video & Image AI Hub */}
          <VideoImageHub
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            style={style}
            setStyle={setStyle}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            isGenerating={isProcessing}
            onGenerateFromImage={handleGenerateFromImage}
            onCreateVariation={handleCreateVariation}
            statusMessage={statusMessage}
          />
        </aside>

        {/* Right Main Stage Viewport & Controls (8 Cols on large screens) */}
        <section className="lg:col-span-8 space-y-5">
          {/* 1. Live Container Preview */}
          <LiveContainer
            proceduralCode={currentCode}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            colorSettings={colorSettings}
            setColorSettings={setColorSettings}
            playbackSpeed={creatorSettings.speed}
          />

          {/* 2. Edit / Regenerate with Prompt */}
          <PromptEditor
            promptText={promptText}
            setPromptText={setPromptText}
            onGenerateFromPrompt={handleGenerateFromPrompt}
            onEditCurrentMotion={handleEditCurrentMotion}
            isProcessing={isProcessing}
          />

          {/* 3. Chroma & Color Customizer */}
          <ChromaCustomizer
            settings={colorSettings}
            setSettings={setColorSettings}
          />

          {/* 4. Advanced Free Creator Tools */}
          <AdvancedCreatorTools
            settings={creatorSettings}
            setSettings={setCreatorSettings}
          />

          {/* 5. Export to Video & Render Queue System */}
          <VideoExportPanel
            proceduralCode={currentCode}
            colorSettings={colorSettings}
            creatorSettings={creatorSettings}
            currentTitle={currentTitle}
          />

          {/* 6. Microstock SEO & CSV Export System */}
          <SeoPanel
            metadata={stockMetadata}
            setMetadata={setStockMetadata}
            conceptPrompt={currentTitle}
          />
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500 font-medium">
        MotionForge AI Studio • In-Browser 4K 60FPS Microstock Procedural Motion Graphics Engine
      </footer>
    </div>
  );
}

export default App;
