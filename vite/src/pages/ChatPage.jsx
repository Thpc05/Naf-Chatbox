import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPage.module.css';
import UpdChatDB from '../requisicoes/ChatRegiter'


const ChatPage = () => {
  const [user, setUser] = useState(null); // vtnc useState -Theodosius // Vai, não é tão ruim -Buisi
  const [chats, setChats] = useState([]); // prefiro let -Theodosius
  const [chatId, setChatId] = useState(null); // saudades js -Theodosius
  const [thisChat, setThisChat] = useState([ // Demorei pra entender q vc n ta copiando e sim ligando -Theodosius // WWWWWW -Buisi
    {sender: 'bot', text: 'Olá! Sou seu assistente virtual de IRPF. Como posso ajudar?' }
  ]);
  
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('LocalUser'));
      
    if (localUser) {
        setUser(localUser);
        
        const localChats = localUser.chats || [];
        setChats(localChats);

        // Logica chatId
        const newChatId = (localChats.length > 0) ? localChats[localChats.length - 1].id + 1 : 1;
        setChatId(newChatId);

        setChats(prevChats => [
          ...prevChats, 
          { chatId: newChatId, messages: [] } 
        ]);

      } else {
        console.error("Usuário não encontrado no localstorage. O login falhou?");
      }
  }, []);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thisChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setThisChat(prev => [...prev, userMessage]);

    console.log(userMessage);

    const botResponse = { 
      // Colocar aqui a cool IA logic, que aplica o BackEnd e tals (/≧▽≦)/
      // Bingchilim

      sender: 'bot', 
      text: `Esta é uma resposta simulada para: "${input}". Meu backend legal e maneiro ainda está sendo construído ^_~`
    };
    setInput('');

    setTimeout(() => {
      setThisChat(prev => [...prev, botResponse]);
    }, 1000);

    const upddChats = chats.map(chat => {
      if (chat.chatId === chatId) {
        return { 
          ...chat, 
          messages: [...chat.messages, userMessage, botResponse] 
        };
      }
      return chat;
    });

    const upddUser = { ...user, chats: upddChats };

    setUser(upddUser);
    setChats(upddChats);

    UpdChatDB({user: upddUser}); // Atualiza o mongo
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
          {thisChat.map((msg) => (
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