function autorizarPorPerfil(...perfisPermitidos) {
    return (req, res, next) => {
        if (!perfisPermitidos.includes(req.perfil)) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este recurso.'
            });
        }

        return next();
    };
}

module.exports = autorizarPorPerfil;
