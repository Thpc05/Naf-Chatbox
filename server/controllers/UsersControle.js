// UsersControle.js

import registerModel from '../models/UserModel.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";


dotenv.config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- FUNÇÃO DE BUSCA REMOVIDA / NÃO UTILIZADA ---


export const responderPergunta = async (req, res) => {
    const { pergunta } = req.body;
    const perguntaLower = pergunta.toLowerCase().trim();
    
    // --- PASSO 1: VERIFICAR SAUDAÇÕES ---
    const isGreeting = 
        perguntaLower === 'oi' || 
        perguntaLower === 'ola' || 
        perguntaLower === 'olá' || 
        perguntaLower.includes('bom dia') || 
        perguntaLower.includes('boa tarde') ||
        perguntaLower.includes('e aí'); 

    if (isGreeting) {
        const respostaApresentacao = "Olá! Eu sou o **Theo Steps**, seu assistente virtual especializado em dúvidas sobre o FAQ oficial do Governo de Imposto de Renda de Pessoa Física. Por favor, pergunte sobre o Imposto de Renda!";
        return res.json({ resposta: respostaApresentacao });
    }
    
   

    const contexto = `
**Instruções de Personalidade e Foco:**
Você é o assistente **Theo Steps**. Sua única função é responder perguntas sobre **Imposto de Renda de Pessoa Física (IRPF)** no contexto da Receita Federal do Brasil.

**Regras de Resposta:**
1. Responda diretamente e de forma clara, consultando apenas seu conhecimento geral.
2. Se a pergunta **NÃO for sobre Imposto de Renda ou assuntos relacionados à Receita Federal**, responda EXATAMENTE: "Não encontrei essa informação na minha base de conhecimento."
`;

    try {
        const prompt = `${contexto}\nPergunta do Usuário: ${pergunta}`;
        const result = await model.generateContent(prompt);
        const resposta = result.response.text();

        res.json({ resposta });
    } catch (err) {
        console.error("Erro ao gerar resposta com o Gemini:", err);
        res.status(500).json({ erro: "Erro ao gerar resposta com o Gemini" });
    }
};


// --- OUTRAS FUNÇÕES ---

export const updUser = async (req, res) => {
    try {
        const { user } = req.body;
        const { nome, email, telefone, bairro, cpf, cnpj, chats } = user.user;

        if (!email) {
            return res.status(400).json({ message: 'Email está vazio.' });
        }

        const options = {
            new: true,
            upsert: true,
            runValidators: true,
        };

        const updatedHistory = await registerModel.findOneAndUpdate(
            { email },
            { nome, email, telefone, bairro, cpf, cnpj, chats },
            options
        );

        res.status(205).json({
            message: "Registro de chat atualizado com sucesso.",
            data: updatedHistory
        });

    } catch (error) {
        console.error("Erro no updUser:", error);
        res.status(500).json({ message: "Erro do servidor ao atualizar o chat." });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await registerModel.find(); 
        res.json({ data: users }); 
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ message: "Erro ao buscar usuários" });
    }
};