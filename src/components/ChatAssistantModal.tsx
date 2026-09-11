import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, MicOff, Bot, User, Volume2 } from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { aiService } from '../services/aiService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { marked } from 'marked';

interface ChatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatAssistantModal: React.FC<ChatAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleSendMessage('');
    }
  }, [isOpen]);

  const processOrderFromResponse = (responseText: string) => {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const orderData = JSON.parse(jsonMatch[1]);
        if (orderData.items && orderData.total && orderData.type) {
          orderService.create({
            customerName: orderData.customerName || 'Cliente IA',
            customerPhone: orderData.customerPhone || '',
            customerAddress: orderData.customerAddress || '',
            items: orderData.items,
            total: orderData.total,
            type: orderData.type,
            status: 'pending',
          });
          return true;
        }
      } catch (e) {
        console.error('Failed to parse order JSON:', e);
      }
    }
    return false;
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText !== undefined ? messageText : input.trim();
    if (!text && messages.length > 0) return;

    const products = productService.getAll();
    const newMessages: ChatMessage[] = [...messages];

    if (text) {
      newMessages.push({ role: 'user', content: text });
    }

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(newMessages, products);
      const orderCreated = processOrderFromResponse(response);

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      if (orderCreated) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '✅ ¡Tu pedido fue registrado exitosamente! Te contactaremos pronto para confirmar los detalles. ¡Gracias por elegir Pizzería Los Genios! 🍕'
          }]);
        }, 1000);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error. ¿Podrías intentar de nuevo?'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        setIsLoading(true);
        try {
          const transcribed = await aiService.transcribeAudio(audioBlob);
          if (transcribed && !transcribed.includes('[Error') && !transcribed.includes('[Transcripción')) {
            setInput(transcribed);
            setTimeout(() => handleSendMessage(transcribed), 300);
          }
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(f => f.type.startsWith('audio/'));
    if (!audioFile) return;

    setIsLoading(true);
    try {
      const transcribed = await aiService.transcribeAudio(audioFile);
      if (transcribed && !transcribed.includes('[Error')) {
        setInput(transcribed);
        setTimeout(() => handleSendMessage(transcribed), 300);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const renderMarkdown = (text: string) => {
    // Remove JSON code blocks from display
    const cleaned = text.replace(/```json\s*[\s\S]*?\s*```/g, '');
    const html = marked(cleaned.trim() || text);
    return { __html: html };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[85vh] transition-all ${isDragOver ? 'ring-2 ring-red-500 scale-[1.02]' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-red-900/30 to-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold font-poppins">Slice</h3>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                En línea
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-red-500 to-yellow-500'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose prose-inverse prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:text-white [&_h1_h2_h3]:text-white [&_code]:bg-gray-700 [&_code]:px-1 [&_code]:rounded"
                      dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                    />
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center rounded-2xl border-2 border-dashed border-red-500 z-10">
            <div className="text-center">
              <Volume2 className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 font-medium">Soltá el archivo de audio para transcribir</p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title={isRecording ? 'Detener grabación' : 'Grabar audio'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Escribí tu mensaje..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              disabled={isLoading}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2 text-center">
            Podés arrastrar archivos de audio para transcribir 🎤
          </p>
        </div>
      </div>
    </div>
  );
};
