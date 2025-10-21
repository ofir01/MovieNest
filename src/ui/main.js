import '../css/main.css';
import '../css/render.css';
import '../css/details.css';
import '../css/header.css';
import '../css/sidebarSearch.css';
import '../css/language.css';
import '../css/nextPage.css';
import '../css/submenu.css';
import '../css/loader.css';

import {
    API_languages, API_getList, api_search, api_by_genre, api_Popular, API_new_playing, API_top_rated, API_upcoming, API_tv_airing_today, API_tv_on_the_air
} from '../api/api.js';
import { initFavoriteData, setDarkMode, setLanguage, load_favorite, clearAllMyFavorites } from './favorite.js';
import { initGenres, createCategoryButtons, advancedSearch } from './moviesList.js';
import { renderMovies } from './render.js';

//האלמנטים
const homeLink = document.getElementById('homeLink');
const darkModeIcon = document.getElementById('darkModeIcon');
const language = document.getElementById('language');
const languageMenu = document.getElementById('languageMenu');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const favorite = document.getElementById('favorite');
const submenumovies = document.getElementById('submenumovies');//סרטים
const submenutv = document.getElementById('submenutv');//סדרות
const advanced_Search = document.getElementById("advancedSearch");
const searchGenresBtn = document.getElementById("searchGenresBtn");

const pagination = document.getElementById("pagination");
const nextBtn = document.getElementById("nextBtn");
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const numberBtns = document.querySelectorAll('.numberBtn');


const titelActive = document.getElementById('titelActive');
const resultsContainer = document.getElementById('results-container');
const results = document.getElementById('results');
const details = document.getElementById('details');
const status = document.getElementById('status');

export const ui = {
    titelActive,
    resultsContainer,
    results,
    details,
    status,
    pagination,
};

homeLink.addEventListener('click', () => {
    location.reload();//טעינת העמוד מחדש
})

//מוציאה את הכותרת
export function getActicTitel() {
    return { buttonsactive, moviesOrTV, genreHeading };
}
//מעדכנת את הכותרת
export function setActicTitel(setButtonsactive = null, setMoviesOrTV = null, setGenreHeading = null) {
    //תת קטגוריה בשביל הכפתורים להעברת עמוד
    if (setButtonsactive) {
        buttonsactive = setButtonsactive;
    }
    //הקטגוריה
    if (setMoviesOrTV) {
        moviesOrTV = setMoviesOrTV;
    }
    //הכתרת שתוצג למשתמש
    if (setGenreHeading) {
        genreHeading = setGenreHeading;
    }
}
let buttonsactive = 'news';//שולט על הקטגוריה שנבחרה ומציג לשרת
let moviesOrTV = 'tv'; //שולט אם להציג סרטים או סדרות, ברירת מחדל סרטים
let genreHeading = 'news';//שולט על הקטגוריה שנבחרה ומציג למשתמש
let page = 1;//העמוד שנמצאים בו
let totalPages = 10; // מספר העמודים הכולל 
let visibleBtns = 5; // כמות הכפתורים הנראים
createLanguages();//רשימת השפות
switchPage();
//רשימת כל הז'אנרים
const arr_genres = await API_getList();
const genreMap = Object.fromEntries(arr_genres.map(g => [g.id, g.name]));//מחזיק שמות לפי מספרים
//מחזיר את השם לפי המספר
export function getGenreNameById(id) {
    return genreMap[id] || null;
}
//===============================================================================================================================================
// ============  מצב מוחשך============
const FavoriteData = initFavoriteData();
darkModeIcon.addEventListener('click', () => {
    darkMode()
    // שמירת מצב הדארק מוד ב-localStorage
    if (document.body.classList.contains('dark-mode')) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
});

darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';
// בדיקה של מצב הדארק מוד בטעינת הדף
if (FavoriteData.settings.darkMode) {
    darkMode(FavoriteData.settings.darkMode);
}

//מצב מוחשך
function darkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';

}

//===============================================================================================================================================
//============בחירת השפה====================
//  פתיחה וסגירה של התפריט
language.addEventListener('click', (e) => {
    e.stopPropagation(); // מונע שהקליק על הכפתור ייסגר מיד
    languageMenu.classList.toggle('languageMenuShow');
});

