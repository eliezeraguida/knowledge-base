
-- ============================================================
-- KNOWLEDGE BASE
-- Schema inicial do banco de dados
-- PostgreSQL 16
-- ============================================================

BEGIN;

-- ============================================================
-- 1. AUTORES
-- ============================================================

CREATE TABLE autores (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    biografia TEXT,

    CONSTRAINT pk_autores
        PRIMARY KEY (id),

    CONSTRAINT ck_autores_nome
        CHECK (BTRIM(nome) <> ''),

    CONSTRAINT ck_autores_email
        CHECK (BTRIM(email) <> '')
);

CREATE UNIQUE INDEX uq_autores_email
    ON autores (LOWER(email));


-- ============================================================
-- 2. CATEGORIAS
-- ============================================================

CREATE TABLE categorias (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,

    CONSTRAINT pk_categorias
        PRIMARY KEY (id),

    CONSTRAINT ck_categorias_nome
        CHECK (BTRIM(nome) <> '')
);

CREATE UNIQUE INDEX uq_categorias_nome
    ON categorias (LOWER(nome));


-- ============================================================
-- 3. TAGS
-- ============================================================

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(50) NOT NULL,

    CONSTRAINT pk_tags
        PRIMARY KEY (id),

    CONSTRAINT ck_tags_nome
        CHECK (BTRIM(nome) <> '')
);

CREATE UNIQUE INDEX uq_tags_nome
    ON tags (LOWER(nome));


-- ============================================================
-- 4. ARTIGOS
-- ============================================================

CREATE TABLE artigos (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    resumo TEXT,
    conteudo TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'rascunho',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_artigos
        PRIMARY KEY (id),

    CONSTRAINT ck_artigos_titulo
        CHECK (BTRIM(titulo) <> ''),

    CONSTRAINT ck_artigos_slug
        CHECK (BTRIM(slug) <> ''),

    CONSTRAINT ck_artigos_conteudo
        CHECK (BTRIM(conteudo) <> ''),

    CONSTRAINT ck_artigos_status
        CHECK (status IN ('rascunho', 'publicado', 'arquivado'))
);

CREATE UNIQUE INDEX uq_artigos_slug
    ON artigos (LOWER(slug));


-- ============================================================
-- 5. ARTIGO_AUTORES
-- Relacionamento N:N entre artigos e autores
-- ============================================================

