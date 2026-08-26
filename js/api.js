const CONFIG = {
  TMDB_API_KEY: "bd52d331de19a6793a988c5015187dd8", 
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p/w500",
  TMDB_IMAGE_BASE_LG: "https://image.tmdb.org/t/p/w780",
  LANGUAGE: "pt-BR",
  PLACEHOLDER_POSTER: "https://placehold.co/500x750/1B181E/6E6675?text=Sem+p%C3%B4ster",
};

const Api = (() => {

  function buildUrl(path, params = {}) {
    const url = new URL(`${CONFIG.TMDB_BASE_URL}${path}`);
    url.searchParams.set("api_key", CONFIG.TMDB_API_KEY);
    url.searchParams.set("language", CONFIG.LANGUAGE);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  async function request(path, params) {
    const res = await fetch(buildUrl(path, params));
    if (!res.ok) {
      throw new Error(`Erro na API TMDB (status ${res.status})`);
    }
    return res.json();
  }

  function getPopular(page = 1) {
    return request("/movie/popular", { page });
  }

  function searchMovies(query, page = 1) {
    return request("/search/movie", { query, page });
  }

  function discoverByGenre(genreId, page = 1) {
    return request("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  }

  function getMovieDetails(movieId) {
    return request(`/movie/${movieId}`);
  }

  function getGenres() {
    return request("/genre/movie/list");
  }

  function getMovieReviews(movieId, page = 1) {
    return request(`/movie/${movieId}/reviews`, { page });
  }

  return {
    getPopular,
    searchMovies,
    discoverByGenre,
    getMovieDetails,
    getGenres,
    getMovieReviews,
  };
})();