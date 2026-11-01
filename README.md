# Knowledge Base — Smart-Base

Sistema de gerenciamento e recuperação de informações por meio de artigos e conteúdos técnicos.

**Disciplina:** Banco de Dados II  
**Curso:** Ciência da Computação — Unifacvest  
**Professor:** Willen Leolatto Carneiro  
**Prazo de entrega:** 10/11/2026  
**Status:** Em desenvolvimento

---

## 1. Objetivo do projeto

Desenvolver um MVP de backend para um catálogo de conhecimento, capaz de armazenar, organizar e recuperar informações estruturadas.

O projeto utiliza um banco de dados relacional para persistência e um mecanismo especializado para busca textual, demonstrando técnicas de modelagem, integridade dos dados, conteinerização e recuperação da informação.

O desenvolvimento é realizado de forma incremental, priorizando a compreensão das decisões técnicas e a implementação das funcionalidades.

## 2. Escopo da aplicação

A aplicação representa um catálogo de conhecimento que permite organizar artigos técnicos por autores, categorias e tags.

Cada artigo possui título, identificação por slug, resumo, conteúdo textual, status e datas de criação e atualização.

O sistema deverá permitir:

- Armazenar artigos com textos longos.
- Cadastrar e relacionar autores.
- Organizar artigos por categorias.
- Classificar artigos por tags.
- Manter a integridade dos relacionamentos.
- Realizar pesquisas textuais nos conteúdos.
- Recuperar resultados conforme a relevância da pesquisa.
- Demonstrar a recuperação de informações utilizando uma base de dados fictícia de grande volume.

O foco do MVP é o backend e a persistência dos dados.

**Observação:** a implementação de uma interface gráfica não é exigida nem faz parte dos critérios centrais de avaliação definidos no enunciado.

## 3. Tecnologias utilizadas

### 3.1. Base obrigatória

- **Docker:** conteinerização dos serviços.
- **Docker Compose:** gerenciamento da infraestrutura.
- **PostgreSQL 16:** banco de dados relacional principal.
- **Node.js 22:** ambiente de execução do backend.
- **Git:** controle de versão.
- **GitHub:** hospedagem do repositório.

### 3.2. Trilha de expansão escolhida

**Trilha B — Motor de Busca**

Ferramenta escolhida: **Typesense**.

O Typesense é utilizado como mecanismo externo de indexação e recuperação textual.

A integração permite pesquisar informações nos campos:

- Título.
- Resumo.
- Conteúdo.

A pesquisa utiliza pesos diferentes para os campos, priorizando o título, seguido pelo resumo e pelo conteúdo.

### 3.3. Dependências principais

- Express: criação das rotas HTTP e gerenciamento das requisições.
- pg: comunicação entre Node.js e PostgreSQL.
- dotenv: carregamento das variáveis de ambiente.
- typesense: comunicação com o mecanismo de busca.

## 4. Arquitetura da aplicação

A arquitetura utiliza o PostgreSQL como fonte principal dos dados e o Typesense como índice especializado de pesquisa.

### Responsabilidade dos componentes

**PostgreSQL**
- Armazenamento permanente dos dados.
- Integridade referencial.
- Restrições e validações.
- Relacionamentos entre entidades.

**Node.js e Express**
- Recebimento das requisições.
- Comunicação com o banco de dados.
- Integração com o Typesense.
- Organização das regras de negócio.

**Typesense**
- Indexação dos artigos.
- Pesquisa textual.
- Recuperação de resultados.
- Ordenação por relevância.

**Docker**
- Execução dos serviços em contêineres.
- Padronização do ambiente de desenvolvimento.

### Fluxo de pesquisa

1. O cliente envia uma pesquisa à API.
2. O Express recebe a requisição.
3. A rota encaminha a solicitação ao controller.
4. O controller valida os parâmetros.
5. O serviço consulta o Typesense.
6. O mecanismo retorna os documentos encontrados.
7. A API entrega os resultados em formato JSON.

O PostgreSQL permanece como fonte principal dos dados. O índice do Typesense é uma representação utilizada para acelerar a recuperação das informações.

## 5. Modelagem do banco de dados

O modelo relacional utiliza sete tabelas.

| Tabela | Responsabilidade |
|---|---|
| `artigos` | Armazenar os artigos e seus conteúdos |
| `autores` | Armazenar os autores |
| `categorias` | Organizar os artigos por categoria |
| `tags` | Armazenar palavras-chave |
| `artigo_autores` | Relacionar artigos e autores |
| `artigo_categorias` | Relacionar artigos e categorias |
| `artigo_tags` | Relacionar artigos e tags |

