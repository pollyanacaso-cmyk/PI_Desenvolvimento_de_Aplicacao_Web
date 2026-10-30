const bcrypt = require('bcryptjs');
const { Administrador } = require('../models');

async function garantirAdminInicial() {
    const total = await Administrador.count();

    if (total > 0) {
        return;
    }

    const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_SENHA) {
        console.warn(
            '[AVISO] Nenhum administrador cadastrado. Defina ADMIN_EMAIL e ADMIN_SENHA ' +
            '(e opcionalmente ADMIN_NOME) no .env e reinicie para criar o primeiro.'
        );
        return;
    }

    if (ADMIN_SENHA.length < 8) {
        console.warn('[AVISO] ADMIN_SENHA deve ter pelo menos 8 caracteres. Administrador inicial não criado.');
        return;
    }

    await Administrador.create({
        nome: ADMIN_NOME || 'Administrador',
        email: ADMIN_EMAIL.trim().toLowerCase(),
        senha_hash: await bcrypt.hash(ADMIN_SENHA, 10)
    });

    console.log(`Administrador inicial criado: ${ADMIN_EMAIL.trim().toLowerCase()}`);
}

module.exports = { garantirAdminInicial };
