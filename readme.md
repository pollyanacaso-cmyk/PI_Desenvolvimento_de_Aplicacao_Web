# Ke Bella

Sistema web para **gestão de agendamentos** do salão de beleza Ke Bella, localizado em Espírito Santo do Pinhal.

## Sobre o Projeto

O projeto tem como objetivo facilitar a administração do salão, permitindo o gerenciamento de **clientes, profissionais, serviços e agendamentos**.

O sistema também permite que administradores bloqueiem horários em que os profissionais não estiverem disponíveis.

## Objetivo

Desenvolver uma plataforma web que centralize a gestão do salão, tornando o controle de agendamentos mais organizado e acessível.

## Funcionalidades

- Cadastro de clientes;
- Cadastro de profissionais;
- Cadastro de serviços;
- Cadastro de administradores;
- Agendamento de serviços;
- Consulta de horários disponíveis;
- Alteração e cancelamento de agendamentos;
- Bloqueio de horários dos profissionais;
- Login e autenticação de usuários.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js
- MySQL
- MySQL Workbench
- Git
- GitHub

## Computação em Nuvem

O sistema será integrado a serviços de **computação em nuvem**, permitindo que a aplicação seja acessada pela internet e facilitando sua disponibilidade e manutenção.

## Modelo SaaS

O projeto segue o conceito de **SaaS (Software as a Service)**, disponibilizando o sistema como um serviço acessível pela internet.

## Requisitos

### Requisitos Funcionais

Os requisitos funcionais estão documentados no projeto e definem as funcionalidades que o sistema deverá oferecer.

### Requisitos Não Funcionais

Os requisitos não funcionais definem características como **segurança, desempenho, responsividade, usabilidade e disponibilidade**.

### Regras de Negócio

As regras de negócio definem as condições para o funcionamento dos **agendamentos, profissionais e horários**.

## Status do Projeto

**Em desenvolvimento**

Projeto desenvolvido para a disciplina de **Desenvolvimento de Interface Web — 4º semestre**.

## Integrantes

Eduardo Mangueira de Castro Moraes - 25001267   
Julia Gabrieli Beraldo - 25002215   
Luis Felipe Coelho - 25001003   
Murilo Colli Barbosa - 25000458   
Pedro Ignácio de Oliveira Bortolon  - 25000137   
Pollyana Caso - 25001334

## Painéis Administrativos e Profissionais

A API reconhece os perfis `cliente`, `admin` e `profissional`.

Os profissionais cadastrados no banco são vinculados aos e-mails definidos no contexto do projeto e recebem a senha inicial `kebella@admin` (o hash é salvo em `profissionais.senha_hash`). A sincronização Sequelize adiciona essa coluna quando o servidor inicia.

### Configuração Local

1. Na pasta `BackEnd`, copie `.env.example` para `.env`.
2. Preencha as credenciais do MySQL, `JWT_SECRET` e uma senha forte em `ADMIN_SENHA`.
3. Execute `npm install` e `npm run dev` na pasta `BackEnd`.
4. Execute `npm install` e `npm run dev` na pasta `FrontEnd`.
5. A API fica disponível em `http://localhost:3000`.

O administrador é criado/garantido pelo `ADMIN_EMAIL` e `ADMIN_SENHA` do `.env`.

O acesso dos profissionais usa a senha inicial `kebella@admin`; altere-a após o primeiro acesso quando houver fluxo de troca de senha disponível.

## Relatórios

- `GET /relatorios/resumo`: fornece os indicadores do período.
- `GET /relatorios/excel`: gera a planilha `.xlsx`.

Ambos exigem JWT e aceitam os perfis `admin` e `profissional`. O profissional é filtrado automaticamente pelo próprio ID.

O faturamento considera somente agendamentos concluídos e o ticket médio é calculado sobre esses atendimentos. O relatório resume os agendamentos e atendimentos concluídos.

## Segurança

O arquivo `.env` não é distribuído. Crie-o a partir do `.env.example` e não versione credenciais.

Como o ZIP original continha credenciais locais, troque a senha do banco e regenere o `JWT_SECRET` antes de publicar ou compartilhar o projeto.
