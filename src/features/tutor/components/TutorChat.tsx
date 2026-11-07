/**
 * Persistent AI Tutor Chat component.
 * Provides real-time conversational teaching, action badges, assessment cards,
 * suggested replies, and clear-chat controls.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Crown,
  Sparkles,
  Trash2,
  Cpu,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import type { TutorMessage, InitialAssessmentState } from '../types';
import { InitialAssessmentCard } from './InitialAssessmentCard';

interface TutorChatProps {
  messages: TutorMessage[];
  isThinking: boolean;
  tutorStatus: 'connected' | 'local' | 'thinking';
  assessmentState: InitialAssessmentState;
  onSendMessage: (text: string) => void;
  onSubmitAssessmentAnswer: (answer: number | string) => void;
  onStartAssessment: () => void;
  onClearChat: () => void;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  messages,
  isThinking,
  tutorStatus,
  assessmentState,
  onSendMessage,
  onSubmitAssessmentAnswer,
  onStartAssessment,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, assessmentState.currentQuestionIndex]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isThinking) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract latest suggested replies from last assistant message
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const suggestions = lastAssistantMsg?.suggestedReplies || [
    'Take Initial Skill Assessment',
    'Show me how Knights move',
    'Teach me Castling rules',
    'What should I learn next?',
  ];

  return (
    <div className="flex flex-col h-full bg-[#10121B] border border-[#242938] rounded-2xl shadow-2xl overflow-hidden">
      {/* Tutor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#171A24] border-b border-[#242938]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Crown className="w-5 h-5" />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#171A24] ${
                tutorStatus === 'connected'
                  ? 'bg-emerald-500'
                  : tutorStatus === 'thinking'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-blue-400'
              }`}
            />
          </div>
          <div>
            <h2 className="font-serif text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Grandmaster AI Tutor</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              {tutorStatus === 'connected' && (
                <span className="text-emerald-400">Online • Gemini 3.8 Flash</span>
              )}
              {tutorStatus === 'thinking' && (
                <span className="text-amber-400 animate-pulse">Evaluating Position...</span>
              )}
              {tutorStatus === 'local' && (
                <span className="text-zinc-400">Local Grandmaster Engine</span>
              )}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          {!assessmentState.isActive && (
            <button
              onClick={onStartAssessment}
              title="Take Initial Assessment"
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assess Skill</span>
            </button>
          )}

          {showClearConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onClearChat();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-1 rounded text-[10px] bg-red-600 text-white font-medium hover:bg-red-500 transition"
              >
                Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 rounded text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Clear conversation history"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            } animate-in fade-in duration-200`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-sm shadow-md'
                  : 'bg-[#171A24] text-zinc-200 border border-[#242938] rounded-tl-sm shadow-md'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Action Badges from AI Tutor */}
              {msg.boardActionSummary && msg.boardActionSummary.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-700/50 flex flex-wrap gap-1.5">
                  {msg.boardActionSummary.map((act, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#10121B] text-amber-300 border border-amber-500/20"
                    >
                      <span>♟️</span>
                      <span>{act.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-zinc-600 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {/* In-stream Assessment Card if Active */}
        {assessmentState.isActive && (
          <InitialAssessmentCard
            assessmentState={assessmentState}
            onSubmitAnswer={onSubmitAssessmentAnswer}
          />
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#171A24] border border-[#242938] max-w-[180px] text-xs text-amber-400">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>Analyzing board...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      {!isThinking && suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-[#1D2230] bg-[#121520] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[10px] text-zinc-500 shrink-0 font-medium">Suggestions:</span>
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(sug)}
              className="px-2.5 py-1 rounded-full bg-[#1D2230] hover:bg-[#252C3D] border border-zinc-700/60 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 transition shrink-0 text-xs"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-[#171A24] border-t border-[#242938]">
        <div className="flex items-end gap-2 bg-[#10121B] border border-[#2B3245] focus-within:border-amber-500/60 rounded-xl p-2 transition">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your tutor anything or describe what you want to learn..."
            rows={1}
            disabled={isThinking}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none resize-none max-h-24 leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 transition shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 mt-1.5">
          <span>Press Enter to send • Shift+Enter for new line</span>
          <span>Controls interactive board in real-time</span>
        </div>
      </div>
    </div>
  );
};
