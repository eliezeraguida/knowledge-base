# Knowledge Base

Sistema de gerenciamento e recuperação de artigos e conteúdos informativos.

**Disciplina:** Banco de Dados II  
**Curso:** Ciência da Computação — Unifacvest  
**Prazo de entrega:** 10/11/2026  
**Status:** Em desenvolvimento

## 1. Objetivo

Desenvolver um backend para cadastrar, organizar, armazenar e recuperar artigos, utilizando um banco de dados relacional e um mecanismo especializado em busca textual.

O projeto será desenvolvido de forma incremental, com foco no aprendizado de modelagem, SQL, infraestrutura e desenvolvimento backend.

## 2. Funcionalidades previstas

- Cadastro e gerenciamento de artigos.
- Cadastro e gerenciamento de autores.
- Organização dos artigos por categorias.
- Armazenamento de textos longos.
- Pesquisa textual nos artigos.
- Recuperação de resultados por relevância.
- Inserção de dados fictícios para demonstração.

## 3. Tecnologias

### Stack obrigatória

- Docker e Docker Compose.
- PostgreSQL 16.
- Node.js 22 a 24.
- Git e GitHub.

### Trilha de expansão escolhida

**Trilha 2 — Busca textual**

Ferramenta em avaliação:
- Elasticsearch.
- Typesense.

A escolha definitiva será feita durante o desenvolvimento, considerando os recursos disponíveis e a complexidade de implementação.

## 4. Arquitetura prevista

- **PostgreSQL:** armazenamento principal dos dados.
- **Node.js:** backend e comunicação entre os serviços.
- **Mecanismo de busca:** indexação e recuperação textual dos artigos.
- **Docker:** gerenciamento dos serviços.

## 5. Modelagem inicial

Entidades previstas:

- Autores.
- Artigos.
- Categorias.

Os relacionamentos, atributos, chaves e restrições serão definidos durante a elaboração do DER e do schema do banco de dados.

## 6. Estrutura do projeto

```text
knowledge-base/
├── README.md
├── .gitignore
├── docker-compose.yml
├── package.json
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   └── routes/
├── database/
│   ├── schema/
│   └── seeds/
└── docs/
```

## 7. Etapas de desenvolvimento

- [ ] Preparação do ambiente.
- [ ] Criação do repositório GitHub.
- [ ] Modelagem DER.
- [ ] Definição do schema.
- [ ] Configuração do PostgreSQL.
- [ ] Implementação do backend.
- [ ] Criação dos dados fictícios.
- [ ] Configuração do mecanismo de busca.
- [ ] Integração da busca textual.
- [ ] Testes e documentação.

## 8. Desenvolvimento

O projeto será implementado gradualmente. As decisões técnicas serão documentadas e o Git será utilizado para registrar a evolução por meio de commits descritivos.

A inteligência artificial será utilizada como ferramenta de apoio ao aprendizado, planejamento, revisão e resolução de problemas.
