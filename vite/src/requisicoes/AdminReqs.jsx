
const baseUrl = 'http://localhost:3035/db/admin/'

// Eu tava fazendo isso pra mudar o status pdo adm, mas percebi q eu poderia so usar o updUser :)
// Pode ser um meio ruim pois vou estar passando TODOS os chats num json so pra mudar um bool, mas fds
// Vou deixar esse inicio aq pra n ter q fazer dnv dps caso necessario

export async function changeAdminOnDB(user, change) {
    try {
        const response = await fetch(`${baseUrl}changeAdm`) 

    } catch (error) {

    }
}

export default changeAdminOnDB;