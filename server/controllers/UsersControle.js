// UsersControle.js

import registerModel from '../models/UserModel.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import faqData from '../config/irpf_2024_faq_otimizado.json' assert { type: "json" }; 

dotenv.config(); 

// SIMILARIDADE DO COSSENO

function calculateCosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
}


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = "text-embedding-004";
const generativeModel = "gemini-2.5-flash";
const model = genAI.getGenerativeModel({ model: generativeModel });


let indexedFaq = [];

async function createFaqIndex() {
    console.log("Iniciando indexação semântica do FAQ...");
    
   
    const listaDePaginas = faqData.pages || [];
    
 
    const chunksToEmbed = listaDePaginas
        .filter(page => page.page >= 22 && page.text && page.text.trim().length > 30) 
        .map(page => page.text);

    console.log(`Encontrados ${chunksToEmbed.length} chunks de texto de FAQ para indexar.`);

   
    const BATCH_SIZE = 50;
    const chunksLimitados = chunksToEmbed.slice(0, 300);

    for (let i = 0; i < chunksLimitados.length; i += BATCH_SIZE) {
        const batch = chunksLimitados.slice(i, i + BATCH_SIZE);
        
        try {
            const result = await genAI.batchEmbedContents({
                model: embeddingModel,
                requests: batch.map(text => ({ content: text })),
            });

            result.embeddings.forEach((embedding, index) => {
                indexedFaq.push({
                    text: batch[index],
                    vector: embedding.values
                });
            });
            console.log(`Embeddings gerados para ${indexedFaq.length} chunks...`);

        } catch (e) {
            console.error("Erro ao gerar embeddings em lote. Verifique sua chave de API ou limites:", e);
            return;
        }
    }
    console.log(`Indexação do FAQ concluída! Total de chunks indexados: ${indexedFaq.length}.`);
}


r
createFaqIndex();


// FUNÇÃO DE BUSCA EMBEDDINGS
const getRelevantFaq = async (pergunta) => {
    if (indexedFaq.length === 0) {
        console.warn("Índice do FAQ não está pronto. Retornando contexto vazio.");
        return ""; 
    }

    try {
        // 1. Gerar o embedding da pergunta do usuário
        const questionEmbeddingResult = await genAI.embedContent({
            model: embeddingModel,
            content: pergunta,
        });
        const questionVector = questionEmbeddingResult.embedding.values;

        // 2. Calcular similaridade com todos os chunks indexados
        const scores = indexedFaq.map(item => {
            const similarity = calculateCosineSimilarity(questionVector, item.vector); 
            return { text: item.text, score: similarity };
        });

        // 3. Ordenar e selecionar os 8 chunks mais relevantes
        scores.sort((a, b) => b.score - a.score);
        
        // Limite mínimo de similaridade para evitar contexto irrelevante
        const SIMILARITY_THRESHOLD = 0.65; 
        
        const topContextos = scores
            .filter(item => item.score > SIMILARITY_THRESHOLD)
            .slice(0, 8);

        console.log(`Busca semântica encontrou ${topContextos.length} chunks relevantes (Score > ${SIMILARITY_THRESHOLD}). Melhor Score: ${scores.length > 0 ? scores[0].score.toFixed(3) : 'N/A'}`);

        // 4. Formatar para o prompt
        return topContextos.map(item => `- ${item.text}`).join('\n\n');
    } catch (e) {
        console.error("Erro durante a busca semântica:", e);
        return ""; // Retorna vazio em caso de falha na busca
    }
};


// FUNÇÃO PRINCIPAL
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
    
    // --- PASSO 2: PROCESSAR PERGUNTA COM RAG SEMÂNTICO ---

    // Await para a busca semântica
    const contextoFAQ = await getRelevantFaq(pergunta);
    
    // Contexto atualizado para pedir a citação do artigo/pergunta
    const contexto = `
**Instruções de Personalidade e Foco:**
Você é o assistente **Theo Steps**. Sua única função é responder perguntas sobre **Imposto de Renda de Pessoa Física (IRPF)** no contexto da Receita Federal do Brasil.

**FAQ OFICIAL RELEVANTE (Resultado da Busca Semântica):**
${contextoFAQ.length > 0 ? contextoFAQ : "Nenhuma informação específica foi encontrada no seu FAQ para esta consulta."}

**Regras de Resposta:**
1. **Prioridade Máxima:** Use APENAS o texto fornecido em "FAQ OFICIAL RELEVANTE" para formular a sua resposta.
2. **CITAÇÃO OBRIGATÓRIA:** Ao final da sua resposta, você DEVE citar o número da pergunta (artigo) do FAQ que você usou (ex: "001", "002", "012"). A resposta deve terminar assim: (Baseado na pergunta XXX do FAQ).
3. **Se o "FAQ OFICIAL RELEVANTE" estiver vazio ou a pergunta for sobre outro assunto (ex: MEI),** responda EXATAMENTE: "Não encontrei essa informação no FAQ oficial."
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


// --- OUTRAS FUNÇÕES (UPDUSER E GETALLUSERS) ---

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