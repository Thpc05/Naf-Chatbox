const baseUrl = 'http://localhost:3035/db/user/'

export async function updUserDB (user) {

    console.log('Atualizando UsuarioDB: ', user);
    try {
            const response = await fetch(`${baseUrl}updUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user
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

export async function getAllUsersDB () {

    try {
        const response = await fetch(`${baseUrl}getAllUsers`, {
            method: 'GET',
            headers: {
           'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao obter todos os usuários:', response.status, errorData.message);
            return null;
        } else {
            const data = await response.json();
            console.log('Todos os usuários obtidos:', data.data);
            
        return data.data;
        }
        } catch (error) {
            console.error('Falha na requisição (fetch) para obter todos os usuários:', error);
            return null;
        }
    }

export async function perguntarIa(input) {
    try {
    const response = await fetch(`${baseUrl}perguntar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta: input })
    });

    const data = await response.json();
    botResponse.text = data.resposta || "Sem resposta do servidor.";
  } catch (error) {
    console.error("Erro ao chamar a IA:", error);
    botResponse.text = "Erro ao se comunicar com a IA.";
  }
}

    
export default updUserDB;