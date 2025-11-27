// UsersControle.js

import registerModel from '../models/UserModel.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";


import faqData from "../config/faq_irpf_2024.json" with { type: "json" };

dotenv.config();



// Scoring baseado em palavras-chave (TF-IDF simplificado)
function pontosText(texto, pergunta) {
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

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[?.,;]/g, ""); // Remove pontuação básica
}

// Busca relevante no JSON
function getRelevantFaq(pergunta) {

    console.log("\n================================================");
    console.log("BUSCA NO RAG INICIADA");
    console.log("Pergunta recebida:", pergunta);
    console.log("================================================\n");

    const perguntaNormalizada = normalizarTexto(pergunta).split(" ");

    const resultados = faqData.faq
        .map(item => {
        let matches = 0;

        const faqNormalizado = normalizarTexto(`${item.titulo} ${item.resposta}`);
        
        perguntaNormalizada.forEach(termo => {
            // Ignora palavras muito curtas
            if (termo.length > 2 && faqNormalizado.includes(termo)) {
                matches++;
            }
        });

        let pontos = matches * 2;
        if (matches >= 2) {
            pontos += 1;
        }

        return {
            id: item.id,
            titulo: item.titulo,
            pontos: pontos,
            resposta: item.resposta
        }})       
        .filter(r => r.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)

    console.log("\nTOP FAQ SELECIONADOS:");
    console.log(resultados.map(r => ({ id: r.id, pontos: r.pontos })));

    if (resultados.length === 0) {
        console.log("Nenhum FAQ relevante encontrado.\n");
        return "";
    }

    if (resultados.length > 20) {
        resultados.length = 20
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

    const isCompleted =
        perguntaLower.includes("conclui") ||
        perguntaLower.includes("resolvi") ||
        perguntaLower.includes("obrigado") ||
        perguntaLower.includes("pergunta respondida") ||
        perguntaLower.includes("consulta concluída");

    if (isCompleted) {
        console.log("Conclusão detectada. Enviando sinal para o cliente atualizar o status do chat.");
        return res.json({
            resposta: "Fico feliz em ter ajudado! Para fechar esta consulta, estou marcando-a como 'Concluída' no sistema.",
            action: "complete_chat"
        });
    }

    const notResponded =
        perguntaLower === "não respondeu minha pergunta" ||
        perguntaLower.includes("não entendi") ||
        perguntaLower.includes("não me respondeu");

    if (notResponded) {
        console.log("Pergunta do cliente não respondida, recomendar agendamento");
        return res.json({
            resposta: "Perdão por não conseguir responder sua pergunta, para uma análise mais detalhada recomendo um agendamento para marcar uma consulta presencial com o NAF, é só ir nesse endereço: https://unifor.br/web/guest/naf"
        });
    }

    // Busca RAG
    const contextoFAQ = getRelevantFaq(pergunta);

    console.log("CONTEXTO FINAL ENVIADO AO GEMINI:\n");
    console.log("\n--------------------------------------------\n");

    const contexto = `
Você é o assistente Theodosius, especialista em IRPF.

FAQ RELEVANTE:
${contextoFAQ || "Nenhuma informação específica foi encontrada no FAQ para esta consulta."}

REGRAS PRINCIPAIS:
1. Use o conteúdo do FAQ exibido abaixo como base.
2. Caso a pergunta não tenha relação com IRPF retorne: "Desculpe, não consegui processar sua pergunta. Porfavor tente novamente ou procure uma consulta presencial com o NAF"
3. NÃO PASSE DE 2000 CHAR, de preferencia fique bem abaixo disso, a não ser que a pergunta peça aprofundamento


REGRAS DE ORGANIZAÇÃO:
1. Melhore a redação, torne mais clara e objetiva.
2. Abuse de quebras de linhas para melhor estruturalção.
3. NÃO UTILIZE (Negrito, *, **).
4. No Caso de muitos itens utilize (1., 2., 3., etc).
5. Mencione o ID do FAQ utilizado (ex: “Fonte: FAQ 12”).
6. Mencione (FAQ: {quebra de linha} gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/dirpf/pr-irpf-2024.pdf).
7. Se houver mais de um FAQ relevante, combine suas informações mantendo fidelidade.
8. Sempre finalize com: “Sua dúvida foi respondida?, caso não agende uma consulta presencial com o NAF, caso sim digite que concluiu sua consulta”.

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
