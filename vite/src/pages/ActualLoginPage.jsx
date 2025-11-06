import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '../assets/UniforLogo.svg';
import { getAllUsersDB } from '../requisicoes/UsersReqs';

const ActualLoginPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    chats: []
  });

  useEffect(() => { // Pega os dados do db e joga no localstoreage
    const fetchUsers = async () => {
      try {
        const users = await getAllUsersDB();
        localStorage.setItem('AllUsers', JSON.stringify(users));
        localStorage.removeItem('LocalUser'); // Limpa o localUser
        console.log("Usuários carregados e salvos no localStorage.");
      } catch (error) {
        console.error("Falha ao buscar usuários:", error);
      }
    };
    fetchUsers();
 }, []);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allUsers = JSON.parse(localStorage.getItem('AllUsers')) || [];
    const existingUser = allUsers.find(u => u.email === formData.email); // Faz Login

    if (existingUser) {
      console.log('Usuário encontrado:', existingUser);
      localStorage.setItem('LocalUser', JSON.stringify(existingUser));
      navigate('/chat');
    } else {
      alert('Usuário não encontrado. Verifique seu email ou crie uma conta.');
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={`${styles.loginCard} fade-in`}>
        
        <div className={styles.avatarCircle}>
          <img src={logo} alt="Logo" className={styles.logoImage} />
        </div>
        
        <h2>Acesso ao ChatBot IRPF</h2>
        <p>Preencha seus dados para iniciar a conversa.</p>
      
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          
          <label htmlFor="nome">Nome *</label>
          <input 
            type="text" 
            id="nome" 
            name="nome"
            onChange={handleChange} 
            required 
          />
          
          <label htmlFor="email">Email *</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            onChange={handleChange} 
            required 
          />

          <button type="submit" className={styles.submitButton}>
            Acessar Chat
          </button>
          <button type="button" className={styles.altButton} onClick={() => navigate('/Sign')}>
            Não tenho conta
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActualLoginPage;