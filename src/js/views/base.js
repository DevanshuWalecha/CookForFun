/* 
* The sole purpose of base.js is to contain all the DOM elements we require in our app at one place in one variable
* which we then export to other parts of the app.
* It also contains some resuable stuff like loading spinner that we require in other modules.
* This helps in preventing the maintenance nightmare if we ever to change our underlying markup.
*/
export const elements = {
    searchForm: document.querySelector('.search'),
    searchInput: document.querySelector('.search__field'),
    searchResultList: document.querySelector('.results__list'),
    searchRes: document.querySelector('.results'),
    searchResPages: document.querySelector('.results__pages'),
    recipe: document.querySelector('.recipe'),
    shopping: document.querySelector('.shopping__list'),
    likesMenu: document.querySelector('.likes__field'),
    likesList: document.querySelector('.likes__list')
};

export const elementStrings = {
    loader: 'loader'
}

// It renders the loading spinner in our page.
export const renderLoader = parent => {
    const loader = `
    <div class="${elementStrings.loader}">
        <svg>
            <use href="img/icons.svg#icon-cw"></use>
        </svg>
    </div>
    `;
    parent.insertAdjacentHTML('afterbegin', loader);
}

// It clears the loader after the search results arrive.
export const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`);
    if (loader)
        loader.parentElement.removeChild(loader);
}