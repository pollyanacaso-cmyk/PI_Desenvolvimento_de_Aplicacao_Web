
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ke_bella',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'SUA_SENHA_AQUI',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(150)
  },
  cpf: {
    type: DataTypes.STRING(14)
  },
  data_nascimento: {
    type: DataTypes.DATEONLY
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clientes',
  timestamps: false
});

const Profissional = sequelize.define('Profissional', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  especializacao: {
    type: DataTypes.STRING(100)
  },
  telefone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(150)
  },
  descricao: {
    type: DataTypes.TEXT
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'profissionais',
  timestamps: false
});

const Servico = sequelize.define('Servico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duracao_minutos: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'servicos',
  timestamps: false
});

const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  servico_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horario_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horario_fim: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'Agendado'
  },
  observacoes: {
    type: DataTypes.TEXT
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'agendamentos',
  timestamps: false
});

const Avaliacao = sequelize.define('Avaliacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  agendamento_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'avaliacoes',
  timestamps: false
});

const CategoriaProduto = sequelize.define('CategoriaProduto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias_produto',
  timestamps: false
});

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  imagem: {
    type: DataTypes.STRING(500)
  },
  estoque: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estoque_minimo: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'produtos',
  timestamps: false
});

Cliente.hasMany(Agendamento, {
  foreignKey: 'cliente_id'
});
Agendamento.belongsTo(Cliente, {
  foreignKey: 'cliente_id'
});

Profissional.hasMany(Agendamento, {
  foreignKey: 'profissional_id'
});
Agendamento.belongsTo(Profissional, {
  foreignKey: 'profissional_id'
});

Servico.hasMany(Agendamento, {
  foreignKey: 'servico_id'
});
Agendamento.belongsTo(Servico, {
  foreignKey: 'servico_id'
});

Cliente.hasMany(Avaliacao, {
  foreignKey: 'cliente_id'
});
Avaliacao.belongsTo(Cliente, {
  foreignKey: 'cliente_id'
});

Profissional.hasMany(Avaliacao, {
  foreignKey: 'profissional_id'
});
Avaliacao.belongsTo(Profissional, {
  foreignKey: 'profissional_id'
});

Agendamento.hasMany(Avaliacao, {
  foreignKey: 'agendamento_id'
});
Avaliacao.belongsTo(Agendamento, {
  foreignKey: 'agendamento_id'
});

CategoriaProduto.hasMany(Produto, {
  foreignKey: 'categoria_id'
});
Produto.belongsTo(CategoriaProduto, {
  foreignKey: 'categoria_id'
});

sequelize.queryCompat = async (sql, params = []) => {
  const [results, metadata] = await sequelize.query(sql, {
    replacements: params
  });

  return [results ?? metadata, metadata];
};

sequelize.models = {
  Cliente,
  Profissional,
  Servico,
  Agendamento,
  Avaliacao,
  CategoriaProduto,
  Produto
};

module.exports = sequelize;
