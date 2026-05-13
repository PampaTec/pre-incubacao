import React, { useState, useEffect, useRef } from 'react';

export default function ChatConsultor({ id_time, doc_modelo_id, onProgressUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/chat/${id_time}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(m => ({
            role: (m.role || m.Role || '').toLowerCase(),
            text: m.conteudo || m.Conteudo || m['conteúdo'] || ''
          }));
          setMessages(formatted);
        }
      })
      .catch(err => console.error('Erro ao carregar chat:', err));
  }, [id_time]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id_time,
          doc_modelo_id,
          mensagem: userText
        })
      });
      const data = await response.json();

      if (data.texto) {
        setMessages(prev => [...prev, { role: 'model', text: data.texto }]);
      }
      
      if (data.concluidoEtapa) {
        if (onProgressUpdate) onProgressUpdate();
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="bg-pampa-green text-white p-4 font-bold flex justify-between items-center">
        <span>Consultor PampaTec</span>
        <span className="text-sm bg-green-800 px-2 py-1 rounded-full">Gemini AI</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 my-10">
            Nenhuma mensagem ainda. Envie um "Olá" para começar a consultoria!
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === 'user' ? 'bg-pampa-green text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-pampa-green rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pampa-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-pampa-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white flex space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Responda ou faça uma pergunta..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pampa-green"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-pampa-green text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
