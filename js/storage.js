// tudo que mexe com favoritos fica aqui blz
const Favorites = {
  STORAGE_KEY: "movieFinder:favorites",

  getFavorites: function () {
    try {
      const dados = localStorage.getItem(this.STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (err) {
      console.error("Não foi possível ler os favoritos:", err);
      return [];
    }
  },

  saveFavorites: function (lista) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lista));
    } catch (err) {
      console.error("Não foi possível salvar os favoritos:", err);
    }
  },

  isFavorite: function (movieId) {
    const lista = this.getFavorites();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id === movieId) return true;
    }
    return false;
  },

  // adiciona se não tiveremove se já tiver
  toggleFavorite: function (movie) {
    const lista = this.getFavorites();
    const jaTem = lista.some(function (m) {
      return m.id === movie.id;
    });

    let novaLista;
    if (jaTem) {
      novaLista = lista.filter(function (m) {
        return m.id !== movie.id;
      });
    } else {
      novaLista = lista.concat([this.minimal(movie)]);
    }

    this.saveFavorites(novaLista);
    return !jaTem; // true = acabou de favoritar false = acabou de tirar
  },

  minimal: function (movie) {
    let generos = movie.genre_ids || [];
    if (!movie.genre_ids && movie.genres) {
      generos = movie.genres.map(function (g) {
        return g.id;
      });
    }

    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      genre_ids: generos,
    };
  },

  count: function () {
    return this.getFavorites().length;
  },
};

// dados do perfil ne
const Profile = {
  NAME_KEY: "movieFinder:profileName",
  BIO_KEY: "movieFinder:profileBio",
  THEME_KEY: "movieFinder:theme", 

  DEFAULT_NAME: "Cinéfilo(a)",
  DEFAULT_BIO: "Apaixonado(a) por cinema e boas histórias.",

  getName: function () {
    return localStorage.getItem(this.NAME_KEY) || this.DEFAULT_NAME;
  },

  getBio: function () {
    return localStorage.getItem(this.BIO_KEY) || this.DEFAULT_BIO;
  },

  saveProfile: function (name, bio) {
    localStorage.setItem(this.NAME_KEY, name || this.DEFAULT_NAME);
    localStorage.setItem(this.BIO_KEY, bio || this.DEFAULT_BIO);
  },

  getTheme: function () {
    return localStorage.getItem(this.THEME_KEY) || "dark";
  },

  saveTheme: function (theme) {
    localStorage.setItem(this.THEME_KEY, theme);
  },

  applyTheme: function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  },
};