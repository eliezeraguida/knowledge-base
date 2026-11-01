# Modelagem Lógica — Knowledge Base

## 1. Objetivo

Este documento descreve a modelagem lógica do banco de dados do projeto Knowledge Base.

O sistema permitirá cadastrar, organizar e recuperar artigos, tutoriais e soluções por meio de autores, categorias e tags.

O banco de dados será implementado em PostgreSQL 16.

A modelagem será desenvolvida de forma incremental, permitindo ajustes conforme a implementação e os testes.

## 2. Entidades e tabelas

O banco será composto por sete tabelas:

### 2.1. AUTORES

Armazena os autores dos artigos.

| Campo | Tipo | Regra |
|---|---|---|
| id | BIGINT | PK, geração automática |
| nome | VARCHAR(150) | Obrigatório |
| email | VARCHAR(254) | Obrigatório, único |
| biografia | TEXT | Opcional |

### 2.2. ARTIGOS

Armazena os conteúdos publicados ou em preparação.

| Campo | Tipo | Regra |
|---|---|---|
| id | BIGINT | PK, geração automática |
| titulo | VARCHAR(200) | Obrigatório |
| slug | VARCHAR(220) | Obrigatório, único |
| resumo | TEXT | Obrigatório |
| conteudo | TEXT | Obrigatório |
| status | VARCHAR(20) | Obrigatório, padrão `rascunho` |
| criado_em | TIMESTAMPTZ | Obrigatório, padrão data atual, imutável após criação |
| atualizado_em | TIMESTAMPTZ | Obrigatório, padrão data atual, atualização automática |

Status permitidos:

- `rascunho`
- `publicado`
- `arquivado`

### 2.3. CATEGORIAS

Armazena as categorias utilizadas para classificar os artigos.

| Campo | Tipo | Regra |
|---|---|---|
| id | BIGINT | PK, geração automática |
| nome | VARCHAR(100) | Obrigatório, único |
| descricao | TEXT | Opcional |

### 2.4. TAGS

Armazena palavras-chave utilizadas para identificar os artigos.

| Campo | Tipo | Regra |
|---|---|---|
| id | BIGINT | PK, geração automática |
| nome | VARCHAR(50) | Obrigatório, único |

### 2.5. ARTIGO_AUTORES

Relaciona artigos e autores.

| Campo | Tipo | Regra |
|---|---|---|
| artigo_id | BIGINT | PK composta, FK |
| autor_id | BIGINT | PK composta, FK |

A tabela permite que um artigo tenha vários autores e que um autor participe de vários artigos.

A ordem de exibição dos autores não será armazenada no banco. Quando necessário, a consulta poderá apresentar os autores em ordem alfabética.

### 2.6. ARTIGO_CATEGORIAS

Relaciona artigos e categorias.

| Campo | Tipo | Regra |
|---|---|---|
| artigo_id | BIGINT | PK composta, FK |
| categoria_id | BIGINT | PK composta, FK |

Um artigo pode possuir várias categorias, e uma categoria pode classificar vários artigos.

### 2.7. ARTIGO_TAGS

Relaciona artigos e tags.

| Campo | Tipo | Regra |
|---|---|---|
| artigo_id | BIGINT | PK composta, FK |
| tag_id | BIGINT | PK composta, FK |

Um artigo pode possuir várias tags ou nenhuma tag.

## 3. Chaves primárias e estrangeiras

As tabelas principais utilizarão uma chave primária individual chamada `id`, do tipo BIGINT, com geração automática de valores.

As tabelas associativas utilizarão chaves primárias compostas:

- ARTIGO_AUTORES: `(artigo_id, autor_id)`
- ARTIGO_CATEGORIAS: `(artigo_id, categoria_id)`
- ARTIGO_TAGS: `(artigo_id, tag_id)`

As chaves estrangeiras garantirão que as associações apontem para registros existentes.

## 4. Regras de exclusão

As regras de exclusão serão:

### Exclusão de artigos

Será utilizado `ON DELETE CASCADE` nas associações de artigos.

Ao excluir um artigo, suas associações com autores, categorias e tags também serão excluídas.

Os registros de autores, categorias e tags permanecerão cadastrados.

### Exclusão de autores, categorias e tags

Será utilizado `ON DELETE RESTRICT`.

Um autor, categoria ou tag não poderá ser excluído enquanto estiver relacionado a algum artigo.

Caso não existam associações, a exclusão poderá ser realizada.

## 5. Restrições de integridade

O PostgreSQL será responsável por garantir a integridade dos dados.

Serão utilizadas:

- `NOT NULL` para campos obrigatórios.
- `UNIQUE` para valores que não podem se repetir.
- `CHECK` para validar valores permitidos.
- `DEFAULT` para valores preenchidos automaticamente.
- Chaves primárias e estrangeiras para garantir os relacionamentos.

O campo `status` aceitará somente `rascunho`, `publicado` e `arquivado`.

Os campos de texto obrigatórios também deverão impedir valores vazios ou compostos somente por espaços.

