const CONFIG = {
  TMDB_API_KEY: "bd52d331de19a6793a988c5015187dd8",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p/w500",
  TMDB_IMAGE_BASE_LG: "https://image.tmdb.org/t/p/w780",
  LANGUAGE: "pt-BR",
  PLACEHOLDER_POSTER: "https://placehold.co/500x750/1B181E/6E6675?text=Sem+p%C3%B4ster",
};

function montarUrl(caminho, params) {
  params = params || {};
  const url = new URL(CONFIG.TMDB_BASE_URL + caminho);
  url.searchParams.set("api_key", CONFIG.TMDB_API_KEY);
  url.searchParams.set("language", CONFIG.LANGUAGE);

  for (const chave in params) {
    const valor = params[chave];
    if (valor !== undefined && valor !== null && valor !== "") {
      url.searchParams.set(chave, valor);
    }
  }

  return url.toString();
}

async function fazerRequisicao(caminho, params) {
  const resposta = await fetch(montarUrl(caminho, params));

  if (!resposta.ok) {
    throw new Error("Erro na API TMDB (status " + resposta.status + ")");
  }

  return resposta.json();
}

const Api = {
  getPopular: function (page) {
    return fazerRequisicao("/movie/popular", { page: page || 1 });
  },

  searchMovies: function (query, page) {
    return fazerRequisicao("/search/movie", { query: query, page: page || 1 });
  },

  discoverByGenre: function (genreId, page) {
    return fazerRequisicao("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page: page || 1,
    });
  },

  getMovieDetails: function (movieId) {
    return fazerRequisicao("/movie/" + movieId);
  },

  getGenres: function () {
    return fazerRequisicao("/genre/movie/list");
  },

  getMovieReviews: function (movieId, page) {
    return fazerRequisicao("/movie/" + movieId + "/reviews", { page: page || 1 });
  },
};