// RegisterControlle

// Importa o Model
import registerModel from '../models/chatRegisterModel.js';

export const updChatRegister = async (req, res) => {
  try {
  
    const { user } = req.body;
    const { nome, email, telefone, bairro, cpf, cnpj, chats} = user.user;
    console.log(user);
    console.log(email)

    // Validação
    if (!email) {
      return res.status(400).json({ message: 'email esta vazio.' });
    }


    const options = {
      new: true,
      upsert: true, // Cria o documento se ele não existir
      runValidators: true, // Roda as validações do Schema
    };
    // LocalUser:"{"nome":"a","email":"a@a","telefone":"a","bairro":"a","cpf":"a","cnpj":"a","chats":[]}"
    const updatedHistory = await registerModel.findOneAndUpdate(
      { email: email }, // Critério de busca
      {              // Dados para atualizar
        $set: {
          user: email,

          nome: nome,
          email: email,
          telefone: telefone,
          bairro: bairro,
          cpf: cpf,
          cnpj: cnpj,
          chats: chats
        }
       }, 
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
