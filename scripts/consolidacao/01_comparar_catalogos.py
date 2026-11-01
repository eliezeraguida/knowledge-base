import os
import re
import unicodedata
from pathlib import Path

import psycopg


# Localiza e lê o arquivo .env do projeto.
RAIZ = Path(__file__).resolve().parents[2]
CAMINHO_ENV = RAIZ / ".env"


def carregar_env():
    configuracoes = {}

    with CAMINHO_ENV.open(encoding="utf-8") as arquivo:
        for linha in arquivo:
            linha = linha.strip()

            if not linha or linha.startswith("#") or "=" not in linha:
                continue

            chave, valor = linha.split("=", 1)
            configuracoes[chave.strip()] = valor.strip()

    return configuracoes


ENV = carregar_env()


def normalizar(texto):
    """Padroniza texto para comparar nomes e descrições."""
    texto = texto.casefold().strip()

    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(
        caractere
        for caractere in texto
        if not unicodedata.combining(caractere)
    )

    # Trata hífens e sublinhados como espaços.
    texto = re.sub(r"[-_]+", " ", texto)

    # Remove espaços duplicados.
    return re.sub(r"\s+", " ", texto).strip()


def conectar(nome_banco):
    """Abre uma conexão somente para leitura."""

    return psycopg.connect(
        host=ENV.get("DB_HOST", "localhost"),
        port=ENV.get("DB_PORT", "5432"),
        dbname=nome_banco,
        user=ENV["POSTGRES_USER"],
        password=ENV["POSTGRES_PASSWORD"],
        options="-c default_transaction_read_only=on",
    )


def buscar_registros(nome_banco, tabela, colunas):
    consulta = f"SELECT {colunas} FROM {tabela} ORDER BY id"

    with conectar(nome_banco) as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(consulta)
            return cursor.fetchall()


def comparar_catalogos(nome, registros_agy, registros_claude, chave):
    mapa_agy = {chave(registro): registro for registro in registros_agy}
    mapa_claude = {
        chave(registro): registro for registro in registros_claude
    }

    comuns = mapa_agy.keys() & mapa_claude.keys()
    exclusivos_agy = mapa_agy.keys() - mapa_claude.keys()
    exclusivos_claude = mapa_claude.keys() - mapa_agy.keys()

    print(f"\n{'=' * 60}")
    print(nome)
    print("=" * 60)

    print(f"Antigravity: {len(registros_agy)}")
    print(f"Claude:      {len(registros_claude)}")
    print(f"Equivalentes: {len(comuns)}")
    print(f"Exclusivos Antigravity: {len(exclusivos_agy)}")
    print(f"Exclusivos Claude:      {len(exclusivos_claude)}")

    if exclusivos_agy:
        print("\nSomente Antigravity:")
        for item in sorted(exclusivos_agy):
            print(f"  - {mapa_agy[item][1]}")

    if exclusivos_claude:
        print("\nSomente Claude:")
        for item in sorted(exclusivos_claude):
            print(f"  - {mapa_claude[item][1]}")

    return len(comuns)


def main():
    print("=" * 60)
    print("COMPARAÇÃO DOS CATÁLOGOS — KNOWLEDGE BASE")
    print("=" * 60)

    autores_agy = buscar_registros(
        "kb_staging_agy", "autores", "id, nome, email"
    )
    autores_claude = buscar_registros(
        "kb_staging_claude", "autores", "id, nome, email"
    )

    categorias_agy = buscar_registros(
        "kb_staging_agy", "categorias", "id, nome"
    )
    categorias_claude = buscar_registros(
        "kb_staging_claude", "categorias", "id, nome"
    )

    tags_agy = buscar_registros(
        "kb_staging_agy", "tags", "id, nome"
    )
    tags_claude = buscar_registros(
        "kb_staging_claude", "tags", "id, nome"
    )

    comparar_catalogos(
        "AUTORES",
        autores_agy,
        autores_claude,
        lambda registro: normalizar(registro[2]),
    )

    comparar_catalogos(
        "CATEGORIAS",
        categorias_agy,
        categorias_claude,
        lambda registro: normalizar(registro[1]),
    )

    comparar_catalogos(
        "TAGS",
        tags_agy,
        tags_claude,
        lambda registro: normalizar(registro[1]),
    )

    print("\nComparação concluída. Nenhum dado foi alterado.")


if __name__ == "__main__":
    main()