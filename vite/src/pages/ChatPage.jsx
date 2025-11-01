import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPage.module.css';
import SaveonDB from '../requisicoes/ChatRegiter'

const ChatPage = () => {
  // 'ChatId' para a "sessão", vai ser executado só uma vez quando o componente (acho que esse é o termo certo) for criado
  const [chatId, setChatId] = useState(() => Date.now().toString());

  const [messages, setMessages] = useState([
    // O banco de dados não precisa desse id, é mais pro react mesmo
    { localId: 1, sender: 'bot', text: 'Olá! Sou seu assistente virtual de IRPF. Como posso ajudar?' }

    //antes estava assim:
    // { id: 1, sender: 'bot', text: 'Olá! Sou seu assistente virtual de IRPF. Como posso ajudar?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessageForState = { 
      localId: Date.now(), // ID local só para o React
      sender: 'user', 
      text: input 
    };
    setMessages(prev => [...prev, userMessageForState]);

    // Aqui que é pra enviar
    const userDataForDB = {
      chatId: chatId,
      sender: 'user',
      text: input
    };

    console.log("Enviando (user):", userDataForDB);
    SaveonDB(userDataForDB);
    
    const currentInput = input;
    setInput('');


    const botText = `Esta é uma resposta simulada para: "${currentInput}". Meu backend legal e maneiro ainda está sendo construído ^_~`;

    const botMessageForState = { 
      localId: Date.now() + 1, // Não acho que o +1 tenha problema aqui, só para diferenciar a key local
      sender: 'bot', 
      text: botText
    };

    // Bot enviando ao DB
    const botDataForDB = {
      chatId: chatId,
      sender: 'bot',
      text: botText
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessageForState]);
      
      console.log("(bot):", botDataForDB);
      // SaveonDB(botDataForDB); 
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