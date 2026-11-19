const bcrypt = require('bcryptjs');
const { Administrador, Profissional } = require('../models');

const ACESSOS_PROFISSIONAIS = [
  ['lucimaracollibarbosa@gmail.com', 'Lucimara Lorenzetto Colli'],
  ['simonegea9@gmail.com', 'Simone Cristina Colli'],
  ['ana_lorenzetto@gmail.com', 'Ana Sunta Lorenzeti Colli Tonietti'],
  ['tonietti_wagner@outlook.com', 'Wagner Francisco Colli Tonietti']
];

async function garantirAdminInicial() {
  const email = (process.env.ADMIN_EMAIL || 'admin@kebella.com').trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (senha && senha.length >= 8) {
    const existente = await Administrador.unscoped().findOne({ where: { email } });
    if (!existente) await Administrador.create({
      nome: process.env.ADMIN_NOME || 'Administrador',
      email, senha_hash: await bcrypt.hash(senha, 10)
    });
  } else {
    console.warn('[AVISO] Configure ADMIN_SENHA no .env para criar o administrador inicial.');
  }

  const senhaProfissional = await bcrypt.hash('kebella@admin', 10);
  for (const [emailProf, nome] of ACESSOS_PROFISSIONAIS) {
    const profissional = await Profissional.findOne({ where: { email: emailProf } });
    if (profissional) {
      if (!profissional.senha_hash) await profissional.update({ senha_hash: senhaProfissional });
    } else {
      const porNome = await Profissional.findOne({ where: { nome } });
      if (porNome) await porNome.update({ email: emailProf, senha_hash: senhaProfissional });
      else console.warn(`[AVISO] Profissional "${nome}" não encontrado. Verifique os cadastros do banco.`);
    }
  }
}
module.exports = { garantirAdminInicial };
