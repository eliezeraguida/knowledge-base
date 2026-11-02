
const formulario = document.getElementById('form-pesquisa');
const campoPesquisa = document.getElementById('campo-pesquisa');
const listaArtigos = document.getElementById('lista-artigos');
const mensagemStatus = document.getElementById('mensagem-status');
const quantidadeResultados = document.getElementById('quantidade-resultados');

// Elementos da janela de leitura
const modalArtigo = document.getElementById('modal-artigo');
const detalhesArtigo = document.getElementById('detalhes-artigo');
const fecharModal = document.getElementById('fechar-modal');

// Configurações da paginação
const LIMITE_POR_PAGINA = 10;

let termoAtual = '';
let paginaAtual = 1;

// Área onde os controles de paginação serão apresentados
const paginacao = document.createElement('div');
paginacao.id = 'paginacao';
paginacao.classList.add('paginacao');

listaArtigos.insertAdjacentElement('afterend', paginacao);

// Pesquisa de artigos

// Pesquisa de artigos
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    termoAtual = campoPesquisa.value.trim();
    paginaAtual = 1;

    pesquisarArtigos();
});

// Consulta a API considerando a página atual
async function pesquisarArtigos() {

    if (!termoAtual) {
        return;
    }

    listaArtigos.innerHTML = '';
    paginacao.innerHTML = '';
    quantidadeResultados.textContent = '';

    mensagemStatus.textContent = 'Pesquisando artigos...';

    try {

        const resposta = await fetch(
            `/api/busca?q=${encodeURIComponent(termoAtual)}&pagina=${paginaAtual}&limite=${LIMITE_POR_PAGINA}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao pesquisar.');
        }

        quantidadeResultados.textContent =
            `(${dados.total} encontrados)`;

        if (dados.resultados.length === 0) {
            mensagemStatus.textContent =
                'Nenhum artigo encontrado para essa pesquisa.';

            return;
        }

        mensagemStatus.textContent =
            `Resultados encontrados para "${termoAtual}":`;

        // Atualiza os cartões
        dados.resultados.forEach((artigo) => {

            const cartao = document.createElement('article');
            cartao.classList.add('artigo');

            const titulo = document.createElement('h3');
            titulo.textContent = artigo.titulo;

            const resumo = document.createElement('p');
            resumo.textContent =
                artigo.resumo || 'Resumo não disponível.';

            const categoria = document.createElement('span');
            categoria.classList.add('categoria');

            categoria.textContent =
                Array.isArray(artigo.categorias) &&
                artigo.categorias.length > 0
                    ? artigo.categorias.join(', ')
                    : 'Sem categoria';

            cartao.style.cursor = 'pointer';
            cartao.setAttribute('role', 'button');
            cartao.setAttribute('tabindex', '0');

            cartao.addEventListener('click', () => {
                abrirArtigo(artigo);
            });

            cartao.addEventListener('keydown', (evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault();
                    abrirArtigo(artigo);
                }
            });

            cartao.appendChild(titulo);
            cartao.appendChild(resumo);
            cartao.appendChild(categoria);

            listaArtigos.appendChild(cartao);
        });

        // Calcula quantas páginas existem
        const totalPaginas = Math.ceil(
            dados.total / LIMITE_POR_PAGINA
        );

        criarPaginacao(totalPaginas);

    } catch (erro) {

        console.error('Erro na pesquisa:', erro);

        mensagemStatus.textContent =
            'Não foi possível realizar a pesquisa. Tente novamente.';
    }
}

// Cria os controles numéricos da paginação
function criarPaginacao(totalPaginas) {

    paginacao.innerHTML = '';

    if (totalPaginas <= 1) {
        return;
    }

    // Botão anterior
    const anterior = document.createElement('button');
    anterior.textContent = '‹ Anterior';
    anterior.disabled = paginaAtual === 1;

    anterior.addEventListener('click', () => {
        paginaAtual--;
        pesquisarArtigos();
    });

    paginacao.appendChild(anterior);

    // Exibe até cinco números de páginas
    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, inicio + 4);

    inicio = Math.max(1, fim - 4);

    for (let numero = inicio; numero <= fim; numero++) {

        const botao = document.createElement('button');

        botao.textContent = numero;

        if (numero === paginaAtual) {
            botao.classList.add('pagina-ativa');
            botao.disabled = true;
        }

        botao.addEventListener('click', () => {
            paginaAtual = numero;
            pesquisarArtigos();
        });

        paginacao.appendChild(botao);
    }

    // Botão próximo
    const proximo = document.createElement('button');
    proximo.textContent = 'Próxima ›';
    proximo.disabled = paginaAtual === totalPaginas;

    proximo.addEventListener('click', () => {
        paginaAtual++;
        pesquisarArtigos();
    });

    paginacao.appendChild(proximo);

    // Informação sobre a página atual
    const informacao = document.createElement('span');

    informacao.textContent =
        `Página ${paginaAtual} de ${totalPaginas}`;

    paginacao.appendChild(informacao);
}

// Abre a janela e apresenta o artigo completo

async function abrirArtigo(artigo) {
    
    detalhesArtigo.innerHTML = '';

    modalArtigo.showModal();

    const carregamento = document.createElement('p');
    carregamento.textContent = 'Carregando artigo...';
    detalhesArtigo.appendChild(carregamento);

    try {

        const resposta = await fetch(`/api/artigos/${artigo.id}`);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao carregar artigo.');
        }

        detalhesArtigo.innerHTML = '';

        const titulo = document.createElement('h2');
        titulo.classList.add('detalhe-titulo');
        titulo.textContent = dados.titulo;

        const resumo = document.createElement('p');
        resumo.classList.add('detalhe-resumo');
        resumo.textContent = dados.resumo || 'Resumo não disponível.';

        const metadados = document.createElement('div');
        metadados.classList.add('detalhe-metadados');

        adicionarMetadados(metadados, dados.autores);
        adicionarMetadados(metadados, dados.categorias);
        adicionarMetadados(metadados, dados.tags);

        const conteudo = document.createElement('div');
        conteudo.classList.add('detalhe-conteudo');

        renderizarMarkdown(
            dados.conteudo || 'Conteúdo não disponível.',
            conteudo
        );

        detalhesArtigo.appendChild(titulo);
        detalhesArtigo.appendChild(resumo);
        detalhesArtigo.appendChild(metadados);
        detalhesArtigo.appendChild(conteudo);

        // Carrega os artigos relacionados
        carregarArtigosRelacionados(dados.id);

    } catch (erro) {

        console.error('Erro ao abrir artigo:', erro);

        detalhesArtigo.innerHTML = '';

        const mensagem = document.createElement('p');
        mensagem.textContent = 'Não foi possível carregar o artigo.';

        detalhesArtigo.appendChild(mensagem);
    }
}


// Adiciona autores, categorias e tags
function adicionarMetadados(elemento, valores) {

    if (!Array.isArray(valores) || valores.length === 0) {
        return;
    }

    valores.forEach((valor) => {

        const etiqueta = document.createElement('span');

        etiqueta.textContent =
            typeof valor === 'object' && valor !== null
                ? valor.nome
                : valor;

        elemento.appendChild(etiqueta);
    });
}


// Busca e apresenta os artigos relacionados
async function carregarArtigosRelacionados(idArtigo) {

    const secao = document.createElement('section');
    secao.classList.add('secao-relacionados');

    const titulo = document.createElement('h3');
    titulo.textContent = 'Artigos relacionados';

    const lista = document.createElement('div');
    lista.classList.add('lista-relacionados');

    const carregamento = document.createElement('p');
    carregamento.textContent = 'Buscando artigos relacionados...';

    secao.appendChild(titulo);
    secao.appendChild(carregamento);
    secao.appendChild(lista);

    detalhesArtigo.appendChild(secao);

    try {

        const resposta = await fetch(
            `/api/busca/${idArtigo}/relacionados`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao buscar relacionados.');
        }

        carregamento.remove();

        if (dados.resultados.length === 0) {

            const mensagem = document.createElement('p');
            mensagem.textContent = 'Nenhum artigo relacionado encontrado.';

            secao.appendChild(mensagem);
            return;
        }

        dados.resultados.forEach((artigo) => {

            const cartao = document.createElement('article');
            cartao.classList.add('artigo-relacionado');

            const tituloArtigo = document.createElement('h4');
            tituloArtigo.textContent = artigo.titulo;

            const resumo = document.createElement('p');
            resumo.textContent =
                artigo.resumo || 'Resumo não disponível.';

            const relevancia = document.createElement('span');
            relevancia.textContent =
                `Relevância: ${artigo.relevancia}`;

            cartao.appendChild(tituloArtigo);
            cartao.appendChild(resumo);
            cartao.appendChild(relevancia);

            cartao.style.cursor = 'pointer';
            cartao.setAttribute('role', 'button');
            cartao.setAttribute('tabindex', '0');

            cartao.addEventListener('click', () => {
                abrirArtigo(artigo);
            });

            cartao.addEventListener('keydown', (evento) => {

                if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault();
                    abrirArtigo(artigo);
                }
            });

            lista.appendChild(cartao);
        });

    } catch (erro) {

        console.error('Erro ao carregar relacionados:', erro);

        carregamento.textContent =
            'Não foi possível carregar os artigos relacionados.';
    }
}


// Fecha a janela pelo botão
fecharModal.addEventListener('click', () => {
    modalArtigo.close();
});


// Também permite fechar clicando fora da janela
modalArtigo.addEventListener('click', (evento) => {

    if (evento.target === modalArtigo) {
        modalArtigo.close();
    }
});


// Interpreta uma parte do Markdown e transforma em elementos HTML seguros
function renderizarMarkdown(texto, destino) {

    const linhas = texto.split('\n');

    let listaAtual = null;
    let blocoCodigo = false;
    let codigoAtual = [];

    linhas.forEach((linha) => {

        const textoLinha = linha.trim();

        // Identifica o início e o fim de um bloco de código
        if (textoLinha.startsWith('```')) {

            if (!blocoCodigo) {
                blocoCodigo = true;
                codigoAtual = [];
            } else {
                const pre = document.createElement('pre');
                const codigo = document.createElement('code');

                codigo.textContent = codigoAtual.join('\n');

                pre.appendChild(codigo);
                destino.appendChild(pre);

                blocoCodigo = false;
            }

            listaAtual = null;
            return;
        }

        // Guarda as linhas enquanto estiver dentro do código
        if (blocoCodigo) {
            codigoAtual.push(linha);
            return;
        }

        // Identifica títulos Markdown
        const titulo = textoLinha.match(/^(#{1,3})\s+(.+)$/);

        if (titulo) {
            listaAtual = null;

            const nivel = titulo[1].length;
            const elemento = document.createElement(`h${nivel + 2}`);

            elemento.appendChild(formatarTexto(titulo[2]));
            destino.appendChild(elemento);

            return;
        }

        // Identifica itens de lista
        const itemLista = textoLinha.match(/^[-*]\s+(.+)$/);

        if (itemLista) {

            if (!listaAtual) {
                listaAtual = document.createElement('ul');
                destino.appendChild(listaAtual);
            }

            const item = document.createElement('li');
            item.appendChild(formatarTexto(itemLista[1]));

            listaAtual.appendChild(item);

            return;
        }

        listaAtual = null;

        // Ignora linhas vazias
        if (!textoLinha) {
            return;
        }

        // Cria parágrafos
        const paragrafo = document.createElement('p');
        paragrafo.appendChild(formatarTexto(textoLinha));

        destino.appendChild(paragrafo);
    });

    // Trata um bloco de código que eventualmente não foi fechado
    if (blocoCodigo && codigoAtual.length > 0) {

        const pre = document.createElement('pre');
        const codigo = document.createElement('code');

        codigo.textContent = codigoAtual.join('\n');

        pre.appendChild(codigo);
        destino.appendChild(pre);
    }
}

// Formata negrito, itálico e código em linha
function formatarTexto(texto) {

    const fragmento = document.createDocumentFragment();

    const padrao = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

    let posicao = 0;
    let resultado;

    while ((resultado = padrao.exec(texto)) !== null) {

        // Texto normal antes da formatação
        fragmento.appendChild(
            document.createTextNode(
                texto.slice(posicao, resultado.index)
            )
        );

        const valor = resultado[0];
        let elemento;

        if (valor.startsWith('**')) {
            elemento = document.createElement('strong');
            elemento.textContent = valor.slice(2, -2);

        } else if (valor.startsWith('`')) {
            elemento = document.createElement('code');
            elemento.textContent = valor.slice(1, -1);

        } else {
            elemento = document.createElement('em');
            elemento.textContent = valor.slice(1, -1);
        }

        fragmento.appendChild(elemento);

        posicao = padrao.lastIndex;
    }

    // Texto restante
    fragmento.appendChild(
        document.createTextNode(texto.slice(posicao))
    );

    return fragmento;
}

