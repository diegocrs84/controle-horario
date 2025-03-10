const mongoose = require('mongoose');
const Funcionario = require('./models/funcionario');

const MONGODB_URI = 'mongodb+srv://diegocrs84:Diegocrs84@cluster0.rnuqwxz.mongodb.net/controle-horario?retryWrites=true&w=majority';

async function atualizarCargo() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado ao MongoDB');

        const resultado = await Funcionario.findOneAndUpdate(
            { email: 'dcaninde@yahoo.com.br' },
            { $set: { cargo: 'Administrador' } },
            { new: true }
        );

        if (resultado) {
            console.log('Cargo atualizado com sucesso:', resultado);
        } else {
            console.log('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB');
    }
}

atualizarCargo(); 