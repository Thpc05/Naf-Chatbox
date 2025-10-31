// Importa o Model que vamos criar
import registerModel from '../models/chatRegisterModel.js';

export const updChatRegister = async (req, res) => {
  try {
  
    const { chatId, messages } = req.body;

    // Validação
    if (!chatId || !messages) {
      return res.status(400).json({ message: 'chatId e messages são obrigatórios.' });
    }

    const options = {
      new: true,
      upsert: true, // Cria o documento se ele não existir
      runValidators: true, // Roda as validações do Schema
    };

    const updatedHistory = await registerModel.findOneAndUpdate(
      { chatId: chatId }, // Critério de busca
      { messages: messages },    // Dados para atualizar
      options                     // Opções
    );

    res.status(205).json({ 
      message: "Registro de chat atualizado com sucesso.",
      data: updatedHistory 
    });

  } catch (error) {
    console.error("Erro no updRegistroChat:", error);
    res.status(500).json({ message: "Erro do servidor ao atualizar o chat." });
  }
};
