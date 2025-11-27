import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ChatPage.module.css';
import updUserDB from '../requisicoes/UsersReqs'


const ChatPage = () => {
  const [user, setUser] = useState(); // vtnc useState -Theodosius // Vai, não é tão ruim -Buisi
  const [chats, setChats] = useState([]); // prefiro let -Theodosius
  const [thisChatId, thisSetChatId] = useState(null); // saudades js -Theodosius
  const [thisChat, setThisChat] = useState([]); // Demorei pra entender q vc n ta copiando e sim ligando -Theodosius // WWWWWW -Buisi
  const [lastChatId, setLastChatId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false); // Saber se é ADM -Buisi
  
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('LocalUser'));
    setThisChat([]); // Reseta o chat atual ao montar o componente
    console.log("Carregando usuário do localStorage:", localUser);
    if (localUser) {
        setUser(localUser);

        if (localUser.isAdmin) {
          setIsAdmin(true);
        }
        
        const localChats = localUser.chats || [];
        setChats(localChats);

        if(localChats.length > 0) {

          const lastChat = localChats[localChats.length - 1];
          setLastChatId(lastChat.chatId);

          // Logica chatId
          const currentChatId = parseInt(lastChat.chatId);
          thisSetChatId(currentChatId);

          setThisChat(lastChat.messages || []);
        } else {
          handleNewChat();
        }

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
  setIsThinking(true);
  e.preventDefault();
  if (input.trim() === '') return;

  const userMessage = { sender: 'user', text: input };
  setThisChat(prev => [...prev, userMessage]);
  setInput('');

  let botResponse = { sender: 'bot', text: '' };

  try {
    const response = await fetch('http://localhost:3035/db/register/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta: input })
    });

    const data = await response.json();
    botResponse.text = data.resposta || "Sem resposta do servidor.";
  } catch (error) {
    console.error("Erro ao chamar a IA:", error);
    botResponse.text = "Erro ao se comunicar com a IA.";
  }

  setIsThinking(false);
  setThisChat(prev => [...prev, botResponse]);

  // Atualiza também no histórico do usuário (localStorage + MongoDB)
  const upddChats = chats.map(c =>
    c.chatId.toString() === thisChatId.toString()
      ? { ...c, messages: [...c.messages, userMessage, botResponse] } 
      : c
  );

  const upddUser = { ...user, chats: upddChats };
  setUser(upddUser);
  setChats(upddChats);
  localStorage.setItem('LocalUser', JSON.stringify(upddUser));
  updUserDB({ user: upddUser });
};


  const handleNewChat = () => {
    const newChatId = lastChatId ? parseInt(lastChatId) + 1 : 1;
    thisSetChatId(newChatId);
    setLastChatId(newChatId);

    const newChat = { chatId: newChatId.toString(), messages: [{'sender': 'bot', 'text': 'Olá! Eu sou o Assistente IRPF. Como posso ajudar você hoje?'}] };
    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    setThisChat(newChat.messages || []);
  };

  return (
    <div className={styles.chatPageContainer}>
      <div className={styles.chatMenuContainer}>
        <h2>Seus Chats</h2>
        <div className={styles.chatMenuList}>
          {chats.map((chat) => (
            <button
              key={chat.chatId}
              className={styles.chatMenuItem}
              onClick={() => {
                thisSetChatId(chat.chatId);
                setThisChat(chat.messages || []);
              }}
            >
              Chat {chat.chatId}
            </button>
          ))}
          <button onClick={handleNewChat} className={styles.btnNewChat}> Novo Chat
          </button>
        </div>
      </div>
      <div className={`${styles.chatContainer} fade-in`}>
        
        <header className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.chatAvatar}>IA</div>
            <div className={styles.chatHeaderText}>
              <h3>Assistente IRPF</h3>
              <p>Online</p>
            </div>
          </div>

          <Link to="/" className={styles.voltarButton}>
            Voltar
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className={styles.adminButton}>
              Painel Admin
            </Link>
          )}

        </header>
        
        <main className={styles.messageList}>
          {thisChat.map((msg) => (
            <div 
              className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              {msg.text}
            </div>
          ))}
          {isThinking && (
            <div className={styles.botThinking}>
              <span>A assistente está pensando</span>
              <span className={styles.dots}>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          )}

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