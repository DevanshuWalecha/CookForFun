import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import { elements, renderLoader, clearLoader } from './views/base'
import Likes from './models/Likes'


/**Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

/*
************************************************
SEARCH CONTROLLER
************************************************
*/


const controlSearch = async () => {
    // 1) Get the query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New earch object and add it to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert("Somethign wrong with the search...");
            clearLoader();
        }
    }
}

/**
* It prevents the page from reloading everytime search button is pressed.
* It calls controlSearch() which controls the entire search controller.
*/
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// It loads the results for the next or prev page when corresponding button is clicked.
elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/*
************************************************
RECIPE CONTROLLER
************************************************
*/

const controlRecipe = async () => {
    // Retrieving the id from the hash prepeorty of the url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Hihlight selected search item
        if (state.search) searchView.highlightedSelected(id);

        // Create a new Recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredient();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();


            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            alert("Error processing recipe!!");
        }
    }
}


/*
************************************************
LIST CONTROLLER
************************************************
*/

const controlList = () => {
    // Create a new List if there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list an UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

/**
 * As soon as we click on any recipe, the hash value in the url cahnges.
 * This value is the id of the recipe that we want.
 * Hence we attach an event handler to the window which on hashchange event fires callback function controlRecipe().
 * Another event handler is attached to load event.
 * So whenever the page loads with the same id, the data is not gone.
*/
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete event
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

        // Handle the count update    
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/*
************************************************
LIKES CONTROLLER
************************************************
*/

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has not liked current recipe yet
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI list
        likesView.renderLike(newLike);

        // User has liked the current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe buttons
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});