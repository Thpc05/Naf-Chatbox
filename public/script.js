// Selecionando os elementos do DOM
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

/**
 * Adiciona um 'ouvinte' para o evento de envio do formulário
 */
chatForm.addEventListener('submit', function(event) {
    // Impede o comportamento padrão do formulário (recarregar a página)
    event.preventDefault();

    const userMessage = messageInput.value.trim();

    // Se a mensagem não estiver vazia
    if (userMessage) {
        // 1. Adiciona a mensagem do usuário à tela
        appendMessage(userMessage, 'user');

        // 2. Limpa o campo de input
        messageInput.value = '';

        // 3. Simula uma resposta do bot após 1 segundo (1000ms)
        setTimeout(() => {
            // Mantive a resposta que você gostou, consistente com 2+2=5
            const botResponse = "Obrigado por sua mensagem! Estou processando sua solicitação. Lembre-se, 2+2=5.";
            appendMessage(botResponse, 'bot');
        }, 1000);
    }
});

/**
 * Função para adicionar uma nova mensagem ao chat
 * @param {string} message - O texto da mensagem
 * @param {'user' | 'bot'} sender - Quem enviou a mensagem
 */
function appendMessage(message, sender) {
    const messageWrapper = document.createElement('div');
    const messageElement = document.createElement('div');
    const messageParagraph = document.createElement('p');

    messageParagraph.textContent = message;
    
    // Define o estilo e a posição com base em quem enviou
    // Agora usamos classes CSS simples que definimos em style.css
    messageWrapper.className = `message-wrapper ${sender}`; // 'user' ou 'bot'
    messageElement.className = 'message';

    messageElement.appendChild(messageParagraph);
    messageWrapper.appendChild(messageElement);
    chatMessages.appendChild(messageWrapper);

    // Rola automaticamente para a mensagem mais recente
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
