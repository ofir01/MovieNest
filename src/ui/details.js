import { api_similar, api_credits, api_search_by_actorId } from '../api/api.js';
import { initFavoriteData,saveMovies, deleteMovies } from './favorite.js';
import { renderMovies } from './render.js';
import noImagePlayer from '../image/no_image_player.png';
import noImageFilm from '../image/no_image_film.png';
import { ui } from './main.js';
import { showLoader } from './Loader.js';
import { getGenreNameById } from './main.js';

import { IMG_BASE, IMG_BASE2 } from '../api/api.js';






export async function renderMovieDetails(data) {
    ui.resultsContainer.classList.add("hidden");
    ui.details.innerHTML = '';
    ui.results.innerHTML = '';
    ui.status.innerHTML = '';
    await showLoader(ui.details);//האנימציה
    console.log(data);
    // אלמנט ראשי
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');

    // רקע אחורי עם שקיפות
    const background = document.createElement('div');
    background.classList.add('movie-background');
    background.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${data.backdrop_path})`;

    // תוכן קדמי
    const content = document.createElement('div');
    content.classList.add('movie-content');

    // תמונת פוסטר
    const posterWrapper = document.createElement('div');
    posterWrapper.classList.add('poster-wrapper');
    const poster = document.createElement('img');
    poster.classList.add('poster');
    poster.src = IMG_BASE2 + data.poster_path;
    poster.alt = data.title;
    posterWrapper.appendChild(poster);

    // פרטי הסרט
    const detailsWrapper = document.createElement('div');
    detailsWrapper.classList.add('details-wrapper');

    //כותרת הסרט
    const title = document.createElement('h2');
    title.textContent = data.title;

    //קטגורית הסרט
    const genre_ids = data.genre_ids;
    const genreNames = document.createElement('h3');
    genreNames.textContent = genre_ids.map(id => getGenreNameById(Number(id))).filter(Boolean);//מחזיר בשמות את המספרים של הקטגוריות

    const overviewTitle = document.createElement('h3');
    overviewTitle.textContent = 'תקציר:';

    const overview = document.createElement('p');
    overview.classList.add('overview');
    overview.textContent = data.overview;

    const info = document.createElement('p');
    info.classList.add('movie-info');
    info.textContent =
        `📅 יציאה: ${data.release_date} | ⭐ דירוג: ${data.vote_average}`;

    // כפתור מועדפים
    const favoriteBtn = document.createElement('button');
    favoriteBtn.classList.add('favorite-btn');

    let movies = initFavoriteData();
    favoriteBtn.textContent = movies.user.favorites[data.id] ? 'הסר ממועדפים' : 'הוסף למועדפים';
    favoriteBtn.addEventListener('click', () => {
        movies.user.favorites[data.id] ? deleteMovies(data.id) : saveMovies(data);
        movies = initFavoriteData();
        favoriteBtn.textContent = movies.user.favorites[data.id] ? 'הסר ממועדפים' : 'הוסף למועדפים';
    });





    const credits = await api_credits(data.id);//מחזיר את השחקנים
    //console.log(credits);

    const similar = await api_similar(data.id);//מחזיר את השחקנים
    //console.log(similar);

    //הכנסה לדף את החלק העליון
    detailsWrapper.appendChild(title);
    detailsWrapper.appendChild(genreNames);
    detailsWrapper.appendChild(overviewTitle);
    detailsWrapper.appendChild(overview);
    detailsWrapper.appendChild(info);
    detailsWrapper.appendChild(favoriteBtn);

    content.appendChild(posterWrapper);
    content.appendChild(detailsWrapper);

    movieContainer.appendChild(background);
    movieContainer.appendChild(content);

    ui.details.appendChild(movieContainer);

    //החלק התחתון
    const p_credits = document.createElement('p');
    p_credits.textContent = 'שחקנים בסרט';
    p_credits.classList.add('p_credits');
    ui.details.appendChild(p_credits);
    ui.details.appendChild(renderCast(credits.cast));

    const p_similar = document.createElement('p');
    p_similar.textContent = 'סרטים דומים';
    p_similar.classList.add('p_similar');
    ui.details.appendChild(p_similar);
    ui.details.appendChild(renderOtherMovies(similar.results));
}


//מחזיר שחקנים בסרט
function renderCast(castArray) {
    const container = document.createElement('div');
    container.classList.add("cast-container");

    const mainCast = castArray.slice(0, 5);//לוקח רק 5 שחקנים
    //console.log(mainCast[0]);

    mainCast.forEach(actor => {
        const div = document.createElement("div");

        const img = document.createElement("img");
        img.src = actor.profile_path ? IMG_BASE + actor.profile_path : noImagePlayer;
        img.alt = actor.name;

        img.addEventListener("click", async () => {
            const movies = await api_search_by_actorId(actor.id);
            renderMovies(movies);
        });

        const name = document.createElement("p");
        name.classList.add("movieTitle");

        name.textContent = `${actor.name} (${actor.original_name})`;

        const character = document.createElement("p");
        character.classList.add("movieTitle");

        character.textContent = actor.character;

        div.appendChild(img);
        div.appendChild(name);
        div.appendChild(character);

        container.appendChild(div);
    });
    return container;
}


//מחזיר סרטים דומים
function renderOtherMovies(moviesArray) {
    const container = document.createElement('div');
    container.classList.add("movies-container");

    const mainMovies = moviesArray.slice(0, 5); // לוקח רק 5 סרטים
    //console.log(mainMovies[0]);

    mainMovies.forEach(movie => {
        const div = document.createElement("div");

        const img = document.createElement("img");
        img.src = movie.poster_path ? IMG_BASE + movie.poster_path : noImageFilm;
        img.alt = movie.title;

        img.addEventListener("click", () => {
            renderMovieDetails(movie); // פעולה אחרת עם ה-ID
        });

        const span = document.createElement("span");
        span.classList.add("rating");
        span.textContent = "⭐ " + movie.popularity.toFixed(1); // ספרה אחת אחרי הנקודה


        const title = document.createElement("p");
        title.classList.add('movieTitle');
        title.textContent = movie.title + `(${movie.original_title})`;



        div.appendChild(img);
        div.appendChild(span);
        div.appendChild(title);

        container.appendChild(div);
    });
    return container;
}


















