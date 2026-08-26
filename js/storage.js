const Favorites = (() => {
  const STORAGE_KEY = "movieFinder:favorites";

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Não foi possível ler os favoritos:", err);
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Não foi possível salvar os favoritos:", err);
    }
  }

  function isFavorite(movieId) {
    return getAll().some((m) => m.id === movieId);
  }

  function toggle(movie) {
    const list = getAll();
    const exists = list.some((m) => m.id === movie.id);
    const updated = exists
      ? list.filter((m) => m.id !== movie.id)
      : [...list, minimal(movie)];
    save(updated);
    return !exists; 
  }

  function minimal(movie) {
    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids || (movie.genres ? movie.genres.map((g) => g.id) : []),
    };
  }

  function count() {
    return getAll().length;
  }

  return { getAll, isFavorite, toggle, count };
})();

const Profile = (() => {
  const NAME_KEY = "movieFinder:profileName";
  const BIO_KEY = "movieFinder:profileBio";
  const THEME_KEY = "movieFinder:theme"; // "dark" | "light"

  const DEFAULT_NAME = "Cinéfilo(a)";
  const DEFAULT_BIO = "Apaixonado(a) por cinema e boas histórias.";

  function getName() {
    return localStorage.getItem(NAME_KEY) || DEFAULT_NAME;
  }

  function getBio() {
    return localStorage.getItem(BIO_KEY) || DEFAULT_BIO;
  }

  function saveProfile(name, bio) {
    localStorage.setItem(NAME_KEY, name || DEFAULT_NAME);
    localStorage.setItem(BIO_KEY, bio || DEFAULT_BIO);
  }

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  return { getName, getBio, saveProfile, getTheme, saveTheme, applyTheme };
})();