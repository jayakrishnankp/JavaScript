import { elements } from '../views/base';
import axios from 'axios';
import * as searchView from '../views/searchView';
import { proxy } from '../config';

export default class Search{
	constructor(query){
		this.query = searchView.getInput();
	}
	async getResults(query){
		try{
			const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
			this.result = res.data.recipes;
			//console.log(this.result);
		}
		catch(error){
			alert(error);
		}
	}
}