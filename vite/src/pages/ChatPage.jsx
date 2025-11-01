import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPage.module.css';
import SaveonDB from '../requisicoes/ChatRegiter'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Olá! Sou seu assistente virtual de IRPF. Como posso ajudar?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    console.log(userMessage);
    SaveonDB(userMessage);

    const botResponse = { 
      // Colocar aqui a cool IA logic, que aplica o BackEnd e tals (/≧▽≦)/

      id: Date.now() + 1, 
      sender: 'bot', 
      text: `Esta é uma resposta simulada para: "${input}". Meu backend legal e maneiro ainda está sendo construído ^_~`
    };
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className={styles.chatPageContainer}>
      
      <div className={`${styles.chatContainer} fade-in`}>
        
        <header className={styles.chatHeader}>
          <div className={styles.chatAvatar}>IA</div>
          <div className={styles.chatHeaderText}>
            <h3>Assistente IRPF</h3>
            <p>Online</p>
          </div>
        </header>
        
        <main className={styles.messageList}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>
        
        <footer className={styles.inputArea}>
          <form onSubmit={handleSend} className={styles.inputForm}>
            <input 
              type="text" 
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">
              Enviar
            </button>
          </form>
        </footer>
      </div>
      
    </div>
  );
};

export default ChatPage;