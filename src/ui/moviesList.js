

import { api_by_genre, api_Popular, API_top_rated, API_upcoming, API_tv_airing_today } from '../api/api.js';
import { renderMovies } from './render.js';
import { setActicTitel, getGenreNameById } from './main.js';



//יצירת הכפתורים של הז'אנרים
export function initGenres(arr_genres, moviesOrTV, genreContainer) {
    //console.log(arr_genres[0].id);
    //console.log(moviesOrTV);
    arr_genres.forEach(item => {
        const btn = document.createElement("button");
        btn.textContent = item.name; // טקסט הכפתור
        btn.classList.add('submenu-item');
        btn.id = item.id; // מזהה הז'אנר
        btn.addEventListener("click", async () => {
            //במסך קטן, הסגירה של התפריט לאחר בחירת ז'אנר 
            genreContainer.classList.toggle("open");


            //console.log(item.id);
            setActicTitel(item.id, moviesOrTV, getGenreNameById(item.id));

            const genre = await api_by_genre(item.id, moviesOrTV);
            renderMovies(genre);
        });
        genreContainer.appendChild(btn);
    });
}

// הפעולה ליצירת כפתורים נוספים- מדורג גבוה, בקרוב, פופלארי
export async function createCategoryButtons(container, titel) {
    const mediaGroups = {
        popular: await api_Popular(titel),
        topRated: await API_top_rated(titel),
        upcoming: titel !== 'tv' ? await API_upcoming() : await API_tv_airing_today()
    };

    // מעבר על כל המפתחות במערך ויצירת כפתורים
    Object.entries(mediaGroups).forEach(([key, data]) => {
        // יצירת כפתור
        const buttun = document.createElement('buttun');
        buttun.classList.add('submenu-item');
        buttun.textContent = key;


        // אירוע לחיצה לכל כפתור
        buttun.addEventListener('click', () => {
            container.classList.toggle("open");
            setActicTitel(key, titel, key);
            renderMovies(data);
        });
        container.appendChild(buttun);
    });
}





// חיפוש עמוק לסרטים לפי ז'אנר
export function advancedSearch(arr_genres, container) {
    arr_genres.forEach(item => {
        const label = document.createElement("label");
        label.classList.add('submenu-item');
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = item.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + item.name));
        container.appendChild(label);
    });
}