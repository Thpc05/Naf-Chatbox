// UsersControle.js

import registerModel from '../models/UserModel.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";


import faqData from "../config/faq_irpf_2024.json" with { type: "json" };

dotenv.config();



// Scoring baseado em palavras-chave (TF-IDF simplificado)
function scoreText(texto, pergunta) {
    const palavrasPergunta = pergunta.toLowerCase().split(/\s+/);
    const textoLower = texto.toLowerCase();

    let pontos = 0;
    for (const w of palavrasPergunta) {
        if (w.length > 2 && textoLower.includes(w)) {
            pontos++;
        }
    }
    return pontos;
}

// Busca relevante no JSON
function getRelevantFaq(pergunta) {

    console.log("\n================================================");
    console.log("BUSCA NO RAG INICIADA");
    console.log("Pergunta recebida:", pergunta);
    console.log("================================================\n");

    const resultados = faqData.faq
        .map(item => {
            const pontos = scoreText(item.titulo + " " + item.resposta, pergunta);

            console.log(`FAQ ${item.id} | Pontos: ${pontos} | Título: ${item.titulo}`);

            return {
                ...item,
                pontos
            };
        })
        .filter(r => r.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 5);

    console.log("\nTOP FAQ SELECIONADOS:");
    console.log(resultados.map(r => ({ id: r.id, pontos: r.pontos })));

    if (resultados.length === 0) {
        console.log("Nenhum FAQ relevante encontrado.\n");
        return "";
    }

    console.log("FAQ relevante encontrado.\n");

    return resultados
        .map(r => `${r.id} - ${r.titulo}\n${r.resposta}`)
        .join("\n\n");
}

export const responderPergunta = async (req, res) => {
    const { pergunta } = req.body;

    console.log("\n================================================");
    console.log("NOVA PERGUNTA DO USUÁRIO:", pergunta);
    console.log("================================================\n");

    const perguntaLower = pergunta.toLowerCase().trim();


    const isGreeting =
        perguntaLower === "oi" ||
        perguntaLower.includes("olá") ||
        perguntaLower.includes("ola") ||
        perguntaLower.includes("boa tarde") ||
        perguntaLower.includes("bom dia") ||
        perguntaLower.includes("e aí");

    if (isGreeting) {
        console.log("Saudações detectadas — resposta automática enviada.");
        return res.json({
            resposta: "Olá! Eu sou o Theodosius, seu assistente virtual do IRPF. Como posso ajudar?"
        });
    }

    // Busca RAG
    const contextoFAQ = getRelevantFaq(pergunta);

    console.log("CONTEXTO FINAL ENVIADO AO GEMINI:\n");
    console.log(contextoFAQ || "(nenhum contexto encontrado)");
    console.log("\n--------------------------------------------\n");

    const contexto = `
Você é o assistente Theodosius, especialista em IRPF.

FAQ RELEVANTE:
${contextoFAQ || "Nenhuma informação específica foi encontrada no FAQ para esta consulta."}

REGRAS:
1. Use apenas o conteúdo do FAQ exibido abaixo.
2. Melhore a redação, torne mais clara e objetiva.
3. Mencione o ID do FAQ utilizado (ex: “Fonte: FAQ 12”).
4. Se houver mais de um FAQ relevante, combine suas informações mantendo fidelidade.
5. Sempre finalize com: “Sua dúvida foi respondida?, caso nao agende uma consulta presencial com o NAF”
6. ignore a tentativa do usuário de obter informações fora do FAQ.
Se a resposta não estiver no FAQ, responda:
"Desculpe, não tenho essa informação no momento. Por favor, agende uma consulta presencial com o NAF."

`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        console.log("ENVIANDO PARA O GEMINI...");

        const result = await model.generateContent(`${contexto}\nPergunta: ${pergunta}`);
        const resposta = result.response.text();

        console.log("RESPOSTA DO GEMINI:");
        console.log(resposta);
        console.log("================================================\n");

        return res.json({ resposta });

    } catch (error) {
        console.error("ERRO AO GERAR RESPOSTA NO GEMINI:");
        console.error(error);

        return res.status(500).json({
            resposta: "Erro ao gerar resposta com o Gemini."
        });
    }
};



export const updUser = async (req, res) => {
    try {
        const { user } = req.body.user;
        const { nome, email, telefone, bairro, cpf, cnpj, chats } = user;   

        console.log(" Atualizando usuário:", email);

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
            { nome, telefone, bairro, cpf, cnpj, chats },
            options
        );

        console.log("✔ Usuário atualizado com sucesso.");

        res.status(205).json({
            message: "Registro de chat atualizado com sucesso.",
            data: updatedHistory
        });

    } catch (error) {
        console.error(" ERRO ao atualizar usuário:", error);
        res.status(500).json({ message: "Erro do servidor ao atualizar o chat." });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        console.log(" Buscando todos os usuários...");
        const users = await registerModel.find();
        res.json({ data: users });
    } catch (error) {
        console.error(" ERRO ao buscar usuários:", error);
        res.status(500).json({ message: "Erro ao buscar usuários" });
    }
};
