import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '../assets/UniforLogo.svg';

const ActualLoginPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    chats: []
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    localStorage.setItem('LocalUser', JSON.stringify(formData));
    
    navigate('/chat');
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