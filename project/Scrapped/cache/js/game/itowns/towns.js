/*globals GameEvents, TownGroups, Town, TM, GameDataPremium, Backbone, Game, NotificationLoader, gpAjax */

/**
 * TownData class.
 * Interface class for towns.
 */
(function() {
	'use strict';

	/**
	 * @param {Object} models list of common models
	 * @param {Object} collections list of common collections
	 * @class TownsData
	 * @constructor
	 */
	function TD(models, collections) {
		// ---- initialize ITowns pieces
		this.towns = {}; //dictionary town.id => Town
		this.townGroups = new TownGroups(collections.town_groups);  // wrapper object for town group magic in town list

		// ----- store needed collections
		this.all_building_orders = collections.building_orders;
		this.all_casted_powers = collections.casted_powers;
		this.all_remaining_unit_orders = collections.unit_orders;
		this.all_buildings = collections.town_buildings;
		this.all_researches = collections.town_researches;
		this.all_units = collections.units;
		this.all_supporting_units = collections.supporting_units;
		this.towns_collection = collections.towns; //@todo use it correctly and pass it to town while we create it
		this.town_groups = collections.town_groups;
		this.town_group_towns = collections.town_group_towns;
		this.all_movements_colonizations = collections.movements_colonizations;

		// ----- store needed models
		this.player_gods = models.player_gods;

		// ----- set listeners
		this.player_gods.onGodsFavorChange(this, this._publishFavorForAllGods.bind(this));

		this.all_casted_powers.getCurrentFragment().onAdd(this, this._onAddCastedPower.bind(this), this);
		this.all_casted_powers.getCurrentFragment().onRemove(this, this._onRemoveCastedPower.bind(this), this);

		this.all_remaining_unit_orders.getCurrentFragment().on('change:parts_done change:to_be_completed_at', this._publishUnitOrderChange, this);
		this.all_remaining_unit_orders.getCurrentFragment().on('change:order_done', this._publishUnitOrderDone, this);

		this.last_resources_update = $.now();
		this.all_units.getCurrentFragment().on('change', this._publishUnitChange, this);
		this.all_supporting_units.getCurrentFragment().on('change', this._publishSupportChange, this);

		// immediate publish
		this.towns_collection.on('change:available_trade_capacity change:resources_last_update', this._publishResourceUpdateImmediate, this);
		// non-immediate publish
		this.towns_collection.on('change:wood change:stone change:iron', this._publishResourceUpdate, this);

		this.towns_collection.on('add', this._onTownAdded, this);
		this.towns_collection.on('remove', this._onTownRemoved, this);
	}

	/**
	 * register listener for 'add' 'remove' 'change' events of all fragments
	 * of RemainingUnitOrder Collection
	 *
	 * @see controllers/overviews/mass_recruit.js
	 * @param {GameController} controller events are bound to this controller
	 * @param {function} callback
	 */
	TD.prototype.onAnyOrderInAllTownsChange = function(controller, callback) {
		var listeners = [];

		us.each(this.towns, function(town) {
			listeners.push({
				obj : town.getUnitOrdersCollection(), method : 'onOrderCountChange'
			});

			listeners.push({
				obj : town.getUnitOrdersCollection(), method : 'onToBeCompletedAtChange'
			});
		});

		controller.listenToMultiEvents('all_unit_orders_for_mass_recruit', listeners, callback);
	};

	TD.prototype._onAddCastedPower = function(model) {
		$.Observer(GameEvents.town.power.added).publish({
			power: model
		});
	};

	TD.prototype._onRemoveCastedPower = function(model) {
		$.Observer(GameEvents.town.power.removed).publish({
			power: model
		});
	};

	TD.prototype._publishResourceUpdateImmediate = function(model, value, options) {
		this.last_resources_update = $.now();
		// only publish this event, if the resources for the current town got updated
		$.Observer(GameEvents.town.resources.update).publish({});
	};

	TD.prototype._publishResourceUpdate = function(model, value, options) {
		//updating every 10 seconds is too much, we extend it to 30 sec
		if (model.id === parseInt(Game.townId, 10) && $.now() - this.last_resources_update > 30000) {
			this._publishResourceUpdateImmediate(model, value, options);
		}
	};

	TD.prototype._publishUnitChange = function(model, value, options) {
		$.Observer(GameEvents.town.units.change).publish({});
	};

	TD.prototype._publishSupportChange = function(model, value, options) {
		$.Observer(GameEvents.town.units_beyond.change).publish({});
	};

	TD.prototype._publishUnitOrderChange = function(model, value, options) {
		if (!model.isDemonDisabled()) {
			$.Observer(GameEvents.unit.order.change).publish({units_left: model.countPartsLeft()});
		}
	};

	TD.prototype._publishUnitOrderDone = function(model, value, options) {
		var order = this.all_remaining_unit_orders.getCurrentFragment().get(model.id);

		if (order && order.isDone()) {
			NotificationLoader.resetNotificationRequestTimeout(1000);
			TM.unregister('unit_order_done');
			TM.register('unit_order_done', 2000, this._publishUnitOrderDone.bind(this, model, value, options), {max : 1});
		}
	};

	TD.prototype._publishFavorForAllGods = function() {
		var GameDataGods = require('data/gods');

		var favors = {},
			gods = GameDataGods.getAllGods(),
			god, gods_idx, gods_length = gods.length,
			production, favor;

		for (gods_idx = 0; gods_idx < gods_length; ++gods_idx) {
			god = gods[gods_idx];
			production = this.player_gods.getProductionForGodPerSecond(god);
			favor = production > 0 ? this.player_gods.getCurrentFavorForGod(god) : undefined;
			favors[god] = favor;
		}

		$.Observer(GameEvents.favor.change).publish(favors);
	};

	/**
	 * get next town_id in double link list
	 *
	 * @method getNextTownId
	 * @param {integer} town_id
	 * @return {integer}
	 */
	TD.prototype.getNextTownId = function (town_id) {
		var active_group_id = this.town_groups.getActiveGroupId();

		return this.town_group_towns.getNextTownId(active_group_id, town_id);
	};

	/**
	 * get previous town_id in double link list
	 *
	 * @method getPrevTownId
	 * @param {integer} town_id
	 * @return {integer}
	 */
	TD.prototype.getPrevTownId = function (town_id) {
		var active_group_id = this.town_groups.getActiveGroupId();

		return this.town_group_towns.getPrevTownId(active_group_id, town_id);
	};

	/**
	 * get town object
	 *
	 * @method getTown
	 * @param {integer} town_id
	 * @return {Town}
	 */
	TD.prototype.getTown = function (town_id) {
		return this.towns[town_id];
	};

	/**
	 * get the currently active town
	 *
	 * @method getCurrentTown
	 * @return {Town}
	 */
	TD.prototype.getCurrentTown = function() {
		return this.towns[Game.townId];
	};

	/**
	 * get all towns storage object
	 *
	 * @method getTowns
	 * @return {[Town]}
	 */
	TD.prototype.getTowns = function () {
		return this.towns;
	};

	/**
	 * get number of towns the player owns
	 *
	 * @method numTowns
	 * @return {integer} number of towns
	 */
	TD.prototype.numTowns = function () {
		return us.keys(this.towns).length;
	};

	/**
	 * get town gropus
	 *
	 * @method getTownGroups
	 * @return {object} groups = {0: {id: 0,name: 'virtual', towns:{}}, 'null': {id: null,name: null,towns:{}}, ...}
	 */
	TD.prototype.getTownGroups = function() {
		return this.townGroups.getGroups();
	};

	/**
	 * Determinates if the town given as a parameter is your own town
	 *
	 * @method isMyTown
	 *
	 * @param {integer} town_id_arg
	 *
	 * @return {boolean}
	 */
	TD.prototype.isMyTown = function(town_id_arg) {
		var town_id = parseInt(town_id_arg, 10);

		return this.towns[town_id] !== undefined;
	};

	/**
	 * get town groups stop sort callback
	 *
	 * @return function
	 */
	TD.prototype.getTownGroupsStopSortCallback = function() {
		return this.townGroups.stopSort;
	};

	/**
	 * get active town group
	 *
	 * @return object
	 */
	TD.prototype.getActiveTownGroup = function() {
		return this.townGroups.getActiveTownGroup();
	};

	TD.prototype.getActiveTownGroupId = function() {
		return this.town_groups.getActiveGroupId();
	};

	/**
	 * get resources of a town
	 *
	 * @param integer town_id
	 * @return object
	 */
	TD.prototype.getResources = function(town_id) {
		return this.towns[town_id].resources();
	};

	// Setter methods

	/**
	 * @deprecated
	 *
	 * set town group dropdown
	 *
	 * @param object dropdown
	 */
	/*TD.prototype.setTownGroupsDropdown = function(dropdown) {
		this.townGroups.setDropdown(dropdown);
	};*/

	/**
	 * Changes town name.
	 *
	 * @param name String
	 * @param town_id Number
	 *
	 * @return true if name was changed, false if name stays the same
	 */
	TD.prototype.setName = function(name, town_id) {
		this.towns[town_id].name = name;
	};

	/**
	 * set active town group
	 *
	 * @param integer group_id
	 */
	TD.prototype.setActiveTownGroup = function(group_id, callback, props) {
		this.townGroups.setActiveTownGroup(group_id, callback, props);
	};

	/**
	 * switch town
	 *
	 * @param integer group_id
	 * @param integer town_id
	 */
	TD.prototype.townGroupsTownSwitch = function(group_id, town_id) {
		this.townGroups.townSwitch(group_id, town_id);
	};

	/**
	 * remove town from group
	 *
	 * @param integer group_id
	 * @param integer town_id
	 * @param {Function} [callback]
	 */
	TD.prototype.townGroupsRemoveFromGroup = function(group_id, town_id, callback) {
		this.townGroups.removeFrom({
			town_id: town_id,
			group_id: group_id
		}, callback);
	};

	/**
	 * add town to group
	 *
	 * @param integer group_id
	 * @param integer town_id
	 */
	TD.prototype.townGroupsAddToGroup = function(group_id, town_id) {
		this.townGroups.addTo({
			town_id: town_id,
			group_id: group_id
		});
	};

	/**
	 * initialize
	 * @param array towns_data
	 */
	TD.prototype.initialize = function (data) {
		var bound = this.refetch.bind(this);

		this.addToTowns(data.towns);
		this.townGroups.initialize(data);

		$.Observer(GameEvents.itowns.refetch.start).subscribe(['towns_js'], bound);
		$.Observer(GameEvents.premium.adviser.activate).subscribe(['towns_js'], bound);
		$.Observer(GameEvents.premium.adviser.expire).subscribe(['towns_js'], bound);
	};

	/**
	 * refetch
	 * @param array towns_data
	 */
	TD.prototype.refetch = function (additional_callback) {
		if (GameDataPremium.hasCurator()) {
			gpAjax.ajaxGet('town_group_overviews', 'get_all_towns', {}, true, function (data) {
				this.addToTowns(data.towns);
				this.townGroups.initialize(data);

				if (typeof additional_callback === 'function') {
					additional_callback();
				}

				$.Observer(GameEvents.itowns.refetch.finish).publish({});
			}.bind(this));
		}
	};

	TD.prototype._onTownAdded = function(model, collection, options) {
		this.addToTowns([{id: model.id}]);
	};

	TD.prototype._onTownRemoved = function(model) {
		this.removeFromTowns(model.id);
	};

	TD.prototype._afterTownsAdded = function() {
		gpAjax.ajaxPost('units_beyond_info', 'get_supporting_units_for_foreigners', {}, false, function(data) {
			TM.once('itowns_handle_backbone_data', 0, window.GameLoader.handleBackboneData.bind(window.GameLoader, data));
		});
	};

	/**
	 * Add to Towns
	 * @param array towns_data
	 */
	TD.prototype.addToTowns = function (towns_data) {
		var town,
			itown,
			i = towns_data.length;

		//build up dictionary
		while (i--) {
			town = towns_data[i];
			if (!(itown = this.towns[town.id])) {
				itown = this.towns[town.id] = new Town(
					town.id,
					this.all_building_orders.getFragment(town.id),
					this.all_remaining_unit_orders.getFragment(town.id),
					this.all_units.getFragment(town.id),
					this.all_supporting_units.getFragment(town.id),
					this.player_gods,
					this.all_casted_powers.getFragment(town.id),
					town.name // remove this, if the old UI is off
				);
			}

			if (town.group_id) {
				//@deprecated itown.addTownGroupId(town.group_id);
			}
		}
	};

	TD.prototype.removeFromTowns = function(town_id) {
		delete this.towns[town_id];
	};

	TD.prototype.getCastedPowersCollection = function() {
		return this.all_casted_powers.getCurrentFragment();
	};

	TD.prototype.getCastedPowers = function() {
		return this.getCastedPowersCollection().getCastedPowers();
	};

	TD.prototype.getColonizedTown = function(town) {
		var colonized_town = false;
		us.find(this.all_movements_colonizations.fragments, function(colonization_movement) {
			colonized_town = colonization_movement.getColonizedTown(town);
			return colonized_town;
		}.bind(this));
		return colonized_town;
	};

	TD.prototype.updateFromCollection = function() {
		us.each(this.towns_collection.models, function(model) {
			this.addToTowns([{id: model.id}]);
		}.bind(this));
	};

	us.extend(TD.prototype, Backbone.Events);

	window.TownsData = TD;
}());