// סגירה אם לוחצים מחוץ לתפריט
window.addEventListener('click', (e) => {
    if (!languageMenu.contains(e.target) && e.target !== language) {
        languageMenu.classList.remove('languageMenuShow');
    }

    // בודק אם הלחיצה הייתה בתוך אחד מהתפריטים או אחד האלמנטים הראשיים
    const clickedInside = Array.from(sidebarElements).some(item => item.contains(e.target));

    if (!clickedInside) {
        closeAllSubmenus(); // סוגר את כל התפריטים
    }
});

//רשימת השפות
async function createLanguages() {
    const languages = await API_languages();
    languages.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('language-item');
        li.id = item.iso_639_1;
        li.textContent = item.english_name;

        // בחירת שפה
        li.addEventListener("click", () => {
            const selectedLang = li.id;
            setLanguage(selectedLang);
            location.reload();//טעינת העמוד מחדש
        });

        languageMenu.appendChild(li);
    });
}



//===============================================================================================================================================
//========== אירועים לחיפוש ולסרטים פופולריים============

searchBtn.addEventListener('click', () => {
    searchMovies();
});
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

//הפעולה של החיפוש
async function searchMovies() {
    const query = searchInput.value.trim();
    //אם נמצאים במועדפים החיפוש ישמש להם
    if (buttonsactive == 'favorite') {
        let movies = load_favorite();
        if (query) {
            movies = movies.filter(m => m.title && m.title.includes(query));  // המרה למערך של הערכים
        }
        renderMovies(movies, 'delet');
    }
    else {
        const Input = await api_search(query);
        setActicTitel(null, ' ', ' ');

        renderMovies(Input);
        pagination.classList.add("hidden");
    }
    searchInput.value = '';
}
//==========================================================================================================================================
//===================התת תפריט=====================
await createCategoryButtons(submenumovies, 'movie');
initGenres(arr_genres, 'movie', submenumovies);

await createCategoryButtons(submenutv, 'tv');
initGenres(arr_genres, 'tv', submenutv);

//מאפס את הדפים ושולט על סרטים או סדרות
submenumovies.addEventListener('click', () => {
    page = 1;
    renderButtons();
    //console.log(page, moviesOrTV);
});
submenutv.addEventListener('click', () => {
    page = 1;
    renderButtons();
    //console.log(page, moviesOrTV);
});




//===============================================================================================================================================
//===============ארוע להצגת מועדפים=========================
favorite.addEventListener('click', () => {
    let movies = load_favorite();
    renderMovies(movies, 'delet');
    buttonsactive = 'favorite';
    clearAllMyFavorites();
});


//===============================================================================================================================================


// ============  חיפוש מתקדם ============
// יצירת תיבת סימון לכל הז'אנרים בסיידבר
advancedSearch(arr_genres, advanced_Search);

//מבצע את החיפוש המיוחד
searchGenresBtn.addEventListener("click", async () => {
    const selectedCheckboxes = Array.from(advanced_Search.querySelectorAll("input[type='checkbox']:checked"));//מחזיר מערך של התיבות שסומנו
    const valueArr = selectedCheckboxes.map(cb => Number(cb.value));
    const selected = valueArr.join(",");//כל מה שסומן יתחבר למחרוזת אחת

    const selectedRadio = document.querySelector('input[name="mainCategory"]:checked');//כפתור הרדיו שנבחר

    //אם לא נבחרה אף קטגוריה
    if (!selected) {
        alert("בחר לפחות קטגוריה אחת, ");
        return;
    }
    const genreNames = valueArr.map(id => getGenreNameById(Number(id))).filter(Boolean);//מחזיר בשמות את המספרים של הקטגוריות
    //console.log(genreNames);
    buttonsactive = selected;//המספרים בשביל השרת
    genreHeading = genreNames.join(', ');//השם שיוצג למשתמש
    moviesOrTV = selectedRadio.value;
    selectedCheckboxes.forEach(cb => cb.checked = false);//ניקוי כל התיבות המסומנות
    const genre = await api_by_genre(selected, moviesOrTV);
    renderMovies(genre);
});




//=================================================================================================================================================
// ============ עמוד הבא/הקודם ============

nextBtn.addEventListener("click", () => {
    page++;
    switchPage();
});


const prevBtn = document.getElementById("prevBtn");
prevBtn.addEventListener("click", () => {
    if (page > 1) {
        page--;
        switchPage();
    }
});