Essa validação será feita com expressões como `BTRIM` em restrições `CHECK`, além da validação no backend.

## 6. Unicidade sem diferenciar maiúsculas e minúsculas

Os seguintes campos deverão ser únicos, independentemente de letras maiúsculas ou minúsculas:

| Tabela | Campo |
|---|---|
| AUTORES | email |
| ARTIGOS | slug |
| CATEGORIAS | nome |
| TAGS | nome |

O nome do autor poderá se repetir.

A garantia será implementada em duas camadas:

1. O Node.js normalizará os valores antes de armazená-los.
2. O PostgreSQL garantirá a unicidade por meio de índices únicos baseados em `LOWER()`.

A normalização no backend melhora a consistência dos dados, enquanto o PostgreSQL protege a integridade mesmo em operações realizadas diretamente no banco.

## 7. Datas e atualização automática

Os campos de data utilizarão `TIMESTAMPTZ`, permitindo armazenar data e horário com informação de fuso horário.

O campo `criado_em` será preenchido automaticamente na criação do registro e não poderá ser alterado depois da criação.

Essa proteção será implementada diretamente no PostgreSQL, impedindo alterações inclusive em comandos SQL executados fora do backend.

O campo `atualizado_em` será atualizado automaticamente por um trigger `BEFORE UPDATE`.

O trigger utilizará `NEW` para atribuir a data e o horário atuais ao registro que será atualizado.

## 8. Obrigatoriedade de autores e categorias

Todo artigo deverá possuir pelo menos:

- Um autor.
- Uma categoria.

Um artigo poderá existir sem tags.

Como uma chave estrangeira não garante sozinha a existência de pelo menos uma associação, serão utilizados triggers de restrição adiáveis no PostgreSQL (`CONSTRAINT TRIGGER`, `DEFERRABLE INITIALLY DEFERRED`).

A validação deverá ocorrer ao final da transação.

A regra será: todo artigo que continuar existindo ao final da transação deverá possuir pelo menos um autor e uma categoria.

A implementação deverá considerar também exclusões e alterações nas tabelas associativas, inclusive exclusões em cascata.

## 9. Validação de dados: backend e banco

A validação será dividida entre duas camadas.

### Node.js

Responsável por:

- Validar os dados recebidos.
- Normalizar e-mails, slugs, categorias e tags.
- Apresentar mensagens de erro compreensíveis.
- Impedir operações inválidas antes de enviá-las ao banco.

### PostgreSQL

Responsável por:

- Garantir integridade referencial.
- Impedir duplicidades.
- Validar campos obrigatórios.
- Restringir valores permitidos.
- Proteger a imutabilidade de `criado_em`.
- Executar atualizações automáticas.
- Garantir as regras de associação entre artigos, autores e categorias.

## 10. Índices

As chaves primárias e restrições de unicidade já criarão índices automaticamente.

Também será criado um índice para `ARTIGOS.criado_em`, considerando consultas e ordenações por data de criação.

As chaves estrangeiras não criam automaticamente índices no lado que referencia os registros.

A necessidade de índices adicionais será avaliada conforme as consultas implementadas e os testes.

Não serão criados índices duplicados para colunas que já possuam índices adequados.

## 11. Busca textual

O PostgreSQL será responsável pela persistência e integridade dos dados.

A recuperação de informação será complementada por um motor externo de busca textual, conforme a Trilha 2 do projeto.

A ferramenta escolhida será integrada ao backend Node.js.

O fluxo esperado será:

1. O artigo é cadastrado.
2. O conteúdo é armazenado no PostgreSQL.
3. O backend envia os dados necessários ao motor de busca.
4. O usuário realiza uma pesquisa textual.
5. O motor retorna os resultados encontrados.
6. O backend disponibiliza os artigos correspondentes.

A escolha definitiva entre Typesense e Elasticsearch será registrada separadamente.

## 12. Fora do escopo inicial

Não fazem parte do MVP:

- Histórico de versões dos artigos.
- Sistema avançado de permissões.
- Interface frontend obrigatória.
- Implementação simultânea de Typesense e Elasticsearch.
- Recursos adicionais de busca que não sejam necessários à demonstração da recuperação de informação.

## 13. Pendências antes do schema.sql

Antes da implementação definitiva do SQL, ainda será necessário:

1. Definir a implementação técnica da proteção de `criado_em`, mantendo sua imutabilidade no PostgreSQL.
2. Avaliar índices nas colunas que são chaves estrangeiras.
3. Detalhar os eventos dos triggers de restrição e validar o comportamento com exclusões em cascata.
4. Definir a ferramenta de busca textual da Trilha 2.

## 14. Histórico de decisões

Este documento registra as decisões de modelagem lógica aprovadas durante o desenvolvimento do projeto.

A estrutura poderá ser atualizada conforme a implementação, os testes e as necessidades identificadas.

As alterações deverão ser documentadas para manter a coerência entre a modelagem, o banco implementado e o backend.
