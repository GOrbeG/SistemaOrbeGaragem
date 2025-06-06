// backend/middlewares/checkPermissao.js

module.exports = function checkPermissao(papeisPermitidos = []) {
  return (req, res, next) => {
    const usuario = req.user;

    if (!usuario || !papeisPermitidos.includes(usuario.role)) {
      return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
};