### Relacionamentos

Os artigos podem possuir vários autores, categorias e tags.

Essas associações são implementadas por relacionamentos muitos-para-muitos (N:N), utilizando tabelas intermediárias.

### Regras de integridade

O banco contempla:

- Chaves primárias e estrangeiras.
- Restrições de unicidade.
- Campos obrigatórios.
- Validações por CHECK.
- Índices para consultas.
- Triggers para atualização automática de datas.
- Proteção da data de criação.
- Regras de associação entre artigos, autores e categorias.

O diagrama entidade-relacionamento e a documentação da modelagem estão disponíveis na pasta `docs`.

## 6. Massa de dados fictícios

O projeto utiliza registros fictícios para demonstrar o funcionamento da persistência e da recuperação de informações.

A consolidação inicial reuniu dados de duas fontes independentes.

**Resultado atualmente carregado no PostgreSQL:**

| Registro | Quantidade |
|---|---:|
| Artigos | 1.000 |
| Autores | 54 |
| Categorias | 17 |
| Tags | 385 |
| Relações artigo-autor | 1.439 |
| Relações artigo-categoria | 1.593 |
| Relações artigo-tag | 2.523 |

Os dados são fictícios e destinados exclusivamente à demonstração acadêmica.

**Pendente:** ampliar a massa de dados e finalizar um procedimento de carga reproduzível, capaz de popular uma instalação limpa sem depender dos bancos de preparação utilizados na consolidação inicial.

## 7. Mecanismo de busca — Typesense

O Typesense é executado em contêiner Docker, separado do PostgreSQL.

A coleção utilizada chama-se `artigos`.

Os documentos indexados contêm:

- Identificação do artigo.
- Título.
- Resumo.
- Conteúdo.
- Autores.
- Categorias.
- Tags.
- Status.
- Data de criação.

### Critério de pesquisa

A consulta utiliza os campos `titulo`, `resumo` e `conteudo`, com pesos de relevância de 5, 3 e 1, respectivamente.

Isso significa que uma correspondência no título recebe prioridade maior do que uma correspondência apenas no conteúdo.

### Estado da indexação

A carga inicial de 1.000 artigos foi executada com sucesso:

- Documentos processados: 1.000.
- Importações bem-sucedidas: 1.000.
- Falhas: 0.

A sincronização automática do índice após futuras alterações nos artigos permanece como etapa de desenvolvimento.

## 8. API de busca

A aplicação disponibiliza um endpoint REST para pesquisar artigos utilizando o Typesense.

### Endpoint

`GET /api/busca`

### Parâmetros

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `q` | Sim | Termo da pesquisa |
| `pagina` | Não | Número da página. Padrão: 1 |
| `limite` | Não | Resultados por página. Padrão: 10. Máximo: 50 |

### Exemplos

Pesquisa simples:

`GET http://localhost:3000/api/busca?q=refatoração`

Pesquisa com paginação:

`GET http://localhost:3000/api/busca?q=refatoração&pagina=2&limite=5`

### Exemplo de resposta

```json
{
  "termo": "refatoração",
  "total": 23,
  "pagina": 1,
  "limite": 10,
  "resultados": []
}
```

O campo `resultados` contém os artigos encontrados. O exemplo apresenta apenas a estrutura resumida da resposta.

### Validações implementadas

- Pesquisa sem termo retorna erro HTTP 400.
- Paginação inválida é rejeitada.
- O limite máximo de resultados por página é 50.
- Erros inesperados são tratados pela API.

### Testes realizados

| Teste | Resultado |
|---|---|
| Rota principal da API | Aprovado |
| Pesquisa por `refatoração` | 23 resultados encontrados |
| Pesquisa sem termo | Erro HTTP 400 esperado |
| Paginação na página 2 | 5 resultados retornados |
| Conexão com Typesense | Aprovada |

## 9. Estrutura do projeto

```text
knowledge-base/
├── .gitignore
├── .env
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
│
├── database/
│   ├── schema/
│   │   └── 01_schema.sql
│   └── seeds/
│       ├── originais/
│       ├── consolidado/
│       └── relatorios/
│
├── docs/
│   ├── DER.md
│   └── MODELAGEM_LOGICA.md
│
├── scripts/
│   └── consolidacao/
│       ├── 01_comparar_catalogos.py
│       └── 02_consolidar_bancos.js
│
└── src/
    ├── config/
    │   ├── database.js
    │   └── typesense.js
    │
    ├── controllers/
    │   └── buscaController.js
    │
    ├── routes/
    │   └── buscaRoutes.js
    │
    ├── services/
    │   ├── buscaService.js
    │   └── sincronizarTypesense.js
    │
    └── server.js
```