// פונקציה שמחליפה עמודים בהתאם לקטגוריה שנבחרה
async function switchPage() {
    console.log(buttonsactive, moviesOrTV);
    let data = '';
    if (buttonsactive == 'news') {
        const now_playing = await API_new_playing(page);
        data = now_playing.results;
        totalPages = now_playing.total_pages;
    }
    else if (buttonsactive == 'popular') {
        const Popular = await api_Popular(moviesOrTV, page);
        totalPages = Popular.total_pages;
        data = Popular.results;
    }
    else if (buttonsactive == 'topRated') {
        const top_rated = await API_top_rated(moviesOrTV, page);
        data = top_rated.results;
        totalPages = top_rated.total_pages;
    }
    else if (buttonsactive == 'upcoming') {
        if (moviesOrTV === 'tv') {
            const tv_airing_today = await API_tv_airing_today(page);
            data = tv_airing_today.results;
            totalPages = tv_airing_today.total_pages;
        } else {
            const upcoming = await API_upcoming(page);
            data = upcoming.results;
            totalPages = upcoming.total_pages;
        }
    }
    else {
        const genre = await api_by_genre(buttonsactive, moviesOrTV, page);
        data = genre;
        totalPages = 200;
    }
    
    renderMovies(data);
    renderButtons();

}

// מאזין לכפתורים
numberBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        page = parseInt(btn.textContent);
        renderButtons();
        switchPage(); // פונקציה שמעדכנת את התוכן
    });
});



function renderButtons() {
    // מציאת טווח הכפתורים שיוצגו, והכפתור הנוכחי במרכז
    let start = Math.max(1, page - Math.floor(visibleBtns / 2));
    let end = Math.min(totalPages, start + visibleBtns - 1);

    // התאמה אם אנחנו קרובים לסוף
    if (end - start + 1 < visibleBtns) {
        start = Math.max(1, end - visibleBtns + 1);
    }

    // עדכון הכפתורים, והסתרת אלו שלא בשימוש
    numberBtns.forEach((btn, i) => {
        let pageNum = start + i;
        if (pageNum <= totalPages) {
            btn.textContent = pageNum;
            btn.style.display = 'inline-block';
            btn.classList.toggle('active', pageNum == page);
        } else {
            btn.style.display = 'none';
        }
    });
}


//============================================================================================================

// הכפתור שפותח את התפריט הקטגוריות
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    // שינוי האייקון של הכפתור
    sidebar.classList.contains('active') ? toggleBtn.innerHTML = '&#10005;' : toggleBtn.innerHTML = '&#9776;'; // איקס לסגירה
});




//============================================================================================================
//=============התתי תפריטים===================
//אוסף של כל התתי תפריטים והחצים
const AllSubmenuContainer = document.querySelectorAll('.submenu-container');//התתי תפריטים
const Allarrow = document.querySelectorAll('.arrow');//החצים
const sidebarElements = document.querySelectorAll('.sidebarElement');//הקטגוריה בתפריט הראשי

sidebarElements.forEach(item => {
    item.addEventListener('click', (e) => {
        // אם הלחיצה הייתה בתוך אחד התתי-תפריטים — אל תעשה כלום
        for (const submenu of AllSubmenuContainer) {
            if (submenu.contains(e.target)) return;
        }

        //התתי אלמנטים שבתוכו
        const isActive = item.classList.contains('sidebarActive');
        const arrow = item.querySelector('.arrow');
        const submenuContainer = item.querySelector('.submenu-container');//התת תפריט שלו


        //פעולה שמסירה את כל העיצובים מקטגוריות אחרות בתפריט הראשי
        closeAllSubmenus();
        item.classList.add('sidebarActive');//משאיר את הצבע בקטגוריה שנבחרה


        //אם יש לו תת תפריט נפתח אותו
        if (arrow && submenuContainer) {
            arrow.classList.add('open');
            submenuContainer.classList.add('open');
        }

        //רק אם מדובר בתפריט שכבר פתוח ונלחץ שוב, אז נסגור אותו ואת הצבע
        if (isActive && arrow && submenuContainer) {
            arrow.classList.remove('open');
            submenuContainer.classList.remove('open');
            item.classList.remove('sidebarActive');
        }
    })
});


// סגירת הרקע וכל התפריטים והתת־תפריטים
function closeAllSubmenus() {
    AllSubmenuContainer.forEach(sub => sub.classList.remove('open'));
    Allarrow.forEach(a => a.classList.remove('open'));
    sidebarElements.forEach(item => item.classList.remove('sidebarActive'));
}

