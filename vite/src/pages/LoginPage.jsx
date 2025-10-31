import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '../assets/UniforLogo.svg';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    bairro: '',
    cpf: '',
    cnpj: '',
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    
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

          <div className={styles.formGrid}>
            <div>
              <label htmlFor="telefone">Telefone *</label>
              <input type="tel" id="telefone" name="telefone" onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="bairro">Bairro *</label>
              <input type="text" id="bairro" name="bairro" onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div>
              <label htmlFor="cpf">CPF (Opcional)</label>
              <input type="text" id="cpf" name="cpf" onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="cnpj">CNPJ (Opcional)</label>
              <input type="text" id="cnpj" name="cnpj" onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Acessar Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;