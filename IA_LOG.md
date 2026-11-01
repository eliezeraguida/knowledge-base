# Registro de Uso da Inteligência Artificial — IA_LOG

**Projeto:** Knowledge Base — Smart-Base  
**Disciplina:** Banco de Dados II  
**Instituição:** Unifacvest

## 1. Objetivo

Este documento registra a utilização de ferramentas de Inteligência Artificial como apoio ao desenvolvimento do projeto, conforme solicitado nas diretrizes da disciplina.

A IA foi utilizada como copiloto técnico. As implementações, execuções de comandos, validações e decisões foram acompanhadas pelos integrantes da equipe.

## 2. Atividades realizadas com apoio da IA

### 2.1. Modelagem do banco de dados

**Objetivo:** apoiar a elaboração do modelo relacional, identificação das entidades, relacionamentos e restrições de integridade.

**Atuação da IA:** auxílio na análise da estrutura, relacionamentos muitos-para-muitos, chaves, índices e regras de integridade.

**Adaptação humana:** análise das propostas, definição das regras do projeto e validação do schema SQL.

### 2.2. Infraestrutura com Docker

**Objetivo:** configurar os serviços necessários para execução do projeto.

**Atuação da IA:** orientação para configuração do PostgreSQL e Typesense por meio do Docker Compose.

**Adaptação humana:** criação e execução dos arquivos de configuração e verificação dos contêineres.

### 2.3. Geração e consolidação de dados fictícios

**Objetivo:** construir uma massa de dados para demonstrar a persistência e a recuperação de informações.

**Atuação da IA:** apoio no planejamento, análise e desenvolvimento dos scripts de comparação e consolidação dos catálogos fictícios.

**Adaptação humana:** execução dos scripts, análise dos resultados e validação das quantidades consolidadas.

### 2.4. Integração com Typesense

**Objetivo:** implementar a Trilha B de expansão, utilizando um mecanismo externo de busca textual.

**Atuação da IA:** orientação para configuração do cliente Typesense, criação da coleção, indexação dos artigos e implementação do serviço de pesquisa.

**Adaptação humana:** configuração do ambiente, execução da sincronização e validação dos documentos indexados.

### 2.5. Desenvolvimento da API

**Objetivo:** disponibilizar a pesquisa textual por meio de uma API REST.

**Atuação da IA:** apoio à organização da arquitetura em rotas, controllers e services, além da implementação inicial do endpoint de busca.

**Adaptação humana:** criação e revisão dos arquivos, execução da aplicação e testes das requisições.

### 2.6. Documentação

**Objetivo:** documentar a arquitetura, tecnologias, instruções de execução e funcionalidades.

**Atuação da IA:** revisão e organização do README e apoio à análise de aderência às diretrizes da disciplina.

**Adaptação humana:** conferência das informações e atualização da documentação conforme o estado real do projeto.

## 3. Correções e adaptações técnicas

Durante o desenvolvimento, foram identificadas situações que exigiram ajustes:

- Conversão de valores numéricos retornados pelo PostgreSQL para o formato aceito pelo Typesense.
- Correção da importação dos documentos para evitar falhas durante a indexação.
- Ajustes na configuração das conexões entre os serviços.
- Validação dos parâmetros de pesquisa e paginação na API.

As correções foram testadas no ambiente de desenvolvimento.

## 4. Responsabilidade dos integrantes

A Inteligência Artificial foi utilizada como ferramenta de apoio, não como substituta do desenvolvimento e da compreensão técnica.

Os integrantes são responsáveis por revisar as sugestões, executar os procedimentos, compreender as implementações e validar os resultados.

## 5. Observação

Este registro apresenta as atividades realizadas com apoio da IA de forma resumida. Os prompts e as decisões específicas poderão ser complementados durante as próximas etapas do desenvolvimento.