import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Eye,
  EyeOff,
  ArrowLeft,
  Key,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Shield,
  Cpu,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';
import {
  coachApiClient,
  type AIProviderConfigStatus,
  type DiscoveredModel,
} from '../../services/ai/coachClient';

export const SettingsPage: React.FC = () => {
  const { currentProfile, updateSettings } = useAppStore();
  const settings = currentProfile.settings;

  // AI Provider State
  const [configStatus, setConfigStatus] = useState<AIProviderConfigStatus | null>(null);
  const [models, setModels] = useState<DiscoveredModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string>('gemini-3.8-flash');
  
  // Form & UI States
  const [inputKey, setInputKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [isRefreshingModels, setIsRefreshingModels] = useState<boolean>(false);
  const [isSettingModel, setIsSettingModel] = useState<boolean>(false);
  
  // Toast / Feedback Messages
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load configuration and models on mount
  useEffect(() => {
    loadAIConfig();
  }, []);

  const loadAIConfig = async () => {
    try {
      const status = await coachApiClient.getConfigStatus();
      setConfigStatus(status);
      setActiveModelId(status.activeModelId);

      const modelData = await coachApiClient.getModels().catch(() => ({ models: [], activeModelId: status.activeModelId }));
      if (modelData.models && modelData.models.length > 0) {
        setModels(modelData.models);
      }
    } catch (err) {
      console.warn('Failed to load AI configuration:', err);
    }
  };

  const handleToggleSound = (checked: boolean) => {
    updateSettings({ soundEnabled: checked });
    if (checked) {
      playChessClick(true, 0.7);
    }
  };

  const handleToggle = (key: keyof typeof settings, checked: boolean) => {
    playChessClick(settings.soundEnabled, 0.5);
    updateSettings({ [key]: checked });
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid Gemini API Key.' });
      return;
    }

    setIsSavingKey(true);
    setFeedback(null);
    try {
      const res = await coachApiClient.saveApiKey(inputKey.trim());
      setConfigStatus(res.status);
      setInputKey('');
      setShowKey(false);
      setFeedback({ type: 'success', message: 'API Key securely encrypted and saved to server.' });
      
      // Auto-refresh available models after key save
      handleRefreshModels(inputKey.trim());
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save API Key.',
      });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!window.confirm('Are you sure you want to remove your custom Gemini API key? The coach will revert to local fallback mode unless a default server key exists.')) {
      return;
    }

    setFeedback(null);
    try {
      const res = await coachApiClient.removeApiKey();
      setConfigStatus(res.status);
      setFeedback({ type: 'info', message: 'Custom API Key removed. AI Coach is in fallback mode.' });
      handleRefreshModels();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to remove API key.',
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setFeedback(null);
    try {
      const result = await coachApiClient.testConnection(inputKey.trim() || undefined);
      if (result.success) {
        setFeedback({
          type: 'success',
          message: `${result.message} (${result.modelCount} text models discovered)`,
        });
      } else {
        setFeedback({ type: 'error', message: result.message || 'Connection test failed.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Connection test failed.',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRefreshModels = async (keyOverride?: string) => {
    setIsRefreshingModels(true);
    try {
      const modelData = await coachApiClient.getModels();
      if (modelData.models && modelData.models.length > 0) {
        setModels(modelData.models);
        setActiveModelId(modelData.activeModelId);
      }
    } catch (err) {
      console.warn('Failed to refresh models:', err);
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleSelectModel = async (newModelId: string) => {
    setIsSettingModel(true);
    setFeedback(null);
    try {
      const res = await coachApiClient.setActiveModel(newModelId);
      setActiveModelId(res.activeModelId);
      setFeedback({
        type: 'success',
        message: `Active AI model set to ${res.activeModelId}. All coach features updated.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to change model.',
      });
    } finally {
      setIsSettingModel(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            onClick={() => playChessClick(settings.soundEnabled)}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
              Academy Settings
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Configure acoustic feedback, piece aesthetics, and AI Provider intelligence.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : feedback.type === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* AI Provider & Intelligence Section */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#242938]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D6B36A]" />
              <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
                AI Provider & Intelligence Configuration
              </h3>
            </div>
            {configStatus && (
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${
                    configStatus.configured
                      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      configStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {configStatus.configured ? 'Provider Configured' : 'Local Fallback Active'}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#9297A5] leading-relaxed">
            Chess Academy combines real-time Stockfish WASM evaluation (chess truth) with Google Gemini AI for natural language coaching. Your API key is stored encrypted on the server using AES-256-GCM.
          </p>

          {/* Key Management Form */}
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#F4F4F5] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#D6B36A]" />
                  Google Gemini API Key
                </span>
                {configStatus?.maskedKey && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active: {configStatus.maskedKey}
                  </span>
                )}
              </label>

              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={
                    configStatus?.configured
                      ? 'Enter new API key to update...'
                      : 'AI... (Enter your Google Gemini API Key)'
                  }
                  className="w-full bg-[#10121B] border border-[#242938] focus:border-[#D6B36A] text-xs text-[#F4F4F5] placeholder-[#636878] rounded-lg px-3 py-2.5 pr-10 outline-none font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 text-[#9297A5] hover:text-[#F4F4F5] transition-colors"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSavingKey || !inputKey.trim()}
                className="px-4 py-2 bg-[#D6B36A] hover:bg-[#c4a159] disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                {isSavingKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Encrypting & Saving...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Save Credentials
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-3 py-2 bg-[#10121B] hover:bg-[#1a1e2d] border border-[#242938] text-xs text-[#F4F4F5] font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isTestingConnection ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D6B36A]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                Test Connection
              </button>

              {configStatus?.isCustomKey && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="px-3 py-2 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Remove Custom Key
                </button>
              )}
            </div>
          </form>

          {/* Model Discovery & Selection */}
          <div className="border-t border-[#242938] pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#F4F4F5] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#D6B36A]" />
                Select Active Gemini Model
              </label>

              <button
                type="button"
                onClick={() => handleRefreshModels()}
                disabled={isRefreshingModels}
                className="text-[11px] text-[#D6B36A] hover:text-[#e4c27b] flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingModels ? 'animate-spin' : ''}`} />
                Refresh Models
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <select
                  value={activeModelId}
                  onChange={(e) => handleSelectModel(e.target.value)}
                  disabled={isSettingModel}
                  className="w-full bg-[#10121B] border border-[#242938] focus:border-[#D6B36A] text-xs text-[#F4F4F5] rounded-lg p-2.5 outline-none transition-colors cursor-pointer"
                >
                  {models.length > 0 ? (
                    models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash (gemini-3.8-flash)</option>
                      <option value="gemini-4-argon">Gemini 4 Argon (gemini-4-argon)</option>
                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (gemini-3.1-flash-lite)</option>
                      <option value="gemini-nano-banana-2.1">Gemini Nano Banana 2.1 (gemini-nano-banana-2.1)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-center p-2.5 rounded-lg bg-[#10121B]/80 border border-[#242938] text-center">
                <span className="text-[11px] font-mono text-zinc-300">
                  Active: <strong className="text-[#D6B36A] font-semibold">{activeModelId}</strong>
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#9297A5]">
              Model choice takes effect immediately across hints, positional analysis, move evaluations, and live coach chat.
            </p>
          </div>
        </div>

        {/* Audio Preferences */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#242938]">
            <Volume2 className="w-4 h-4 text-[#D6B36A]" />
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Acoustic Feedback
            </h3>
          </div>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#F4F4F5] block">
                Wooden Chessboard Acoustics
              </span>
              <span className="text-[11px] text-[#9297A5]">
                Rich synthesized clicks and chimes for moves, captures, and checkmate.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleToggleSound(e.target.checked)}
              className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
            />
          </label>
        </div>

        {/* Board Visual Options */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#242938]">
            <Eye className="w-4 h-4 text-[#D6B36A]" />
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Board Aesthetics & Visual Assists
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">
                  Highlight Legal Move Indicators
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Displays subtle guide dots on valid destination squares during selection.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showLegalMoves}
                onChange={(e) => handleToggle('showLegalMoves', e.target.checked)}
                className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">
                  Rank & File Coordinate Notations
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Shows 1-8 ranks and a-h files along the board edges.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showCoordinates}
                onChange={(e) => handleToggle('showCoordinates', e.target.checked)}
                className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#10121B]/60 border border-[#242938] hover:border-[#D6B36A]/40 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#F4F4F5] block">
                  Auto-Queen on Promotion
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Automatically promotes passed pawns to Queen unless alternative is specified.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoQueenOnPromotion}
                onChange={(e) => handleToggle('autoQueenOnPromotion', e.target.checked)}
                className="w-4 h-4 accent-[#D6B36A] rounded bg-[#0B0D14] border-[#242938] cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
