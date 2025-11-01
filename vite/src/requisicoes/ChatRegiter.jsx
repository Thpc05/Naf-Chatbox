export default async function SaveonDB(msg) {
    const { id, sender , text } = msg;
  try {
        const response = await fetch('http://localhost:3035/db/register/updChatRegister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: id,
                message: {
                    sender: sender,
                    text: text
                }  
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