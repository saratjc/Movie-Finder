# 🎬 Movie Finder

Catálogo de filmes com busca em tempo real, grid responsivo, modal de detalhes, resenhas em destaque e uma aba de Perfil com favoritos e tema claro/escuro — consumindo a API pública do [TMDB](https://www.themoviedb.org/).

## Estrutura do projeto

```
movie-finder/
├── index.html          # Estrutura da página (header, hero/busca, grid, aba Perfil, modal)
├── css/
│   └── style.css        # Design system completo (tokens, tema claro/escuro, componentes, responsivo)
├── js/
│   ├── config.js         # Chave da API e constantes (edite aqui!)
│   ├── api.js              # Camada de comunicação com o TMDB (fetch)
│   ├── favorites.js         # Lógica de favoritos (persistência em localStorage)
│   ├── profile.js            # Nome/bio do usuário e preferência de tema (localStorage)
│   ├── ui.js                   # Renderização de cards, modal, perfil e estados da tela
│   └── main.js                   # Orquestra eventos: busca, filtros, paginação, modal, abas
├── assets/
│   └── favicon.svg       # Ícone da aba do navegador
└── README.md
```

Separação de responsabilidades:
- **api.js** não toca no DOM — só busca dados.
- **ui.js** não faz fetch — só renderiza o que recebe.
- **favorites.js** e **profile.js** só cuidam do localStorage.
- **main.js** é o único que conhece todos os módulos e liga os eventos.

## Como rodar

1. Crie uma conta gratuita em https://www.themoviedb.org/ e gere uma chave de API (v3 auth) em **Configurações → API**.
2. Abra `js/config.js` e troque `"SUA_CHAVE_AQUI"` pela sua chave.
3. Abra `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

Não precisa de build, bundler ou instalação de dependências — é HTML/CSS/JS puro.

## Funcionalidades

- 🔎 Busca em tempo real (debounce de 400ms) por título
- 🎭 Filtro por gênero (chips dinâmicos, carregados da própria API)
- 🖼️ Grid responsivo de cards com pôster, nota e ano
- 🪟 Modal com sinopse, gêneros, duração e nota completa
- 💬 Seção de resenhas em destaque na aba Início
- ⭐ Favoritar/desfavoritar filmes direto no card ou no modal
- 👤 Aba **Perfil** dedicada, com:
  - Cartão de usuário (nome e bio editáveis)
  - Estatísticas (nº de favoritos, gênero favorito, nota média)
  - Alternância de tema claro/escuro (persistida no localStorage)
  - Grid de favoritos
- ♻️ Paginação por "carregar mais" na aba Início
- ⌨️ Acessibilidade: foco visível, `aria-pressed`/`role="switch"`, modal fecha com `Esc`, `prefers-reduced-motion` respeitado

## Próximos passos sugeridos

- Trocar `/movie/popular` por `/trending/movie/week` para uma seção "em alta"
- Adicionar abas para Séries (`/tv/...`) além de Filmes
- Permitir upload de foto real no avatar do perfil (hoje é um ícone)
- Adicionar loading skeleton nos cards em vez do spinner central
- Deploy no GitHub Pages (o projeto é 100% estático)

## Identidade visual

Tema "cinema de bairro à noite": fundo grafite quase preto, dourado de marquise (`#C9A227`) como cor de destaque principal e bordô de veludo (`#6E2439`) como acento secundário. No tema claro ("sessão da tarde"), a paleta vira creme/marfim mantendo os mesmos acentos. Tipografia combina **Fraunces** (serifada, dramática, para títulos) com **Work Sans** (para textos e interface). O elemento de assinatura é a "fita de filme" (sprocket holes) usada com moderação no topo e como divisor.