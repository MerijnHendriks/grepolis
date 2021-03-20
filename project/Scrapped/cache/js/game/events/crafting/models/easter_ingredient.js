/*global window, GameDataEaster, GrepolisModel */

define('events/crafting/models/easter_ingredient', function(require) {
	"use strict";

	var EasterIngredient = function () {}; // never use this, because it will be overwritten
	EasterIngredient.urlRoot = 'EasterIngredient';

	EasterIngredient.getId = function() {
		return this.get('id');
	};

	EasterIngredient.getIngredientType = function() {
		return this.get('ingredient_type');
	};

	EasterIngredient.getElement = function() {
		return GameDataEaster.getIngredient(this.getIngredientType()).element;
	};

	EasterIngredient.getCost = function() {
		return GameDataEaster.getIngredient(this.getIngredientType()).costs * this.get('cost_factor');
	};

	EasterIngredient.getAmount = function() {
		return this.get('amount');
	};

	EasterIngredient.getCollectedAmountToday = function() {
		return this.get('collected_amount');
	};

	EasterIngredient.getCollectedTimesToday = function() {
		return this.get('collected_times');
	};

	EasterIngredient.getName = function() {
		return GameDataEaster.getIngredient(this.getIngredientType()).name;
	};

	EasterIngredient.buyIngredient = function() {
		this.execute('buyIngredient', {ingredient_type: this.getIngredientType()}, {
				success: function(data) {
					//console.log('successfull buy:', data);
				},
				error: function(data) {
					//console.log('error buy:', data);
				}
			}
		);
	};

	window.GameModels.EasterIngredient = GrepolisModel.extend(EasterIngredient);
	return EasterIngredient;
});