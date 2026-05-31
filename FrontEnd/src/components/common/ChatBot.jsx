import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Bot, User, MessageCircle } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Chào bạn! Mình là trợ lý AI của Naro Shop. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Generate a random session ID on component mount
  useEffect(() => {
    const sId = 'sess_' + Math.random().toString(36).substr(2, 9);
    setSessionId(sId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Chuẩn bị lịch sử để gửi lên (bỏ tin nhắn đầu tiên của bot nếu muốn, hoặc gửi tất cả)
      // Gemini history format cần { role: 'user'/'model', parts: [{ text }] } nhưng BackEnd đã xử lý map lại
      const response = await axios.post(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/chat`, {
        message: userMessage,
        sessionId: sessionId,
        history: messages.slice(1) // Bỏ tin nhắn chào mừng mặc định của bot để history bắt đầu bằng user
      });

      const botReply = response.data.reply;
      setMessages([...newMessages, { role: 'bot', content: botReply }]);
    } catch (error) {
      console.error("Lỗi gọi Chatbot:", error);
      setMessages([...newMessages, { role: 'bot', content: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' }]);
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút Chat (Trạng thái đóng) */}
      {!isOpen && (
        <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
          {/* Tooltip bong bóng */}
          <div className="absolute bottom-full right-0 mb-4 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg whitespace-nowrap opacity-100 transition-opacity animate-bounce">
            <span className="font-medium">Bạn cần hỗ trợ gì?</span>
            <div className="absolute bottom-[-6px] right-2 w-3 h-3 bg-orange-500 transform rotate-45"></div>
          </div>
          
          {/* Avatar Robot */}
          <div className="w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-primary/20 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform">
            <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
            <Bot size={32} className="text-primary z-10" />
            <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      )}

      {/* Khung Chat (Trạng thái mở) */}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all transform origin-bottom-right animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Naro Shop</h3>
                <p className="text-xs text-white/80">Chat với chúng tôi</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            <div className="text-center text-xs text-gray-400 my-4 border-b pb-4">
              Bạn đang chat với Trợ lý AI của Naro Shop
            </div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0">
                    <Bot size={16} className="text-primary" />
                  </div>
                )}
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-center space-x-2">
                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-primary" />
                  </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm flex space-x-1 shadow-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập nội dung..."
              className="flex-1 max-h-24 h-10 min-h-[40px] resize-none border-0 focus:ring-0 text-sm py-2 px-3 bg-gray-100 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`ml-2 p-2 rounded-full flex shrink-0 items-center justify-center transition-colors ${
                !input.trim() || isTyping 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="bg-white py-1 text-center border-t border-gray-50">
            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1 font-medium">
               <Bot size={10}/> Powered by AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