CREATE TABLE artigo_autores (
    artigo_id BIGINT NOT NULL,
    autor_id BIGINT NOT NULL,

    CONSTRAINT pk_artigo_autores
        PRIMARY KEY (artigo_id, autor_id),

    CONSTRAINT fk_artigo_autores_artigo
        FOREIGN KEY (artigo_id)
        REFERENCES artigos (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_artigo_autores_autor
        FOREIGN KEY (autor_id)
        REFERENCES autores (id)
        ON DELETE RESTRICT
);


-- ============================================================
-- 6. ARTIGO_CATEGORIAS
-- Relacionamento N:N entre artigos e categorias
-- ============================================================

CREATE TABLE artigo_categorias (
    artigo_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,

    CONSTRAINT pk_artigo_categorias
        PRIMARY KEY (artigo_id, categoria_id),

    CONSTRAINT fk_artigo_categorias_artigo
        FOREIGN KEY (artigo_id)
        REFERENCES artigos (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_artigo_categorias_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id)
        ON DELETE RESTRICT
);


-- ============================================================
-- 7. ARTIGO_TAGS
-- Relacionamento N:N entre artigos e tags
-- ============================================================

CREATE TABLE artigo_tags (
    artigo_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    CONSTRAINT pk_artigo_tags
        PRIMARY KEY (artigo_id, tag_id),

    CONSTRAINT fk_artigo_tags_artigo
        FOREIGN KEY (artigo_id)
        REFERENCES artigos (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_artigo_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags (id)
        ON DELETE RESTRICT
);


-- ============================================================
-- 8. ÍNDICES ADICIONAIS
-- ============================================================

-- Índice para consultas por data de criação.
CREATE INDEX idx_artigos_criado_em
    ON artigos (criado_em);

-- Índice para consultas por status.
CREATE INDEX idx_artigos_status
    ON artigos (status);

-- Índices nas FKs do lado das tabelas associativas.
-- As PKs compostas já atendem às consultas pela primeira coluna.

CREATE INDEX idx_artigo_autores_autor_id
    ON artigo_autores (autor_id);

CREATE INDEX idx_artigo_categorias_categoria_id
    ON artigo_categorias (categoria_id);

CREATE INDEX idx_artigo_tags_tag_id
    ON artigo_tags (tag_id);


-- ============================================================
-- 9. PROTEÇÃO DE criado_em
-- Impede que a data original de criação seja alterada.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_proteger_criado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.criado_em IS DISTINCT FROM OLD.criado_em THEN
        RAISE EXCEPTION
            'A data de criação do artigo não pode ser alterada.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_artigos_proteger_criado_em
BEFORE UPDATE ON artigos
FOR EACH ROW
EXECUTE FUNCTION fn_proteger_criado_em();


-- ============================================================
-- 10. ATUALIZAÇÃO AUTOMÁTICA DE atualizado_em
-- ============================================================

CREATE OR REPLACE FUNCTION fn_atualizar_data_modificacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.atualizado_em := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_artigos_atualizar_data
BEFORE UPDATE ON artigos
FOR EACH ROW
EXECUTE FUNCTION fn_atualizar_data_modificacao();


-- ============================================================
-- 11. GARANTIR PELO MENOS UM AUTOR POR ARTIGO
-- A verificação acontece no final da transação.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_artigo_autores()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_artigo_id BIGINT;
BEGIN
    IF TG_TABLE_NAME = 'artigos' THEN
        v_artigo_id := NEW.id;
    ELSE
        v_artigo_id := OLD.artigo_id;
    END IF;

    -- Se o artigo foi excluído, não há mais associação a validar.
    IF EXISTS (
        SELECT 1
        FROM artigos
        WHERE id = v_artigo_id
    ) THEN

        IF NOT EXISTS (
            SELECT 1
            FROM artigo_autores
            WHERE artigo_id = v_artigo_id
        ) THEN
            RAISE EXCEPTION
                'O artigo % deve possuir pelo menos um autor.',
                v_artigo_id;
        END IF;

    END IF;

    RETURN NULL;
END;
$$;

-- Verifica artigos novos ou alterados.
CREATE CONSTRAINT TRIGGER trg_validar_artigo_autores
AFTER INSERT OR UPDATE ON artigos
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_validar_artigo_autores();

-- Verifica se a exclusão de uma associação deixou o artigo sem autor.
CREATE CONSTRAINT TRIGGER trg_validar_remocao_autor
AFTER DELETE OR UPDATE ON artigo_autores
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_validar_artigo_autores();


-- ============================================================
-- 12. GARANTIR PELO MENOS UMA CATEGORIA POR ARTIGO
-- A verificação acontece no final da transação.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_artigo_categorias()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_artigo_id BIGINT;
BEGIN
    IF TG_TABLE_NAME = 'artigos' THEN
        v_artigo_id := NEW.id;
    ELSE
        v_artigo_id := OLD.artigo_id;
    END IF;

    -- Se o artigo foi excluído, não há mais associação a validar.
    IF EXISTS (
        SELECT 1
        FROM artigos
        WHERE id = v_artigo_id
    ) THEN

        IF NOT EXISTS (
            SELECT 1
            FROM artigo_categorias
            WHERE artigo_id = v_artigo_id
        ) THEN
            RAISE EXCEPTION
                'O artigo % deve possuir pelo menos uma categoria.',
                v_artigo_id;
        END IF;

    END IF;

    RETURN NULL;
END;
$$;

-- Verifica artigos novos ou alterados.
CREATE CONSTRAINT TRIGGER trg_validar_artigo_categorias
AFTER INSERT OR UPDATE ON artigos
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_validar_artigo_categorias();

-- Verifica se a exclusão de uma associação deixou o artigo sem categoria.
CREATE CONSTRAINT TRIGGER trg_validar_remocao_categoria
AFTER DELETE OR UPDATE ON artigo_categorias
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_validar_artigo_categorias();


COMMIT;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================

