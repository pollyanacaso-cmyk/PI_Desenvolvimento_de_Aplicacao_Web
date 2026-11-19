const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const { Agendamento, Cliente, Profissional, Servico } = require('../models');

function filtros(req) {
  const where = {};
  if (req.query.dataInicial || req.query.dataFinal) {
    where.data = {};
    if (req.query.dataInicial) where.data[Op.gte] = req.query.dataInicial;
    if (req.query.dataFinal) where.data[Op.lte] = req.query.dataFinal;
  }
  if (req.perfil === 'profissional') where.profissional_id = req.usuario.id;
  else if (req.query.profissionalId) where.profissional_id = Number(req.query.profissionalId);
  return where;
}
async function obterDados(req) {
  const agendamentos = await Agendamento.findAll({
    where: filtros(req),
    include: [
      { model: Cliente, attributes: ['id', 'nome', 'email', 'telefone'] },
      { model: Profissional, attributes: ['id', 'nome'] },
      { model: Servico, attributes: ['id', 'nome', 'preco', 'duracao_minutos'] }
    ],
    order: [['data', 'ASC'], ['horario_inicio', 'ASC']]
  });
  const concluidos = agendamentos.filter(a => a.status === 'Concluído');
  const faturamento = concluidos.reduce((s, a) => s + Number(a.Servico?.preco || 0), 0);
  return {
    agendamentos,
    resumo: {
      totalAgendamentos: agendamentos.length,
      concluidos: concluidos.length,
      ticketMedio: concluidos.length ? faturamento / concluidos.length : 0,
      faturamento,
      lucroEstimado: null
    }
  };
}
const resumo = async (req, res) => {
  try {
    const dados = await obterDados(req);
    res.json(dados);
  } catch (e) { console.error(e); res.status(500).json({ mensagem: 'Não foi possível gerar o resumo.' }); }
};
const excel = async (req, res) => {
  try {
    const { agendamentos, resumo } = await obterDados(req);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Ke Bella';
    workbook.created = new Date();
    const detalhe = workbook.addWorksheet('Agendamentos', { views: [{ state: 'frozen', ySplit: 1 }] });
    detalhe.columns = [
      { header: 'ID', key: 'id', width: 10 }, { header: 'Data', key: 'data', width: 15 },
      { header: 'Horário', key: 'horario', width: 14 }, { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'E-mail', key: 'email', width: 30 }, { header: 'Serviço', key: 'servico', width: 34 },
      { header: 'Profissional', key: 'profissional', width: 32 }, { header: 'Status', key: 'status', width: 18 },
      { header: 'Valor (R$)', key: 'valor', width: 16 }
    ];
    agendamentos.forEach(a => detalhe.addRow({
      id: a.id, data: a.data, horario: String(a.horario_inicio).slice(0, 5),
      cliente: a.Cliente?.nome || '', email: a.Cliente?.email || '',
      servico: a.Servico?.nome || '', profissional: a.Profissional?.nome || '',
      status: a.status, valor: Number(a.Servico?.preco || 0)
    }));
    const resumoWs = workbook.addWorksheet('Resumo Diário');
    resumoWs.columns = [{ header: 'Data', key: 'data', width: 18 }, { header: 'Agendamentos', key: 'qtd', width: 18 }, { header: 'Concluídos', key: 'concluidos', width: 18 }, { header: 'Faturamento (R$)', key: 'valor', width: 22 }];
    const porDia = new Map();
    agendamentos.forEach(a => {
      const dia = String(a.data);
      if (!porDia.has(dia)) porDia.set(dia, { data: dia, qtd: 0, concluidos: 0, valor: 0 });
      const item = porDia.get(dia); item.qtd++;
      if (a.status === 'Concluído') { item.concluidos++; item.valor += Number(a.Servico?.preco || 0); }
    });
    [...porDia.values()].forEach(x => resumoWs.addRow(x));
    resumoWs.addRow({});
    resumoWs.addRow({ data: 'TOTAL DO PERÍODO', qtd: resumo.totalAgendamentos, concluidos: resumo.concluidos, valor: resumo.faturamento });
    [detalhe, resumoWs].forEach(ws => {
      const header = ws.getRow(1);
      header.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA3644F' } }; cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
      ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + ws.columnCount)}1` };
      ws.eachRow((row, n) => { if (n > 1) row.eachCell(cell => { cell.border = { bottom: { style: 'hair', color: { argb: 'FFE5DED8' } } }; }); });
    });
    detalhe.getColumn('valor').numFmt = 'R$ #,##0.00';
    resumoWs.getColumn('valor').numFmt = 'R$ #,##0.00';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-ke-bella.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (e) { console.error(e); res.status(500).json({ mensagem: 'Não foi possível exportar o relatório.' }); }
};
module.exports = { resumo, excel };
