function tratarTexto(valor) {
    if (typeof valor !== 'string') {
        return valor;
    }

    const texto = valor.trim();
    return texto === '' ? null : texto;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { tratarTexto, validarEmail };
