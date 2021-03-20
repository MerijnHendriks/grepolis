/*global us */

/**
 * Collection which represents supports from active player given to specific town.
 * For example, player X gave supports from towns X, Y, Z to town X of player Y
 * or to his own town V.
 *
 * @see top of the support_overview_index.js where are descriptions of all modes
 *
 * @extends GameCollections.UnitsCollection
 */
(function() {
	'use strict';

	var UnitsCollection = window.GameCollections.Units;
	var GrepolisCollection = window.GrepolisCollection;
	var Units = window.GameModels.Units;

	var ActivePlayerSupportsTown = function() {}; // never use this, becasue it will be overwritten

	ActivePlayerSupportsTown.model = Units;
	ActivePlayerSupportsTown.model_class = 'Units';

	ActivePlayerSupportsTown.initialize = function() {
		this.on('change:current_town_id', this.checkCurrentTownValidity, this);
	};

	ActivePlayerSupportsTown.checkCurrentTownValidity = function(model, value, options) {
		if (model.hasChanged('current_town_id') && value !== this.creationArguments.town_id) {
			this.remove(model);
		}
	};

	ActivePlayerSupportsTown.add = function(model_models_or_collection) {
		var models;

		if (model_models_or_collection instanceof GrepolisCollection) {
			models = model_models_or_collection.toArray();
		} else if (us.isArray(model_models_or_collection)) {
			models = model_models_or_collection;
		} else {
			models = [model_models_or_collection];
		}

		this._addModels(models);
	};

	ActivePlayerSupportsTown._addModels = function(models) {
		var model_idx, models_length = models.length, model,
			current_town_id;

		for (model_idx = 0; model_idx < models_length; ++model_idx) {
			model = models[model_idx];
			current_town_id = typeof model.get === 'function' ? model.get('current_town_id') : model.current_town_id;

			if (current_town_id === this.creationArguments.town_id) {
				// if it has no current_town_id, then it is travelling
				UnitsCollection.prototype.add.apply(this, arguments);
			}
		}
	};

	/**
	 * overriden to fix issue with the standard implementation which
	 * would result in all models of type "Unit" to be removed from MM
	 * (including the Units-Collections)
	 * The data is also used by the town info tooltips so the models should not be removed
	 */
	ActivePlayerSupportsTown.unregisterFromModelManager = function() {
		return false;
	};

	window.GameCollections.ActivePlayerSupportsTown = UnitsCollection.extend(ActivePlayerSupportsTown);
}());