## 10. Configuração do ambiente

### Requisitos

- Docker.
- Docker Compose.
- Node.js versão 22 a 24.
- Git.

### Variáveis de ambiente

O projeto utiliza um arquivo `.env` para armazenar configurações de conexão.

As variáveis necessárias são:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DB_HOST`
- `DB_PORT`
- `TYPESENSE_API_KEY`

O arquivo `.env` não deve ser enviado ao GitHub.

### Inicialização dos contêineres

Na pasta principal do projeto:

```bash
docker compose up -d
```

Para verificar os serviços:

```bash
docker compose ps
```

### Instalação das dependências

```bash
npm install
```

### Aplicação do schema

Em uma instalação nova, depois de iniciar o PostgreSQL, o schema pode ser aplicado com:

```bash
cat database/schema/01_schema.sql | docker exec -i knowledge-base-postgres psql -U knowledge_user -d knowledge_base
```

A carga de dados e a criação da coleção de busca também precisam ser executadas antes de testar a pesquisa em um ambiente vazio. Os procedimentos definitivos de inicialização e carga serão documentados após a conclusão dos scripts reproduzíveis.

### Inicialização da API

Modo de desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

A API fica disponível em:

`http://localhost:3000`

### Teste da rota principal

```bash
curl http://localhost:3000/
```

### Teste da busca

```bash
curl -G "http://localhost:3000/api/busca" \
  --data-urlencode "q=refatoração"
```

## 11. Controle de versão

O Git é utilizado para registrar a evolução do projeto.

Os commits devem descrever as alterações realizadas, utilizando mensagens claras e objetivas.

Exemplos:

- `feat: cria modelagem relacional`
- `feat: configura PostgreSQL com Docker`
- `feat: integra Typesense ao backend`
- `feat: implementa endpoint de busca`
- `docs: atualiza documentação da API`

O repositório remoto está hospedado no GitHub.

## 12. Uso da inteligência artificial

A inteligência artificial é utilizada como copiloto técnico durante o desenvolvimento.

Sua utilização contempla:

- Apoio à modelagem de dados.
- Planejamento da infraestrutura.
- Geração e revisão de scripts.
- Apoio à criação da massa de dados fictícios.
- Orientação na integração entre PostgreSQL e Typesense.
- Explicação de conceitos e resolução de erros.
- Revisão da documentação.

As decisões técnicas, adaptações, testes e utilização da IA deverão ser registrados no arquivo `IA_LOG.md`, conforme solicitado nas diretrizes do trabalho.

## 13. Etapas de desenvolvimento

### Concluídas

- [x] Preparação do ambiente.
- [x] Criação do repositório GitHub.
- [x] Modelagem DER.
- [x] Definição do modelo lógico.
- [x] Criação do schema PostgreSQL.
- [x] Configuração do PostgreSQL com Docker.
- [x] Configuração do Typesense com Docker.
- [x] Criação da estrutura Node.js.
- [x] Consolidação inicial dos dados fictícios.
- [x] Indexação inicial de 1.000 artigos no Typesense.
- [x] Integração do Typesense com o backend.
- [x] Implementação inicial da API de busca.
- [x] Testes da pesquisa e da paginação.

### Em desenvolvimento

- [ ] Ampliar a massa de dados para milhares de registros.
- [ ] Criar carga inicial reproduzível em ambiente limpo.
- [ ] Implementar sincronização automática entre PostgreSQL e Typesense.
- [ ] Documentar integralmente a execução da aplicação.
- [ ] Criar o arquivo `IA_LOG.md`.
- [ ] Validar a instalação completa em ambiente limpo.
- [ ] Revisar o histórico de commits e a participação da dupla.
- [ ] Preparar a demonstração da recuperação de informação.

## 14. Considerações finais

O Knowledge Base foi desenvolvido para atender à proposta Smart-Base de recuperação de informação, utilizando uma arquitetura baseada em PostgreSQL e Typesense.

A escolha da Trilha B permite demonstrar a integração entre um banco de dados relacional e um mecanismo especializado em busca textual.

O desenvolvimento prioriza a integridade dos dados, a recuperação de informações, a organização da arquitetura e a reprodução do ambiente por meio de ferramentas de conteinerização.

O projeto permanece em desenvolvimento até a conclusão dos requisitos de massa de dados, sincronização, documentação e validação final.