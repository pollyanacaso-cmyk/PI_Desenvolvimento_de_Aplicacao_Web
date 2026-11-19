const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let segredoEmUso = null;

function obterSegredo() {
    if (segredoEmUso) {
        return segredoEmUso;
    }

    if (process.env.JWT_SECRET) {
        segredoEmUso = process.env.JWT_SECRET;
    } else {
        segredoEmUso = crypto.randomBytes(48).toString('hex');
        console.warn(
            '[AVISO] JWT_SECRET não definido no .env. Usando um segredo temporário: ' +
            'os logins serão invalidados a cada reinício do servidor.'
        );
    }

    return segredoEmUso;
}

// papel: 'admin' (padrão) ou 'cliente'. O papel precisa ir no token para que o
// middleware saiba em qual tabela procurar o usuário (sub = id nessa tabela).
function gerarToken(usuario, papel = 'admin') {
    return jwt.sign(
        { sub: usuario.id, papel },
        obterSegredo(),
        {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRES_IN || '8h'
        }
    );
}

function verificarToken(token) {
    return jwt.verify(token, obterSegredo(), { algorithms: ['HS256'] });
}

module.exports = { gerarToken, verificarToken };
