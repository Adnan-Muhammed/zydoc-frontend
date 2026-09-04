'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './types';

interface ChatTabProps {
  messages: ChatMessage[];
  userId: string;
  inputText: string;
  setInputText: (val: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  peerRoleName: string;
}

export default function ChatTab({
  messages,
  userId,
  inputText,
  setInputText,
  onSendMessage,
}: ChatTabProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          if (msg.senderRole === 'system') {
            return (
              <div key={msg.id} className="text-center my-2">
                <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-850/80 border border-slate-750/60 px-3 py-1 rounded-full shadow-xs">
                  <i className="fas fa-shield-halved text-[10px] text-emerald-400"></i>
                  <span>{msg.text}</span>
                </p>
              </div>
            );
          }

          const isMe = msg.senderId === userId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-opacity duration-200`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-medium text-slate-400">
                  {isMe ? 'You' : msg.senderName}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={onSendMessage}
        className="p-3 bg-[#0d1322] border-t border-slate-800/80 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-750/80 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 active:scale-95 transition-all shadow-sm hover:shadow-indigo-500/20 disabled:opacity-40 disabled:pointer-events-none shrink-0"
          title="Send message"
        >
          <i className="fas fa-paper-plane text-xs"></i>
        </button>
      </form>
    </div>
  );
}
