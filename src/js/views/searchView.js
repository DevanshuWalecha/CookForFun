import { elements } from './base'

// It returns the value input into the search bar
export const getInput = () => elements.searchInput.value;

// It clears the input from the search bar
export const clearInput = () => {
    elements.searchInput.value = '';
};

// It clears the html in the search results 
export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

export const highlightedSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
}

/*
* Initially the rendered results have very long titles. So, we want a way to reduce the length of the title.
* But we don't want to chop a word in half. Either display a full word or dont display it rather display '...' .
* This function first splits the title of the recipe into array.
* Then using reduce method, it checks in each iteration whether length of acc + current word  is greater than limit or not.
* If not, then we add the word to a newTitle. and update the acc.
* Finally we return newTitle.
* If initially title lenght was already less than limit then, we return title itself.
*/
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}

// It takes the underlying markup for our search results and render it on our page
const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                        <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

// It creates a button with the underlying markup
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

// It calls createButton() to create buttons and then render them on the page.
const renderButtons = (page, numResults, resultsPerPage) => {
    const pages = Math.ceil(numResults / resultsPerPage);
    let button;

    if (page === 1 && pages > 1) {
        // Render only one Button to go to next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // Render buttons to go to next as well as prev page
        button = `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
        `;
    }
    else if (page === pages && pages > 1) {
        // Render only one button to go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

// It loops over all the recipes obtained for a search query and calls renderRecipe() to render them on page.
export const renderResults = (recipes, page = 1, resultsPerPage = 10) => {
    const start = (page - 1) * resultsPerPage;
    const end = page * resultsPerPage;

    // It slices number of results to put maximum of (end - start) number of results in one page.
    recipes.slice(start, end).forEach(renderRecipe);

    // render pagination buttons
    renderButtons(page, recipes.length, resultsPerPage);
};