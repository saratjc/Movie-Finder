const UI = {};

(function () {
  const grid = document.getElementById("movieGrid");
  const cardTemplate = document.getElementById("cardTemplate");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const emptyState = document.getElementById("emptyState");
  const noFavoritesState = document.getElementById("noFavoritesState");
  const errorText = document.getElementById("errorText");
  const pagination = document.getElementById("pagination");

  function posterUrl(path, size) {
    size = size || CONFIG.TMDB_IMAGE_BASE;
    return path ? size + path : CONFIG.PLACEHOLDER_POSTER;
  }

  function formatYear(dateStr) {
    return dateStr ? dateStr.slice(0, 4) : "—";
  }

  function formatRating(vote) {
    return vote ? vote.toFixed(1) : "—";
  }

  function clearGrid() {
    grid.innerHTML = "";
  }

  //loading, erro, vazio, sem favoritos
  function showState(opcoes) {
    opcoes = opcoes || {};
    loadingState.hidden = !opcoes.loading;
    errorState.hidden = !opcoes.error;
    emptyState.hidden = !opcoes.empty;
    noFavoritesState.hidden = !opcoes.noFavorites;
  }

  function setError(mensagem) {
    errorText.textContent = mensagem || "Não foi possível carregar os filmes agora. Tente novamente.";
  }

  function setPaginationVisible(visivel) {
    pagination.hidden = !visivel;
  }

  const statFavorites = document.getElementById("profileFavCount");
  const statGenre = document.getElementById("profileGenre");
  const statAverage = document.getElementById("profileAvg");

  //(qtd favoritos, genero preferido, media de nota)
  function updateProfileStats(genreNames) {
    genreNames = genreNames || new Map();
    const favoritos = Favorites.getAll();

    statFavorites.textContent = favoritos.length;

    if (favoritos.length === 0) {
      statGenre.textContent = "—";
      statAverage.textContent = "—";
      return;
    }

    const contagemGeneros = new Map();
    favoritos.forEach(function (movie) {
      const generos = movie.genre_ids || [];
      generos.forEach(function (id) {
        contagemGeneros.set(id, (contagemGeneros.get(id) || 0) + 1);
      });
    });

    let topGeneroId = null;
    let topContagem = 0;
    contagemGeneros.forEach(function (qtd, id) {
      if (qtd > topContagem) {
        topContagem = qtd;
        topGeneroId = id;
      }
    });

    statGenre.textContent = topGeneroId !== null ? genreNames.get(topGeneroId) || "—" : "—";

    const notasValidas = favoritos.filter(function (m) {
      return m.vote_average;
    }).map(function (m) {
      return m.vote_average;
    });

    let media = 0;
    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce(function (total, v) {
        return total + v;
      }, 0);
      media = soma / notasValidas.length;
    }

    statAverage.textContent = media ? media.toFixed(1) : "—";
  }

  function renderMovies(movies, opcoes) {
    opcoes = opcoes || {};
    const target = opcoes.targetGrid || grid;

    if (!opcoes.append) {
      target.innerHTML = "";
    }

    const fragment = document.createDocumentFragment();

    movies.forEach(function (movie) {
      const node = cardTemplate.content.cloneNode(true);
      const card = node.querySelector(".movie-card");
      const img = node.querySelector(".poster");
      const badge = node.querySelector(".rating-badge");
      const title = node.querySelector(".card-title");
      const meta = node.querySelector(".card-meta");
      const favBtn = node.querySelector(".fav-btn");

      card.dataset.id = movie.id;
      img.src = posterUrl(movie.poster_path);
      img.alt = "Pôster de " + movie.title;
      badge.textContent = formatRating(movie.vote_average);
      title.textContent = movie.title;
      meta.textContent = formatYear(movie.release_date);

      const isFav = Favorites.isFavorite(movie.id);
      favBtn.setAttribute("aria-pressed", String(isFav));
      favBtn.dataset.id = movie.id;

      fragment.appendChild(node);
    });

    target.appendChild(fragment);
  }

  // atualiza o coraçãozinho
  function setFavButtonState(movieId, isFav) {
    const seletor = '.fav-btn[data-id="' + movieId + '"], .modal-fav[data-id="' + movieId + '"]';
    document.querySelectorAll(seletor).forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(isFav));
    });
  }

  const reviewsSection = document.getElementById("reviewsSection");
  const reviewsList = document.getElementById("reviewsList");
  const reviewsLoading = document.getElementById("reviewsLoading");
  const reviewsEmpty = document.getElementById("reviewsEmpty");
  const reviewTemplate = document.getElementById("reviewTemplate");

  function avatarUrl(path) {
    if (!path) return null;
    if (path.startsWith("/http")) return decodeURIComponent(path.slice(1));
    return "https://image.tmdb.org/t/p/w45" + path;
  }

  function truncate(text, max) {
    max = max || 220;
    if (!text) return "Sem comentário adicional.";
    return text.length > max ? text.slice(0, max).trim() + "…" : text;
  }

  function setReviewsSectionVisible(visivel) {
    if (reviewsSection) reviewsSection.hidden = !visivel;
  }

  function setReviewsState(opcoes) {
    opcoes = opcoes || {};
    reviewsLoading.hidden = !opcoes.loading;
    reviewsEmpty.hidden = !opcoes.empty;
  }

  function renderReviews(reviews) {
    reviewsList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    reviews.forEach(function (review) {
      const node = reviewTemplate.content.cloneNode(true);
      const avatarEl = node.querySelector(".review-avatar");
      const author = node.querySelector(".review-author");
      const movieName = node.querySelector(".review-movie");
      const ratingWrap = node.querySelector(".review-rating");
      const ratingValue = node.querySelector(".review-rating-value");
      const content = node.querySelector(".review-content");

      author.textContent = review.author || "Anônimo";
      movieName.textContent = review.movieTitle || "";
      content.textContent = truncate(review.content);

      const url = avatarUrl(review.avatar_path);
      if (url) {
        avatarEl.innerHTML = '<img src="' + url + '" alt="" loading="lazy" />';
      }

      const rating = review.author_details ? review.author_details.rating : null;
      if (rating) {
        ratingValue.textContent = rating;
      } else if (ratingWrap) {
        ratingWrap.hidden = true;
      }

      fragment.appendChild(node);
    });

    reviewsList.appendChild(fragment);
  }

  const modalOverlay = document.getElementById("modalOverlay");
  const modalBody = document.getElementById("modalBody");

  function renderModal(movie) {
    const isFav = Favorites.isFavorite(movie.id);
    const generosArr = movie.genres || [];
    const genres = generosArr.map(function (g) { return g.name; }).join(" · ") || "Gênero não informado";
    const runtime = movie.runtime ? movie.runtime + " min" : "Duração não informada";

    modalBody.innerHTML = `
      <div class="modal-hero">
        <img class="modal-poster" src="${posterUrl(movie.poster_path, CONFIG.TMDB_IMAGE_BASE_LG)}" alt="Pôster de ${movie.title}" />
        <div>
          <h2 class="modal-title" id="modalTitle">${movie.title}</h2>
          ${movie.tagline ? `<p class="modal-tagline">"${movie.tagline}"</p>` : ""}
          <div class="modal-meta-row">
            <span class="meta-pill meta-pill--rating"><i class="fa-solid fa-star"></i> ${formatRating(movie.vote_average)}</span>
            <span class="meta-pill">${formatYear(movie.release_date)}</span>
            <span class="meta-pill">${runtime}</span>
          </div>
          <button class="modal-fav" data-id="${movie.id}" aria-pressed="${isFav}" type="button">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3.5l2.6 5.5 6 .6-4.5 4.1 1.3 6-5.4-3-5.4 3 1.3-6-4.5-4.1 6-.6z" fill="currentColor"/></svg>
            <span class="modal-fav-label">${isFav ? "Nos favoritos" : "Adicionar aos favoritos"}</span>
          </button>
        </div>
      </div>
      <div class="modal-section">
        <h3>Gêneros</h3>
        <p>${genres}</p>
      </div>
      <div class="modal-section">
        <h3>Sinopse</h3>
        <p>${movie.overview || "Sinopse não disponível para este título."}</p>
      </div>
    `;

    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.hidden = true;
    modalBody.innerHTML = "";
    document.body.style.overflow = "";
  }

  function renderGenreChips(genres, onSelect) {
    const container = document.getElementById("genreChips");
    container.innerHTML = "";

    genres.forEach(function (genre) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = genre.name;
      chip.dataset.id = genre.id;
      chip.addEventListener("click", function () {
        onSelect(genre, chip);
      });
      container.appendChild(chip);
    });
  }

  function setActiveChip(chipEl) {
    document.querySelectorAll(".chip").forEach(function (c) {
      c.classList.remove("is-active");
    });
    if (chipEl) chipEl.classList.add("is-active");
  }

  UI.renderMovies = renderMovies;
  UI.clearGrid = clearGrid;
  UI.showState = showState;
  UI.setError = setError;
  UI.setPaginationVisible = setPaginationVisible;
  UI.updateProfileStats = updateProfileStats;
  UI.setFavButtonState = setFavButtonState;
  UI.renderModal = renderModal;
  UI.closeModal = closeModal;
  UI.renderGenreChips = renderGenreChips;
  UI.setActiveChip = setActiveChip;
  UI.posterUrl = posterUrl;
  UI.setReviewsSectionVisible = setReviewsSectionVisible;
  UI.setReviewsState = setReviewsState;
  UI.renderReviews = renderReviews;
})();