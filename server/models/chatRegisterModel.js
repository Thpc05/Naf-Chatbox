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


// Model principal
const chatRegisterSchema = new mongoose.Schema({
  // O ID da sessão de chat.
  chatId: {
    type: String,
    required: true,
    unique: true, // Garante que cada sessionId seja único
    index: true,  // Otimiza a busca por sessionId
  },

  // array com a estrutura do messageSchema
  messages: [messageSchema],

}, {
  timestamps: true,
});

// Compila o Schema em um Model e exporta
const registerModel = mongoose.model('registerModel', chatRegisterSchema);

export default registerModel;