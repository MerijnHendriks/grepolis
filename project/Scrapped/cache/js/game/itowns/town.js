/*globals TownRelationProvider, MM */
/**
 * @Deprecated
 * Town class.
 * Storage of all related information of a town.
 *
 * @param {Number} id
 * @param {window.GameCollections.BuildingOrders} buildingOrders
 * @param {window.GameCollections.RemainingUnitOrders} remainingUnitOrders
 * @param {window.GameCollections.Units} units DEPRECATED
 * @param {window.GameCollections.Units} supporting_units DEPRECATED
 * @param {window.GameModels.PlayerGods} player_gods
 * @param {String} name
 */
(function() {
	'use strict';

	function Town(id, buildingOrders, remainingUnitOrders, units, supporting_units, player_gods, casted_powers_collection, name) {
		/**
		 * get the frontend model for this town
		 *
		 * @returns {window.GameModels.Town}
		 */
		function getTownModel() {
			var town_relation = new TownRelationProvider(id);

			return town_relation.getModel();
		}

		this.id = parseInt(id, 10);
		this.name = name || getTownModel().getName();
		this.group_ids = {};
		this.casted_powers_collection = casted_powers_collection;

		/**
		 * Get given hero from town
		 *
		 * @param {String} hero_type
		 * @returns {GameModels.PlayerHero} or null if hero not found
		 */
		this.getHero = function(hero_type) {
			var hero = MM.getCollections().PlayerHero[0].getHeroOfTown(this.id);
			if (hero && hero.getId() === hero_type) {
				return hero;
			}

			return null;
		};

		/**
		 * Check if hero is in town
		 *
		 * @param {String} hero_type
		 * @returns {boolean}
		 */
		this.hasHero = function(hero_type) {
			var hero = MM.getCollections().PlayerHero[0].getHeroOfTown(this.id);

			if (!hero) {
				return false;
			}

			return hero.getId() === hero_type;
		};

		/**
		 * get town id
		 *
		 * @returns {Number}
		 */
		this.getId = function() {
			return this.id;
		};

		/**
		 * get town name
		 *
		 * @returns {String}
		 */
		this.getName = function() {
			return getTownModel().getName();
		};

		/**
		 * town has conqueror
		 *
		 * @returns {boolean}
		 */
		this.hasConqueror = function() {
			return getTownModel().hasConqueror();
		};

		/**
		 * get the remaining unit orders frontend collection for this town
		 *
		 * @returns {window.GameCollections.RemainingUnitOrders}
		 */
		this.getUnitOrdersCollection = function() {
			return remainingUnitOrders;
		};

		/**
		 * get the building orders frontend collection for this town
		 *
		 * @returns {window.GameCollections.BuildingOrders}
		 */
		this.buildingOrders = function() {
			return buildingOrders;
		};

		/**
		 * return the base64 encoded link fragment for this town
		 *
		 * @return {String}
		 */
		this.getLinkFragment = function() {
			return getTownModel().getLinkFragment();
		};

		/**
		 * @deprecated
		 */
		this.researches = function() {
			return this.getResearches();
		};

		/**
		 * get the research frontend model for this town
		 *
		 * @returns {window.GameCollections.TownResearches}
		 */
		this.getResearches = function() {
			return getTownModel().getResearches();
		};

		/**
		 * @alias
		 */
		this.buildings = function() {
			return this.getBuildings();
		};

		/**
		 * get the buildings frontend model for this town
		 *
		 * @returns {window.GameCollections.TownBuildings}
		 */
		this.getBuildings = function() {
			return getTownModel().getBuildings();
		};

		/**
		 * get the island x coordinate
		 *
		 * @returns {Number}
		 */
		this.getIslandCoordinateX = function() {
			return getTownModel().getIslandX();
		};

		/**
		 * get the island y coordinate
		 *
		 * @returns {Number}
		 */
		this.getIslandCoordinateY = function() {
			return getTownModel().getIslandY();
		};

		/**
		 * get resources values
		 *
		 * @todo remove storage, favor and population
		 * @returns {Object}
		 */
		this.resources = function() {
			var model = getTownModel(),
				resources = {};

			resources.wood = model.getResource('wood');
			resources.stone = model.getResource('stone');
			resources.iron = model.getResource('iron');

			resources.storage = this.getStorage();

			resources.population = this.getAvailablePopulation();

			resources.favor = 0;

			if (model.getGod()) {
				resources.favor = player_gods.getCurrentFavorForGod(model.getGod());
			}

			return resources;
		};

		/**
		 * get esources constraints
		 *
		 * Every island produces more of some type of resources
		 * this function returns information which one
		 *
		 * @return {Object} with keys plenty and rare, value is string a resource
		 *
		 * DONT REMOVE IT, IT'S USED IN THE trade_oveview_town_tmpl.tpl.php (in wierd way)
		 */
		this.resourcesConstraints = function() {
			var model = getTownModel(),
				constraints;

			constraints = {
				rare: model.getResourceRare(),
				plenty: model.getResourcePlenty()
			};

			return constraints;
		};

		/**
		 * render this town with template
		 *
		 * @deprecated get rid of this
		 * @param {String} tmpl
		 * @param {Object} additionalData
		 * @returns {String}
		 */
		this.render = function(tmpl, additionalData) {
			var html;
			this.addD = additionalData || {};
			html = us.template(tmpl, this);
			delete this.addD;
			return html;
		};

		/**
		 * get resource production values per hour
		 *
		 * @todo remove favor
		 * @returns {Object}
		 *			@property {Number} wood
		 *			@property {Number} stone
		 *			@property {Number} iron
		 *			@property {Number} favor
		 */
		this.getProduction = function() {
			var model = getTownModel();

			return {
				wood: parseInt(model.getProductionPerHour('wood'), 10),
				stone: parseInt(model.getProductionPerHour('stone'), 10),
				iron: parseInt(model.getProductionPerHour('iron'), 10),
				favor: parseInt(player_gods.getProductionForGod(model.getGod()), 10)
			};
		};

		/**
		 * get the available trade capacity for this town
		 *
		 * @returns {Number}
		 */
		this.getAvailableTradeCapacity = function() {
			return getTownModel().getAvailableTradeCapacity();
		};

		/**
		 * Returns the calculated values for wood, stone and iron.
		 *
		 * @return Object with keys for each resources
		 */
		this.getCurrentResources = function() {
			var model = getTownModel();

			return {
				wood: model.getResource('wood'),
				stone: model.getResource('stone'),
				iron: model.getResource('iron')
			};
		};

		/**
		 * get available population in town
		 *
		 * @returns {Number}
		 */
		this.getAvailablePopulation = function() {
			return getTownModel().getAvailablePopulation();
		};

		/**
		 * get extra population
		 *
		 * @return {Number}
		 */
		this.getPopulationExtra = function() {
			return getTownModel().getPopulationExtra();
		};

		/**
		 * get god for town

		 * @return {String} or null
		 */
		this.god = function() {
			return getTownModel().getGod();
		};

		/**
		 * get player max favor
		 *
		 * @todo move away from town
		 * @returns {Number}
		 */
		this.getMaxFavor = function() {
			return player_gods.getMaxFavor();
		};

		/**
		 * get storage volume
		 *
		 * @return {Number}
		 */
		this.getStorage = function() {
			return parseInt(getTownModel().storage.getCapacity(), 10);
		};

		this.getEspionageStorage = function() {
			return getTownModel().getEspionageStorage();
		};

		/**
		 * get town points
		 *
		 * @returns {Number}
		 */
		this.getPoints = function() {
			return getTownModel().getPoints();
		};

		/**
		 * get or set units & unit count
		 *
		 * @todo replace with access to frontend model
		 */
		this.units = function() {
			var town_units = units.getUnitsInTown();
			return town_units ? town_units.getUnits() : {};
		};

		/**
		 * Get all land units from this town
		 *
		 * @todo replace with access to frontend model
		 * @param {Boolean} non_mythological_only_arg
		 * @returns {unresolved}
		 */
		this.getLandUnits = function(non_mythological_only_arg) {
			var town_units = units.getUnitsInTown();
			return town_units ? town_units.getLandUnits(non_mythological_only_arg) : {};
		};

		/**
		 * get or set units & unit count outer
		 *
		 * @todo replace with access to frontend model
		 * @param _units Object
		 */
		this.unitsOuter = function(_units) {
			return supporting_units.calculateTotalAmountOfUnits();
		};

		/**
		 * get castable powers on town
		 *
		 * @return {Object} power id as key and value
		 */
		this.getCastablePowersOnTown = function() {
			var power,
				powers = {},
				castable_powers_on_town_grouped = player_gods.getCastablePowersOnTownForAvailableGods(),
				castable_powers_on_town,
				cl,
				i,
				god_id;

			for (god_id in castable_powers_on_town_grouped) {
				if (castable_powers_on_town_grouped.hasOwnProperty(god_id)) {
					castable_powers_on_town = castable_powers_on_town_grouped[god_id];
					cl = castable_powers_on_town.length;
					for (i = 0; i < cl; i++) {
						power = castable_powers_on_town[i];
						powers[power] = power;
					}
				}
			}

			return powers;
		};

		/**
		 * Get casted powers
		 *
		 * From internal frontend model collection
		 * converted to legacy array structure
		 *
		 * @deprecated get rid of this, use collection directly instead
		 * @return {Array} for structure of single element see getCastedPower()
		 */
		this.getCastedPowers = function() {
			var casted_powers_on_town = MM.getCollections().CastedPowers[0];
			return casted_powers_on_town.models.map(function(model) {
				return model.attributes;
			});
		};

		this.getCastedPowersCollection = function() {
			return this.casted_powers_collection;
		};

		/**
		 * Get detailed information about a casted power on this town
		 *
		 * @todo return frontend model
		 * @param {String} power_id
		 * @returns {Object|false}
		 *				@property {Array} configuration
		 *				@property {Number} end_at:
		 *				@property {Number} extended:
		 *				@property {Number} id:
		 *				@property {Number} level:
		 *				@property {Number} origin_player_id:
		 *				@property {String} power_id:
		 *				@property {Number} town_id:
		 */
		this.getCastedPower = function(power_id) {
			var casted_power, casted_powers = this.getCastedPowers(), i, l = casted_powers.length;

			for (i = 0; i < l; i++) {
				casted_power = casted_powers[i];

				if (casted_power.power_id === power_id) {
					return casted_power;
				}
			}

			return false;
		};

		this.getCastedPowerModel = function(power_id) {
			return us.find(getTownModel().getCastedPowers(), function(model) {
				return model.getPowerId() === power_id;
			});
		};

		/**
		 * get or set units & unit count in town support from other towns
		 *
		 * @todo replace with access to frontend model
		 * @param _units Object
		 */
		this.unitsSupport = function(_units) {
			return units.calculateTotalAmountOfSupports();
		};
	}

	window.Town = Town;
}());
