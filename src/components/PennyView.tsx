import React, { useState, useRef, useEffect } from 'react';
import { Transaction, SavingsGoal, CurrencyCode, CURRENCY_SYMBOLS } from '../types';
import { Sparkles, Send, Bot, User, Trash2, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface PennyViewProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  userName: string;
  currency: CurrencyCode;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function PennyView({ transactions, goals, userName, currency, isPro, onUpgradeClick }: PennyViewProps) {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('cashflowr_penny_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      } catch (e) {
        // Fallback to initial message
      }
    }
    return [
      {
        id: 'initial',
        role: 'model',
        text: `Hey **${userName}**! I'm **Penny**, your smart financial co-pilot! 🪙\n\nI have real-time access to your transactions and active savings goals. Ask me anything like:\n* "Can I afford Chick-fil-A today? 🍔"\n* "How is my Tesla fund doing? ⚡"\n* "What is my biggest expense category? 📈"\n* "Give me 3 clever tips to save money this week!"`,
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync chat to localStorage
  useEffect(() => {
    localStorage.setItem('cashflowr_penny_chat', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Calculate financial figures for context
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Suggested quick prompts
  const SUGGESTED_PROMPTS = [
    { text: 'Can I afford Chick-fil-A today? 🍔', query: 'Can I afford to grab Chick-fil-A today?' },
    { text: 'Tesla goal update? ⚡', query: 'How is my Tesla Model Y savings goal doing? Give me some feedback.' },
    { text: 'Reduce my expenses 📈', query: 'Analyze my transactions and give me 3 actionable tips to reduce my expenses this week.' },
    { text: 'Check my top categories 📊', query: 'What is my top spending category and how much have I spent there?' },
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const financialContext = {
        userName,
        balance: netBalance,
        income: totalIncome,
        expenses: totalExpense,
        goals,
        transactions,
        currency,
        currencySymbol,
      };

      // Map messages history to Gemini role schema:
      // Note: we take the last 10 messages to keep the token usage optimal
      const historyToSend = messages
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch('/api/penny/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyToSend,
          financialContext,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `penny-${Date.now()}`,
            role: 'model',
            text: data.text,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.message || data.error || 'Failed to fetch reply');
      }
    } catch (error: any) {
      console.error('Error talking to Penny:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `penny-err-${Date.now()}`,
          role: 'model',
          text: `⚠️ **Unable to connect with Penny AI**\n\n${error.message || 'Make sure the Gemini API Key is configured in the Secrets panel, or try again in a moment.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }

    setMessages([
      {
        id: 'initial',
        role: 'model',
        text: `Hey **${userName}**! I've cleared our chat history. How can I help you co-pilot your budget today? 🪙`,
        timestamp: new Date(),
      },
    ]);
    setIsConfirmingClear(false);
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatPennyMessage = (text: string) => {
    const textWithCurrency = text.replaceAll('$', currencySymbol);
    return textWithCurrency.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-2" />;

      // Header checks
      if (cleanLine.startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-indigo-400 mt-4 mb-2 flex items-center gap-1.5">
            {cleanLine.replace('###', '').trim()}
          </h4>
        );
      }

      // Bullet lists
      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        const bulletContent = cleanLine.substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-200 leading-relaxed py-1">
            {parseBoldText(bulletContent)}
          </li>
        );
      }

      // Numbered lists
      const listMatch = cleanLine.match(/^(\d+)\.\s(.*)/);
      if (listMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs text-slate-200 leading-relaxed py-1">
            {parseBoldText(listMatch[2])}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed mb-2">
          {parseBoldText(cleanLine)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-200px)] min-h-[680px] md:min-h-[820px]" id="penny-view-root">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between" id="penny-header">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            Penny AI Advisor
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Smart budgeting co-pilot with real-time transaction ledger awareness
          </p>
        </div>

        {messages.length > 1 && (
          <button
            id="btn-clear-penny-chat"
            onClick={handleClearChat}
            onMouseLeave={() => setIsConfirmingClear(false)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isConfirmingClear
                ? 'bg-rose-950/40 text-rose-400 border-rose-900/50 hover:bg-rose-900/40 animate-pulse'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900 border-transparent hover:border-slate-800'
            }`}
            title="Clear conversation history"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isConfirmingClear ? 'Confirm Clear?' : 'Clear Chat'}
            </span>
          </button>
        )}
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 relative flex flex-col min-h-0" id="penny-chat-box-container">
        <div 
          className="flex-1 flex flex-col bg-slate-900 border border-slate-800/80 rounded-[32px] overflow-hidden shadow-2xl relative"
          id="penny-chat-box"
        >
          {/* Active Indicators / Disclaimers */}
          <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-850 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 absolute" />
              <span className="pl-3">Penny is Online</span>
            </div>
            <div>Secure Sandbox • AI Powered</div>
          </div>

          {/* Message logs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-sidebar-scrollbar">
            {messages.map((m) => {
              const isPenny = m.role === 'model';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${isPenny ? 'self-start' : 'self-end ml-auto'}`}
                  id={`message-bubble-${m.id}`}
                >
                  {isPenny && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}
                  
                  <div
                    className={`p-4 rounded-2xl text-xs relative ${
                      isPenny
                        ? 'bg-slate-950/60 border border-slate-850/60 text-slate-100 rounded-tl-none'
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-950/40'
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      {isPenny ? formatPennyMessage(m.text) : <p className="leading-relaxed font-medium">{m.text}</p>}
                    </div>
                    <span className={`block text-[9px] mt-1.5 text-right font-bold tracking-wide ${isPenny ? 'text-slate-500' : 'text-indigo-200'}`}>
                      {m.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!isPenny && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/30">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%] self-start" id="penny-typing-indicator">
                <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-spin">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850/60 text-slate-400 rounded-tl-none flex items-center gap-2">
                  <span className="text-xs font-bold italic">Penny is calculating context...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Suggested prompts bento panel */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-6 py-4 bg-slate-950/20 border-t border-slate-850/40" id="penny-suggested-prompts">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Quick suggestions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.query)}
                    className="flex items-center justify-between text-left p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850/60 hover:border-indigo-500/30 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer group"
                  >
                    <span className="truncate pr-2">{p.text}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT CONTAINER */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-850 flex items-center gap-3" id="penny-input-panel">
            <input
              type="text"
              placeholder="Ask Penny (e.g., 'Can I buy Chick-fil-A today?')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputValue);
              }}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-xs font-medium placeholder-slate-500 px-4 py-3.5 rounded-xl outline-none transition-all disabled:opacity-50"
            />
            <button
              id="btn-penny-send"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-950/40 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              title="Send message to Penny"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
