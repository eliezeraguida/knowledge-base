# Knowledge Base — Smart-Base

Sistema de gerenciamento e recuperação de informações por meio de artigos e conteúdos técnicos.

**Disciplina:** Banco de Dados II  
**Curso:** Ciência da Computação — Unifacvest  
**Professor:** Willen Leolatto Carneiro  
**Prazo de entrega:** 10/11/2026  
**Status:** Em desenvolvimento

---

## 1. Objetivo do projeto

Desenvolver um MVP de uma base de conhecimento capaz de armazenar, organizar e recuperar informações estruturadas por meio de artigos técnicos.

O projeto utiliza um banco de dados relacional para persistência e um mecanismo especializado para busca textual, demonstrando técnicas de modelagem, integridade dos dados, conteinerização e recuperação da informação.

O desenvolvimento é realizado de forma incremental, priorizando a compreensão das decisões técnicas e a implementação das funcionalidades.

## 2. Escopo da aplicação

A aplicação representa um catálogo de conhecimento que permite organizar artigos técnicos por autores, categorias e tags.

Cada artigo possui título, identificação por slug, resumo, conteúdo textual, status e datas de criação e atualização.

O sistema contempla:

- Armazenamento de artigos com textos longos.
- Cadastro e relacionamento de autores.
- Organização de artigos por categorias.
- Classificação de artigos por tags.
- Integridade dos relacionamentos.
- Pesquisa textual nos conteúdos.
- Recuperação de resultados conforme a relevância.
- Consulta individual de artigos.
- Identificação de artigos relacionados por categorias e tags.
- Paginação dos resultados.
- Interface web para demonstrar as funcionalidades.

O foco acadêmico principal continua sendo o backend, a persistência dos dados e a recuperação da informação.

**Observação:** a interface gráfica não é um dos critérios centrais de avaliação definidos no enunciado. Foi desenvolvida como recurso complementar para facilitar a demonstração e a utilização do sistema.

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

### 3.4. Interface web

A interface foi desenvolvida com tecnologias web básicas:

- HTML: estrutura das páginas.
- CSS: apresentação visual e responsividade.
- JavaScript: comunicação com a API e interatividade.

Não foi utilizado um framework frontend.

## 4. Arquitetura da aplicação

A arquitetura utiliza o PostgreSQL como fonte principal dos dados e o Typesense como índice especializado de pesquisa.

### Responsabilidade dos componentes

**PostgreSQL**

- Armazenamento permanente dos dados.
- Integridade referencial.
- Restrições e validações.
- Relacionamentos entre entidades.
- Consulta dos dados completos dos artigos.

**Node.js e Express**

- Recebimento das requisições.
- Comunicação com o banco de dados.
- Integração com o Typesense.
- Organização das regras de negócio.
- Disponibilização da API REST.

**Typesense**

- Indexação dos artigos.
- Pesquisa textual.
- Recuperação de resultados.
- Ordenação por relevância.

**Frontend**

- Apresentação dos resultados da pesquisa.
- Paginação.
- Visualização dos detalhes dos artigos.
- Exibição de artigos relacionados.

**Docker**

- Execução dos serviços em contêineres.
- Padronização do ambiente de desenvolvimento.

### Fluxo de pesquisa

1. O usuário informa um termo na interface.
2. O frontend envia uma requisição à API.
3. O Express recebe a requisição.
4. A rota encaminha a solicitação ao controller.
5. O controller valida os parâmetros.
6. O serviço consulta o Typesense.
7. O mecanismo retorna os documentos encontrados.
8. A API entrega os resultados em formato JSON.
9. O frontend apresenta os resultados ao usuário.

O PostgreSQL permanece como fonte principal dos dados. O índice do Typesense é uma representação utilizada para acelerar a recuperação das informações.

### Fluxo de consulta de um artigo

1. O usuário seleciona um artigo nos resultados.
2. O frontend solicita os dados completos à API.
3. A API consulta o PostgreSQL.
4. O serviço recupera o artigo e seus relacionamentos.
5. O frontend apresenta o conteúdo completo em uma janela de detalhes.
6. A aplicação solicita os artigos relacionados ao artigo selecionado.

### Recuperação de artigos relacionados

A identificação de artigos relacionados utiliza os relacionamentos armazenados no PostgreSQL.

O critério atual considera:

- Categorias em comum: 2 pontos.
- Tags em comum: 1 ponto.

Os artigos são ordenados pela pontuação de relevância, com limite de até 10 resultados.

Essa funcionalidade utiliza os relacionamentos existentes no banco de dados, sem depender de similaridade semântica ou inteligência artificial.

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

A consolidação inicial reuniu dados de duas fontes independentes: Claude e Antigravity.

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

Os dados foram produzidos para fins de demonstração acadêmica.

Os arquivos originais e os materiais de consolidação permanecem no repositório enquanto sua necessidade é avaliada.

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

## 8. API REST

A aplicação disponibiliza endpoints para pesquisa, consulta individual e recuperação de artigos relacionados.

### 8.1. Pesquisa de artigos

**Endpoint:**

`GET /api/busca`

**Parâmetros:**

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `q` | Sim | Termo da pesquisa |
| `pagina` | Não | Número da página. Padrão: 1 |
| `limite` | Não | Resultados por página. Padrão: 10. Máximo: 50 |

**Exemplos:**

Pesquisa simples:

`GET http://localhost:3000/api/busca?q=refatoração`

Pesquisa com paginação:

`GET http://localhost:3000/api/busca?q=refatoração&pagina=2&limite=5`

**Exemplo de resposta:**

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

### 8.2. Consulta individual de artigo

**Endpoint:**

`GET /api/artigos/:id`

Permite recuperar os dados completos de um artigo por meio de seu identificador.

