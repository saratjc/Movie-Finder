(function () {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalBody = document.getElementById("modalBody");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const retryBtn = document.getElementById("retryBtn");
  const sectionTitle = document.getElementById("sectionTitle");
  const sectionSub = document.getElementById("sectionSub");
  const tabs = document.querySelectorAll(".tab");
  const homeView = document.getElementById("homeView");
  const profileView = document.getElementById("profileView");
  const profileFavGrid = document.getElementById("profileFavGrid");
  const profileName = document.getElementById("profileName");
  const profileBio = document.getElementById("profileBio");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const profileNameInput = document.getElementById("profileNameInput");
  const profileBioInput = document.getElementById("profileBioInput");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const cancelProfileBtn = document.getElementById("cancelProfileBtn");
  const profileEditModal = document.getElementById("profileEditModal");
  const profileEditModalClose = document.getElementById("profileEditModalClose");
  const themeToggle = document.getElementById("themeToggle");

  let state = {
    mode: "popular", 
    query: "",
    genre: null,
    page: 1,
    totalPages: 1,
  };

  let debounceTimer = null;
  let genreNameMap = new Map(); 

  async function loadMovies(opcoes) {
    opcoes = opcoes || {};
    const append = opcoes.append || false;

    UI.setPaginationVisible(false);

    if (!append) {
      UI.showState({ loading: true });
    }

    try {
      let data;

      if (state.mode === "search") {
        data = await Api.searchMovies(state.query, state.page);
      } else if (state.mode === "genre") {
        data = await Api.discoverByGenre(state.genre, state.page);
      } else {
        data = await Api.getPopular(state.page);
      }

      state.totalPages = data.total_pages || 1;

      if (!data.results || data.results.length === 0) {
        UI.showState({ empty: true });
        UI.setError();
        return;
      }

      UI.showState({});
      UI.renderMovies(data.results, { append: append });
      UI.setPaginationVisible(state.page < state.totalPages);
    } catch (err) {
      // deu ruim, mostra o estado de erro pro usuario
      console.error(err);
      UI.showState({ error: true });
      UI.setError("Não foi possível carregar os filmes agora. Verifique sua conexão ou a chave da API em js/config.js.");
    }
  }

  function refresh() {
    state.page = 1;
    loadMovies();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
      });
      tab.classList.add("is-active");
      goToTab(tab.dataset.nav);
    });
  });

  function goToTab(target) {
    if (target === "profile") {
      homeView.hidden = true;
      profileView.hidden = false;
      renderProfilePage();
    } else {
      profileView.hidden = true;
      homeView.hidden = false;
    }
  }

  function setHomeTabActive() {
    tabs.forEach(function (t) {
      t.classList.toggle("is-active", t.dataset.nav === "home");
    });
    goToTab("home");
  }

  searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    const value = searchInput.value.trim();

    debounceTimer = setTimeout(function () {
      setHomeTabActive();

      if (value === "") {
        state.mode = "popular";
        sectionTitle.textContent = "Em cartaz agora";
        sectionSub.textContent = "Os mais populares do momento";
      } else {
        state.mode = "search";
        state.query = value;
        state.genre = null;
        UI.setActiveChip(null);
        sectionTitle.textContent = 'Resultados para "' + value + '"';
        sectionSub.textContent = "Toque em um cartaz para ver os detalhes";
      }

      refresh();
    }, 400);
  });

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearTimeout(debounceTimer);

    const value = searchInput.value.trim();
    if (!value) return;

    setHomeTabActive();
    state.mode = "search";
    state.query = value;
    state.genre = null;
    UI.setActiveChip(null);
    sectionTitle.textContent = 'Resultados para "' + value + '"';
    sectionSub.textContent = "Toque em um cartaz para ver os detalhes";

    refresh();
  });

  // carregar os genreos
  async function initGenres() {
    try {
      const data = await Api.getGenres();
      const genres = data.genres || [];

      genreNameMap = new Map(genres.map(function (g) { return [g.id, g.name]; }));

      UI.renderGenreChips(genres, function (genre, chipEl) {
        searchInput.value = "";
        setHomeTabActive();
        UI.setActiveChip(chipEl);

        state.mode = "genre";
        state.genre = genre.id;
        state.query = "";

        sectionTitle.textContent = genre.name;
        sectionSub.textContent = "Filmes populares nesse gênero";

        refresh();
      });
    } catch (err) {
      console.error("Não foi possível carregar os gêneros:", err);
    }
  }

  async function loadReviews() {
    UI.setReviewsState({ loading: true });

    try {
      const popular = await Api.getPopular(1);
      const candidatos = (popular.results || []).slice(0, 6);
      const reviews = [];

      for (const movie of candidatos) {
        if (reviews.length >= 4) break; 

        try {
          const data = await Api.getMovieReviews(movie.id, 1);
          if (data.results && data.results.length > 0) {
            reviews.push(Object.assign({}, data.results[0], { movieTitle: movie.title }));
          }
        } catch (err) {
          console.error("Erro ao buscar resenhas de", movie.title, err);
        }
      }

      if (reviews.length === 0) {
        UI.setReviewsState({ empty: true });
        return;
      }

      UI.setReviewsState({});
      UI.renderReviews(reviews);
    } catch (err) {
      console.error(err);
      UI.setReviewsState({ empty: true });
    }
  }

  loadMoreBtn.addEventListener("click", function () {
    state.page += 1;
    loadMovies({ append: true });
  });

  retryBtn.addEventListener("click", function () {
    refresh();
  });

  document.addEventListener("click", async function (e) {
    const favBtn = e.target.closest(".fav-btn");
    if (!favBtn) return;

    const card = e.target.closest(".movie-card");
    if (!card) return;

    e.stopPropagation();

    const id = Number(favBtn.dataset.id);

    const movie = findMovieInGrid(card) || (await Api.getMovieDetails(id));
    const nowFav = Favorites.toggle(movie);

    UI.setFavButtonState(id, nowFav);

    if (!profileView.hidden) {
      renderProfileFavorites();
      UI.updateProfileStats(genreNameMap);
    }
  });

  document.addEventListener("click", function (e) {
    const favBtn = e.target.closest(".fav-btn");
    const card = e.target.closest(".movie-card");

    if (favBtn || !card) return;

    openMovieModal(Number(card.dataset.id));
  });

  function findMovieInGrid(card) {
    if (!card) return null;

    const img = card.querySelector(".poster");
    const title = card.querySelector(".card-title");
    const badge = card.querySelector(".rating-badge");
    const meta = card.querySelector(".card-meta");

    let poster = null;
    const src = img ? img.getAttribute("src") : "";
    if (src && !src.includes("placehold")) {
      poster = src.split("/").pop();
    }

    let releaseDate = "";
    if (meta && meta.textContent && meta.textContent !== "—") {
      releaseDate = meta.textContent + "-01-01";
    }

    return {
      id: Number(card.dataset.id),
      title: title ? title.textContent : "",
      poster_path: poster,
      vote_average: parseFloat(badge ? badge.textContent : "") || 0,
      release_date: releaseDate,
    };
  }

  async function openMovieModal(movieId) {
    modalOverlay.hidden = false;

    modalBody.innerHTML =
      '<div class="state state--loading" style="padding:60px 20px;"><div class="reel"></div><p>Carregando detalhes…</p></div>';

    document.body.style.overflow = "hidden";

    try {
      const movie = await Api.getMovieDetails(movieId);
      UI.renderModal(movie);
    } catch (err) {
      console.error(err);
      modalBody.innerHTML =
        '<div class="state state--error" style="padding:60px 20px;"><p class="state-title">Não foi possível carregar os detalhes.</p></div>';
    }
  }

  modalBody.addEventListener("click", function (e) {
    const btn = e.target.closest(".modal-fav");
    if (!btn) return;

    const id = Number(btn.dataset.id);

    Api.getMovieDetails(id).then(function (movie) {
      const nowFav = Favorites.toggle(movie);
      UI.setFavButtonState(id, nowFav);

      const label = btn.querySelector(".modal-fav-label");
      if (label) {
        label.textContent = nowFav ? "Nos favoritos" : "Adicionar aos favoritos";
      }

      if (!profileView.hidden) {
        renderProfileFavorites();
        UI.updateProfileStats(genreNameMap);
      }
    });
  });

  modalClose.addEventListener("click", UI.closeModal);

  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      UI.closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.hidden) {
      UI.closeModal();
    }
  });

  function renderProfileFavorites() {
    const favoritos = Favorites.getAll();

    if (favoritos.length === 0) {
      UI.showState({ noFavorites: true });
      profileFavGrid.innerHTML = "";
      return;
    }

    UI.showState({});
    UI.renderMovies(favoritos, { targetGrid: profileFavGrid });
  }

  function renderProfilePage() {
    profileName.textContent = Profile.getName();
    profileBio.textContent = Profile.getBio();
    renderProfileFavorites();
    UI.updateProfileStats(genreNameMap);
  }

  function openProfileEditModal() {
    profileNameInput.value = Profile.getName();
    profileBioInput.value = Profile.getBio();
    profileEditModal.hidden = false;
    document.body.style.overflow = "hidden";
    profileNameInput.focus();
  }

  function closeProfileEditModal() {
    profileEditModal.hidden = true;
    document.body.style.overflow = "";
  }

  editProfileBtn.addEventListener("click", openProfileEditModal);
  profileEditModalClose.addEventListener("click", closeProfileEditModal);
  cancelProfileBtn.addEventListener("click", closeProfileEditModal);

  profileEditModal.addEventListener("click", function (e) {
    if (e.target === profileEditModal) {
      closeProfileEditModal();
    }
  });

  saveProfileBtn.addEventListener("click", function () {
    const name = profileNameInput.value.trim();
    const bio = profileBioInput.value.trim();

    Profile.saveProfile(name, bio);

    profileName.textContent = Profile.getName();
    profileBio.textContent = Profile.getBio();

    closeProfileEditModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !profileEditModal.hidden) {
      closeProfileEditModal();
    }
  });

  function syncThemeToggle() {
    const isDark = Profile.getTheme() === "dark";
    themeToggle.setAttribute("aria-checked", String(isDark));
  }

  themeToggle.addEventListener("click", function () {
    const isDarkNow = themeToggle.getAttribute("aria-checked") === "true";
    const nextTheme = isDarkNow ? "light" : "dark";

    Profile.saveTheme(nextTheme);
    Profile.applyTheme(nextTheme);
    syncThemeToggle();
  });

  function init() {
    Profile.applyTheme(Profile.getTheme());
    syncThemeToggle();

    initGenres();
    loadMovies();
    loadReviews();
  }

  init();
})();