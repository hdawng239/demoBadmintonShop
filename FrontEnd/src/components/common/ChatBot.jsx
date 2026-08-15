import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Bot, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

const QUICK_PROMPTS = [
  'Vợt công thủ toàn diện 1-2 triệu',
  'Vợt 4U cho người mới chơi',
  'Giày cầu lông bám sân tốt',
  'Cách chọn độ căng cước (lbs)'
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: '🏸 Xin chào! Tôi là Trợ lý AI Cầu Lông Naro. Bạn đang tìm dòng vợt 3U/4U, giày hay cần tư vấn lối chơi nào hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setSessionId('sess_' + Math.random().toString(36).substring(2, 9));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = async (customMessage) => {
    const userMessage = (typeof customMessage === 'string' ? customMessage : input).trim();
    if (!userMessage) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat`, {
        message: userMessage,
        sessionId,
        history: messages.slice(1)
      });

      const botReply = response.data.reply || 'Cảm ơn bạn! Hãy để tôi kiểm tra thông số kho hàng.';
      setMessages([...newMessages, { role: 'bot', content: botReply }]);
    } catch (error) {
      console.error('Lỗi chatbot:', error);
      setMessages([...newMessages, { role: 'bot', content: 'Xin lỗi, kết nối tới AI đang gián đoạn. Vui lòng thử lại sau giây lát!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 right-0 z-50">
      {/* Floating Tucked-In Trigger Capsule */}
      {!isOpen && (
        <div className="transform translate-x-[calc(100%-50px)] hover:translate-x-0 transition-transform duration-300 ease-out pr-0">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 pl-3.5 pr-6 py-2.5 bg-[#0e1015] hover:bg-zinc-950 text-white rounded-l-full border-y border-l border-zinc-700/80 shadow-2xl transition-all cursor-pointer select-none"
            title="Nhấp để nhận tư vấn chuyên môn từ AI"
          >
            {/* Glowing Bot Icon & Pulsing Beacon */}
            <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
              <Bot size={22} className="text-[#84cc16] group-hover:scale-110 transition-transform" />
              {/* Neon Green Pulsing Dot */}
              <span className="absolute -top-1 -right-0.5 w-3 h-3 bg-[#84cc16] rounded-full animate-ping opacity-75" />
              <span className="absolute -top-1 -right-0.5 w-2.5 h-2.5 bg-[#84cc16] rounded-full ring-2 ring-[#0e1015]" />
            </div>

            {/* Expandable Label */}
            <span className="text-xs font-black uppercase tracking-wider text-white whitespace-nowrap pl-1">
              TƯ VẤN AI
            </span>
          </button>
        </div>
      )}

      {/* Chat Popover Dialog */}
      {isOpen && (
        <div className="mr-4 sm:mr-6 w-[360px] sm:w-[410px] h-[520px] bg-white dark:bg-[#13141b] rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-zinc-950 px-5 py-4 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lime-400 border border-zinc-700">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                  AI Chuyên Gia Cầu Lông
                  <span className="text-[10px] bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">Tư vấn chọn vợt 3U/4U & kỹ thuật 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/70 dark:bg-[#0e0f14] text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-950 text-lime-400 flex items-center justify-center mr-2 shrink-0 text-xs font-bold border border-zinc-800">
                    🏸
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#ea580c] text-white rounded-tr-xs shadow-xs font-medium'
                      : 'bg-white dark:bg-[#181922] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-zinc-950 text-lime-400 flex items-center justify-center shrink-0 border border-zinc-800">
                  🏸
                </div>
                <div className="bg-white dark:bg-[#181922] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-xs flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-white dark:bg-[#13141b] border-t border-zinc-100 dark:border-zinc-800 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-[#ea580c] border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 transition-all shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-[#13141b] border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Hỏi AI về thông số vợt, giày..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-[#181924] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-[#ea580c] transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-zinc-800 text-white hover:bg-[#ea580c] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
