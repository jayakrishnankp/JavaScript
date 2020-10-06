import Search from './models/Search';
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/* GLobal state of the app
 * Search Object
 * Current Recipe Pbject
 * Shopping List object
 * Liked Recipes
 */

const state = {};
//Search Controller
const controlSearch = async () => {
	// Get query from view
	const query = searchView.getInput();
	//do later

	if(query){
		//new search object add it to state
		state.search = new Search(query);

		//prepare UI for results
		searchView.clearInputs();
		searchView.clearResults();
		renderLoader(elements.searchRes);
		//Search for recipes
		try{
			await state.search.getResults();

			//render results on UI
			searchView.renderResults(state.search.result);
			clearLoader();
		}catch(error){
			alert(`Something went worng: ${error}`);
			clearLoader();
		}
	}
}

elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if(btn){
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goToPage);
	}
});

//Recipe Controller
const controlRecipe = async () => {
	const id = window.location.hash.replace('#','');

	if(id){
		//prepare UI for changes
		renderLoader(elements.recipe);

		//highlight selected search item
		if(state.search) searchView.highLightSelected(id);
		//create new recipe object
		state.recipe = new Recipe(id);

		try{
			//Get recipe data and parseingredients
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();

			//call calcTime and calcServings
			state.recipe.calcServings();
			state.recipe.calcTime();
			//render recipe
			clearLoader();
			recipeView.clearRecipe();
			recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
		}catch(error){
			alert(`Error processing recipe: ${error}`);
		}

	}
}

//List Controller
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Likes Controller
const controlLike = () => {
	if(!state.likes) state.likes = new Likes();
	const currentID = state.recipe.id;
	//user has not yet liked current recipe
	if(!state.likes.isLiked(currentID)){
		//add like to state
		const newLike = state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);
		//toggle like button
		likesView.toggleLikeBtn(true);
		//add like to UI list
		likesView.renderLike(newLike);
	//user has not yet liked current recipe
	}else{
		//remove like from state
		state.likes.deleteLike(currentID);
		//toggle like button
		likesView.toggleLikeBtn(false);
		//remove like from UI list
		likesView.deleteLike(currentID);

	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
}


// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//Handle and delete update list items
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	//delete event
	if(e.target.matches('.shopping__delete, .shopping__delete *')){
		//delete from both stateand UI
		state.list.deleteItem(id);
		listView.deleteItem(id);
	}else if(e.target.matches('.shopping__count-value')){
		const val = parseFloat(e.target.value);
		state.list.updateCount(id, val);
	}

});

//restore liked recipe when page loads
window.addEventListener('load', () => {
	state.likes = new Likes();
	//restore likes from local storage
	state.likes.readStorage();

	//toggle like menu
	likesView.toggleLikeMenu(state.likes.getNumLikes());

	//render existing likes
	state.likes.likes.forEach(el => likesView.renderLike(el));
});



//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
	if(e.target.matches('.button-decrease, .btn-decrease *')){
		//Decrease button is clicked
		if(state.recipe.servings>1){
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	}else if(e.target.matches('.button-increase, .btn-increase *')){
		//Increase buton is clicked
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	}else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
		//add to list
		controlList();
	}else if(e.target.matches('.recipe__love, .recipe__love *')){
		controlLike();
	}
});