A resposta inclui:

- Identificação.
- Título.
- Slug.
- Resumo.
- Conteúdo.
- Status.
- Datas de criação e atualização.
- Autores.
- Categorias.
- Tags.

**Exemplo:**

`GET http://localhost:3000/api/artigos/405`

A consulta utiliza o PostgreSQL como fonte dos dados.

### 8.3. Artigos relacionados

**Endpoint:**

`GET /api/busca/:id/relacionados`

Retorna artigos relacionados ao identificador informado.

A classificação utiliza categorias e tags em comum, considerando os pesos definidos na regra de relevância.

**Exemplo:**

`GET http://localhost:3000/api/busca/5/relacionados`

O endpoint retorna até 10 artigos, ordenados conforme a pontuação de relevância.

### 8.4. Validações implementadas

- Pesquisa sem termo retorna erro HTTP 400.
- Paginação inválida é rejeitada.
- O limite máximo de resultados por página é 50.
- Erros inesperados são tratados pela API.

### 8.5. Testes realizados

| Teste | Resultado |
|---|---|
| Rota principal da API | Aprovado |
| Pesquisa por `refatoração` | 23 resultados encontrados |
| Pesquisa sem termo | Erro HTTP 400 esperado |
| Paginação na página 2 | 5 resultados retornados |
| Pesquisa com tolerância a erros de digitação | Testada |
| Consulta individual de artigo | Aprovada |
| Recuperação de artigos relacionados | Aprovada |
| Conexão com Typesense | Aprovada |
| Indexação inicial de 1.000 artigos | Aprovada |

## 9. Interface web

Foi desenvolvida uma interface complementar para demonstrar o funcionamento do sistema.

### Funcionalidades implementadas

- Campo de pesquisa de artigos.
- Apresentação dos resultados em cartões.
- Exibição da quantidade de resultados encontrados.
- Paginação.
- Abertura dos detalhes de um artigo.
- Exibição de autores, categorias e tags.
- Apresentação do conteúdo completo.
- Exibição de artigos relacionados.
- Navegação entre artigos relacionados.
- Formatação básica de conteúdo Markdown.
- Layout responsivo para diferentes tamanhos de tela.

A interface se comunica com o backend por meio dos endpoints REST.

O objetivo é facilitar a demonstração prática da recuperação de informações, sem substituir o foco acadêmico do projeto.

## 10. Estrutura do projeto

```text
knowledge-base/
├── .gitignore
├── .env
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
├── IA_LOG.md
│
├── database/
│   ├── schema/
│   │   └── 01_schema.sql
│   └── seeds/
│       ├── originais/
│       │   ├── antigravity/
│       │   └── claude/
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
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
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
    │   ├── buscaRoutes.js
    │   └── artigoRoutes.js
    │
    ├── services/
    │   ├── buscaService.js
    │   └── sincronizarTypesense.js
    │
    └── server.js
```

## 11. Configuração do ambiente

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
cat database/schema/01_schema.sql | docker exec -i knowledge-base-postgres psql -U SEU_USUARIO -d SEU_BANCO
```

Os valores de usuário e banco devem corresponder às configurações do arquivo `.env`.

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

### Teste de consulta individual

```bash
curl http://localhost:3000/api/artigos/405
```

### Teste de artigos relacionados

```bash
curl http://localhost:3000/api/busca/5/relacionados
```

## 12. Controle de versão

O Git é utilizado para registrar a evolução do projeto.

Os commits devem descrever as alterações realizadas, utilizando mensagens claras e objetivas.

Exemplos:

- `feat: cria modelagem relacional`
- `feat: configura PostgreSQL com Docker`
- `feat: integra Typesense ao backend`
- `feat: implementa endpoint de busca`
- `feat: implementa consulta de artigos`
- `feat: adiciona interface web`
- `feat: implementa artigos relacionados`
- `docs: atualiza documentação da API`

O repositório remoto está hospedado no GitHub.

## 13. Uso da inteligência artificial

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

## 14. Etapas de desenvolvimento

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
- [x] Implementação da consulta individual de artigos.
- [x] Implementação da recuperação de artigos relacionados.
- [x] Criação da interface web para demonstração.
- [x] Testes da navegação entre artigos.

### Em desenvolvimento

- [ ] Ampliar a massa de dados para milhares de registros.
- [ ] Criar carga inicial reproduzível em ambiente limpo.
- [ ] Implementar sincronização automática entre PostgreSQL e Typesense.
- [ ] Documentar integralmente a execução da aplicação.
- [ ] Revisar e completar o arquivo `IA_LOG.md`.
- [ ] Validar a instalação completa em ambiente limpo.
- [ ] Revisar o histórico de commits e a participação da dupla.
- [ ] Preparar a demonstração da recuperação de informação.
- [ ] Realizar testes comparativos de desempenho da busca.

## 15. Considerações finais

O Knowledge Base foi desenvolvido para atender à proposta Smart-Base de recuperação de informação, utilizando uma arquitetura baseada em PostgreSQL e Typesense.

A escolha da Trilha B permite demonstrar a integração entre um banco de dados relacional e um mecanismo especializado em busca textual.

O PostgreSQL mantém os dados e seus relacionamentos, enquanto o Typesense oferece recursos especializados para indexação e recuperação textual.

O projeto também possui uma interface web complementar, que permite demonstrar a pesquisa, a visualização dos artigos e a recuperação de conteúdos relacionados.

O desenvolvimento prioriza a integridade dos dados, a recuperação de informações, a organização da arquitetura e a reprodução do ambiente por meio de ferramentas de conteinerização.

O projeto permanece em desenvolvimento até a conclusão dos requisitos de massa de dados, sincronização, documentação e validação final.