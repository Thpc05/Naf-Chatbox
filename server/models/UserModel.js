import mongoose from 'mongoose';

// Este é um "sub-documento".
// Ele define a estrutura de cada objeto DENTRO do array 'messages'.

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'], // Só aceita 'user' ou 'bot'
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
}, { 
  _id: false // Não cria um _id para cada mensagem individual
});

const chatsSchema = new mongoose.Schema({
  // O ID da sessão de chat.
  chatId: {
    type: String,
    required: true,
  },
  
  // array com a estrutura do messageSchema
  messages: [messageSchema],
  
}, {
  timestamps: true,
});

// nome: '',
//     email: '',
//     telefone: '',
//     bairro: '',
//     cpf: '',
//     cnpj: '',
//     chats: []

// Model principal
const chatRegisterSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true
  },
  nome: {
    type: String,
    unique: true, // Email antes não estava como único -Buisi
    require: true,
  },
  telefone: { // Não tiha telefone wwwwwwww -Buisi
      type: String,
  },
  bairro: {
    type: String,
  },
  cpf: {
    type: String,
  },
  cnpj: {
    type: String,
  },
  chats: [chatsSchema],

  isAdmin: {
    type: Boolean,
    default: false,
  }

})

// Compila o Schema em um Model e exporta
const registerModel = mongoose.model('registerModel', chatRegisterSchema);

export default registerModel;