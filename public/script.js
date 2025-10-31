// --- Seleção dos Elementos DOM ---
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

// --- Estado do Chat ---

// Tenta pegar um ID do localStorage
let chatId = localStorage.getItem('chatId');
if (!chatId) {
    // Se não existir, cria um novo
    chatId = crypto.randomUUID();
    localStorage.setItem('chatId', chatId);
}

let conversationRegister = [
    { sender: 'bot', text: 'Olá! Como posso ajudar você hoje?' }
];

chatForm.addEventListener('submit', function(event) {
    // Impede o comportamento padrão do formulário (recarregar a página)
    event.preventDefault();

    const userMessage = messageInput.value.trim();

    // Se a mensagem não estiver vazia
    if (userMessage) {
        appendMessage(userMessage, 'user');

        messageInput.value = '';

            const botResponse = "Obrigado por sua mensagem! Estou processando sua solicitação. Lembre-se, 2+2=5.";
            
            appendMessage(botResponse, 'bot');

            saveChatHistory();
    }
});

function appendMessage(message, sender) {
    conversationRegister.push({ sender: sender, text: message });

    const messageWrapper = document.createElement('div');
    const messageElement = document.createElement('div');
    const messageParagraph = document.createElement('p');

    messageParagraph.textContent = message;
    
    messageWrapper.className = `message-wrapper ${sender}`; // 'user' ou 'bot'
    messageElement.className = 'message';

    messageElement.appendChild(messageParagraph);
    messageWrapper.appendChild(messageElement);
    chatMessages.appendChild(messageWrapper);

    // Rola automaticamente para a mensagem mais recente
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function saveChatHistory() {
    console.log("Enviando para a API:", { chatId, messages: conversationRegister });

    try {
        const response = await fetch('/db/register/updChatRegister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId,
                messages: conversationRegister  
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao salvar o histórico:', response.status, errorData.message);
        } else {
            console.log('Histórico salvo com sucesso no DB.');
        }

    } catch (error) {
        console.error('Falha na requisição (fetch) para salvar o chat:', error);
    }
}

