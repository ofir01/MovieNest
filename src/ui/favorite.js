import { renderMovies } from './render.js';
import { ui } from './main.js';



//יצירת האובייקט נתונים של האתר
export function initFavoriteData() {
    let siteMovies = JSON.parse(localStorage.getItem("siteMovies")) || {
        settings: {
            darkMode: false,
            language: "he",
        },
        user: {
            favorites: {}, // נשמור כאובייקט לפי id
        },
    };
    localStorage.setItem("siteMovies", JSON.stringify(siteMovies));
    return siteMovies;
}

//שומר רקע מוחשך
export function setDarkMode(mode) {
    let siteMovies = initFavoriteData();
    siteMovies.settings.darkMode = mode;
    localStorage.setItem("siteMovies", JSON.stringify(siteMovies));
}

//משנה את השפה
export function setLanguage(mode) {
    console.log(mode);
    let siteMovies = initFavoriteData();
    siteMovies.settings.language = mode;
    localStorage.setItem("siteMovies", JSON.stringify(siteMovies));
}

//מחזיר את השפה
export function getCurrentLanguage() {
  const data = initFavoriteData();
  return data.settings.language;
}

//טעינת מועדפים
export function load_favorite() {
    let siteMovies = initFavoriteData();
    return siteMovies = Object.values(siteMovies.user.favorites); // המרה למערך של הערכים
}


//שמירת מועדף
export function saveMovies(data) {
    let siteMovies = initFavoriteData();
    siteMovies.user.favorites[data.id] = data;
    localStorage.setItem("siteMovies", JSON.stringify(siteMovies));
}

//הסרת מועדף
export function deleteMovies(id) {
    let siteMovies = initFavoriteData();
    delete siteMovies.user.favorites[id];
    localStorage.setItem("siteMovies", JSON.stringify(siteMovies));
}




//מנקה הכל
export function clearAllMyFavorites() {
    let siteMovies = load_favorite();
    // אם אין סרטים במועדפים, אל תיצור את הכפתור
    if (siteMovies.length === 0) {
        return;
    }
    const clearAllFavorites = document.createElement('button');
    clearAllFavorites.classList.add('clear');
    clearAllFavorites.textContent = 'נקה מועדפים';
    ui.results.appendChild(clearAllFavorites);

    clearAllFavorites.addEventListener('click', () => {
        localStorage.removeItem('siteMovies');
        siteMovies = load_favorite();
        renderMovies(siteMovies, 'delet');
    });
}
