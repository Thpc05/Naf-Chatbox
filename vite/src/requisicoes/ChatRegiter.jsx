async function UpdChatDB(user) {
await ReqApiUpdChatDB(user);
}

async function ReqApiUpdChatDB (user) {

    console.log(user);
    try {
            const response = await fetch('http://localhost:3035/db/register/updChatRegister', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: user
                    }  
                )
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro ao salvar o histórico:', response.status, errorData.message);
            } else {
                console.log('DB atualizado.');
            }

        } catch (error) {
            console.error('Falha na requisição (fetch) para salvar o chat:', error);
        }  
    }

export default (UpdChatDB);