/*global us, Backbone */

/**
 * Collection which represents all supports from active player.
 *
 * @see top of the support_overview_index.js where are descriptions of all modes
 *
 * @extends GameCollections.UnitsCollection
 */
 (function() {
	'use strict';

	var UnitsCollection = window.GameCollections.Units;
	var Units = window.GameModels.Units;

	/**
	 * Is used during gameload for ITowns, to which it is given as TownAgnosticCollection segmented by the home_town_id.
	 * This means, that every instance contains all supports coming from one home_town.
	 *
	 * The custom add method will make sure, that really only support is in here. This means current_town_id !== home_town_id.
	 * Support onroute is counted in here as well
	 *
	 * ITowns uses it to pass the correct fragment to the ITowns.town instances and it will publish
	 * GameEvents.town.units_beyond.change (for example used for the new baracks) for the current town only.
	 *
	 * The ITowns.town uses it for .unitsOuter() which is used in the old baracks (thru UnitOrder static class as the handleEvents method in that)
	 *
	 * @class ActivePlayerSupportsTowns
	 * @constructor
	 */
	var ActivePlayerSupportsTowns = function() {}; // never use this, becasue it will be overwritten

	ActivePlayerSupportsTowns.model = Units;
	ActivePlayerSupportsTowns.model_class = 'Units';

	ActivePlayerSupportsTowns.initialize = function() {
		this.on('change:current_town_id', this._checkCurrentTownChange, this);
	};

	ActivePlayerSupportsTowns._checkCurrentTownChange = function(model, value, options) {
		var collections_home_town_id = this._getCollectionsHomeTownId();

		if (value === collections_home_town_id) {
			this.remove(model);
		}
	};

	ActivePlayerSupportsTowns._getCollectionsHomeTownId = function() {
		if (this.segmentation_value !== undefined) {
			return this.segmentation_value;
		} else if (this.creationArguments) {
			return this.creationArguments.town_id;
		}
	};

	ActivePlayerSupportsTowns.add = function(model_models_or_collection) {
		var models;

		if (model_models_or_collection instanceof Backbone.Collection) {
			models = model_models_or_collection.toArray();
		} else if (us.isArray(model_models_or_collection)) {
			models = model_models_or_collection;
		} else {
			models = [model_models_or_collection];
		}

		this._addModels(models);
	};

	ActivePlayerSupportsTowns._addModels = function(models) {
		var model_idx, models_length = models.length, model,
			current_town_id,
			collections_home_town_id = this._getCollectionsHomeTownId();

		for (model_idx = 0; model_idx < models_length; ++model_idx) {
			model = models[model_idx];
			current_town_id = typeof model.get === 'function' ? model.get('current_town_id') : model.current_town_id;

			if (current_town_id !== collections_home_town_id) {
				// if it has no current_town_id, then it is travelling
				UnitsCollection.prototype.add.apply(this, arguments);
			}
		}
	};

	window.GameCollections.ActivePlayerSupportsTowns = UnitsCollection.extend(ActivePlayerSupportsTowns);
}());
