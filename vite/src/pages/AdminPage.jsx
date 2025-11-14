import React, { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { Link } from 'react-router-dom';

// Componentes da Dashboard -Buisi
const AdminDashboard = ({ stats }) => (
  <div className={styles.statsGrid}>
    <div className={styles.statCard}>
      <h3>Total de Usuários</h3>
      <p>{stats.totalUsers}</p>
    </div>
    <div className={styles.statCard}>
      <h3>Total de Chats Criados</h3>
      <p>{stats.totalChats}</p>
    </div>
    <div className={styles.statCard}>
      <h3>Total de Mensagens</h3>
      <p>{stats.totalMessages}</p>
    </div>
    <div className={styles.statCard}>
      <h3>Média de Msgs / Usuário</h3>
      <p>{stats.avgMsgsPerUser.toFixed(2)}</p>
    </div>
    {/* Muito provavelmente vai ter mudanças -Buisi */}
  </div>
);

const UserManagement = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter(user => 
    (user.nome && user.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedUser) {
    return (
      <div className={styles.userDetails}>
        <button onClick={() => setSelectedUser(null)} className={styles.backButton}>
          &larr; Voltar para a lista
        </button>
        <h2>{selectedUser.nome}</h2>
        <p><strong>Email:</strong> {selectedUser.email}</p>
        <p><strong>Telefone:</strong> {selectedUser.telefone || 'N/A'}</p>
        <p><strong>Bairro:</strong> {selectedUser.bairro || 'N/A'}</p>
        <p><strong>CPF:</strong> {selectedUser.cpf || 'N/A'}</p>
        <p><strong>CNPJ:</strong> {selectedUser.cnpj || 'N/A'}</p>
        <p><strong>Admin:</strong> {selectedUser.isAdmin ? 'Sim' : 'Não'}</p>
        <hr />
        <h3>Conversas do Usuário ({selectedUser.chats.length})</h3>
        <div className={styles.chatHistory}>
          {selectedUser.chats.map(chat => (
            <details key={chat.chatId} className={styles.chatAccordion}>
              <summary>Chat {chat.chatId} ({chat.messages.length} mensagens)</summary>
              <div className={styles.messageListAdmin}>
                {chat.messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
                  >
                    <strong>{msg.sender === 'user' ? 'Usuário:' : 'Bot:'}</strong> {msg.text}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <input 
        type="text"
        placeholder="Buscar por nome ou email..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul className={styles.userList}>
        {filteredUsers.map(user => (
          <li key={user._id} onClick={() => setSelectedUser(user)}>
            <strong>{user.nome}</strong>
            <small>{user.email}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};


const AdminPage = () => {
  const [tab, setTab] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3035/db/register/getAllUsers');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados dos usuários.');
        }
        const data = await response.json();
        setAllUsers(data.data || []);
        
        calculateStats(data.data || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const calculateStats = (users) => {
      const totalUsers = users.length;
      let totalChats = 0;
      let totalMessages = 0;
      
      users.forEach(user => {
        totalChats += user.chats ? user.chats.length : 0;
        user.chats.forEach(chat => {
          totalMessages += chat.messages ? chat.messages.length : 0;
        });
      });

      setStats({
        totalUsers,
        totalChats,
        totalMessages,
        avgMsgsPerUser: totalUsers > 0 ? totalMessages / totalUsers : 0, // Tentativa de calculo para a médio -Buisi
      });
    };

    fetchAllUsers();
  }, []);

  if (loading) return <p className={styles.loading}>Carregando dados do admin...</p>;
  if (error) return <p className={styles.error}>Erro: {error}</p>;

  return (
    <div className={styles.adminPageContainer}>
      <nav className={styles.adminNav}>
        <h1>Painel do Administrador</h1>
        <div className={styles.navLinks}>
          <button 
            onClick={() => setTab('dashboard')}
            className={tab === 'dashboard' ? styles.active : ''}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setTab('users')}
            className={tab === 'users' ? styles.active : ''}
          >
            Gerenciar Usuários
          </button>
        </div>
        <Link to="/chat" className={styles.backToChat}>
          Voltar ao Chat
        </Link>
      </nav>

      <main className={styles.adminContent}>
        {tab === 'dashboard' && stats && <AdminDashboard stats={stats} />}
        {tab === 'users' && <UserManagement users={allUsers} />}
      </main>
    </div>
  );
};

export default AdminPage;