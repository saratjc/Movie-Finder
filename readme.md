# Movie Finder

Catálogo de filmes com busca em tempo real, grid responsivo, modal de detalhes, resenhas em destaque e uma aba de Perfil com favoritos e tema claro/escuro, consumindo a API pública do [TMDB](https://www.themoviedb.org/).

## Como rodar

1. Crie uma conta gratuita em https://www.themoviedb.org/ e gere uma chave de API (v3 auth) em **Configurações → API**.
2. Abra `js/config.js` e troque `"SUA_CHAVE_AQUI"` pela sua chave.
3. Abra `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

## Funcionalidades

Busca em tempo real (debounce de 400ms) por título
Filtro por gênero (chips dinâmicos, carregados da própria API)
Grid responsivo de cards com pôster, nota e ano
Modal com sinopse, gêneros, duração e nota completa
eção de resenhas em destaque na aba Início
Favoritar/desfavoritar filmes direto no card ou no modal
Aba **Perfil** dedicada, com:
 Cartão de usuário (nome e bio editáveis)
 Estatísticas (nº de favoritos, gênero favorito, nota média)
 Alternância de tema claro/escuro (persistida no localStorage)
 Grid de favoritos

## Identidade visual

Tema "cinema de bairro à noite": fundo grafite quase preto, dourado de marquise (`#C9A227`) como cor de destaque principal e bordô de veludo (`#6E2439`) como acento secundário. No tema claro ("sessão da tarde"), a paleta vira creme/marfim mantendo os mesmos acentos. Tipografia combina **Fraunces** (serifada, dramática, para títulos) com **Work Sans** (para textos e interface). O elemento de assinatura é a "fita de filme" (sprocket holes) usada com moderação no topo e como divisor.