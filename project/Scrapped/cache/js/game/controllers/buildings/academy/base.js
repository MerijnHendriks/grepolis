/*global GameData, ConstructionQueueStrategyFactory, DM, Game, GameEvents, GameDataResearches, GameDataBuildings, GameControllers */

(function() {
	'use strict';

	var AcademyBaseController = GameControllers.TabController.extend({
		town_model : null,
		town_researches : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		reRender : function() {
			//Destroy researches queue
			this.destroyController('researches_queue');
			this.destroyView();

			this.renderPage();
		},

		reRenderTechTree : function() {
			this.view.reRenderTechTree();
		},

		renderPage : function() {
			//Set town model (has to be first!)
			this.setTownModelReference();
			this.updateWindowTitle();

			var ViewClass = this.getViewClass();

			this.view = new ViewClass({
				controller : this,
				el : this.$el
			});

			this.initializeResearchesQueue();
			this.registerEventsListeners();

			return this;
		},

		updateWindowTitle : function() {
			this.setWindowTitle(GameData.buildings.academy.name + ' (' + Game.townName + ')');
		},

		initializeResearchesQueue : function() {
			var strategy = ConstructionQueueStrategyFactory.getResearchQueueStrategyInstance(this.getModels(), this.getCollections());
			var Controller = strategy.getControllerClass();

			var researches_queue_controller = this.registerController('researches_queue', new Controller({
				el : this.$el.find('.js-researches-queue'),
				cm_context : {main : 'researches_queue', sub : 'index'},
				l10n : {
					construction_queue : DM.getl10n('construction_queue')
				},
				templates : {
					queue : this.getTemplate('queue'),
					queue_instant_buy : this.getTemplate('queue_instant_buy'),
					advisor_container : this.getTemplate('advisor_container')
				},
				models : {
					premium_features : this.getModel('premium_features'),
					player_ledger : this.getModel('player_ledger')
				},
				collections : {
					research_orders : this.getCollection('research_orders'),
					towns : this.getCollection('towns')
				},
				strategies : {
					queue : strategy
				},
				tooltip_position : 'bottom-center'
			}));

			researches_queue_controller.renderPage();
		},

		setTownModelReference : function() {
			this.town_model = this.getCollection('towns').getCurrentTown();
		},

		getTownModelReference : function() {
			return this.town_model;
		},

		getResearchOrdersCount : function() {
			var research_orders = this.getResearchOrders();

			return research_orders.getCount();
		},

		isInResetingModeActive : function() {
			throw 'Please implement isInResetingModeActive method in all classes which inherits from AcademyBaseController';
		},

		getViewClass : function() {
			throw 'Please implement getViewClass method in all classes which inherits from AcademyBaseController';
		},

		onBtnClick : function(/*research_id*/) {
			throw 'Please implement onBtnClick method in all classes which inherits from AcademyBaseController';
		},

		registerEventsListeners : function() {
			var reRenderTechTree = this.reRenderTechTree.bind(this);

			this.stopListening();
			this.stopObservingEvents();
			this.unregisterMultiEventsListeners();

			//Town switch
			this.observeEvent(GameEvents.town.town_switch, this.reRender.bind(this));

			//Listen on the building orders because maybe Library was destroyed
			this.getCollection('building_orders').onOrderCountChange(this, this.onBuildingOrdersCountChange.bind(this));

			//Listen on new researches
			this.getCollection('research_orders').onOrderCountChange(this, this.onResearchOrdersCountChange.bind(this));

			//Listen on new researches
			this.listenTo(this.getCollection('player_heroes'), 'add change remove', reRenderTechTree);

			//Resources change
			var town_model = this.getTownModelReference();

			this.listenToMultiEvents('all_resource_change_actions', [
				{obj : town_model, method : 'onResourceWoodChange'},
				{obj : town_model, method : 'onResourceStoneChange'},
				{obj : town_model, method : 'onResourceIronChange'}
			], reRenderTechTree);

			this.registerResearchesListener();
		},

		registerResearchesListener : function() {
			var reRenderTechTree = this.reRenderTechTree.bind(this);

			//Stop listening on the previous model
			if (this.town_researches !== null) {
				this.stopListening(this.town_researches);
				this.town_researches = null;
			}

			this.town_researches = this.getTownResearches();
			this.town_researches.onResearchesChange(this, reRenderTechTree);
		},

		onBuildingOrdersCountChange : function() {
			this.view.updateResearchPoints();
			this.view.updateAvailableResearchPointsTooltip();
		},

		onResearchOrdersCountChange : function() {
			this.reRenderTechTree();
			this.view.updateQueueItemCount();
			this.view.updateResearchPoints();
			this.view.updateAvailableResearchPointsTooltip();
		},

		areExtendedWorldFeaturesEnabled : function() {
			var GameDataFeatureFlags = require('data/features');

			return GameDataFeatureFlags.areExtendedWorldFeaturesEnabled();
		},

		getResearchesInColumns : function() {
			var researches = GameData.researches,
				research_orders = this.getResearchOrders(),
				academy_level = this.getAcademyLevel(),
				available_research_points = this.getAvailableResearchPoints(),
				town_researches = this.getTownResearches();

			var output = [];

			for (var research_id in researches) {
				if (researches.hasOwnProperty(research_id)) {
					var research = researches[research_id],
						research_dependencies = research.building_dependencies,
						column_number = Math.ceil(research_dependencies.academy / 3);

					var is_researched = town_researches.hasResearch(research_id),
						in_progress = research_orders.isResearchInQueue(research_id),
						full_queue = research_orders.isResearchQueueFull(),
						has_enough_resources = this.hasEnoughResources(research_id),
						has_sufficient_academy_level = academy_level >= research_dependencies.academy,
						has_enough_research_points = available_research_points >= research.research_points;

					if (!output[column_number - 1]) {
						output[column_number - 1] = [];
					}

					output[column_number - 1].push({
						research_id : research_id,
						column_number : column_number,
						is_researched : is_researched,
						in_progress : in_progress,
						can_be_bought :
							has_sufficient_academy_level &&
							!is_researched &&
							!in_progress &&
							!full_queue &&
							has_enough_resources &&
							has_enough_research_points

					});
				}
			}

			return output;
		},

		hasEnoughResources : function(research_id) {
			var gd_research = GameData.researches[research_id];
			var resources_needed = GameDataResearches.getResearchCosts(gd_research);
			var town_resources = this.getTownResources();

			for (var resource_id in resources_needed) {
				if (resources_needed.hasOwnProperty(resource_id)) {
					if (resources_needed[resource_id] > town_resources[resource_id]) {
						return false;
					}
				}
			}

			return true;
		},

		getResearchOrders : function() {
			return this.getCollection('research_orders');
		},

		getTownResearches : function() {
			return this.getCollection('towns').getCurrentTown().getResearches();
		},

		getTownBuildings : function() {
			return this.getCollection('towns').getCurrentTown().getBuildings();
		},

		getTownResources : function() {
			return this.getCollection('towns').getCurrentTown().getResources();
		},

        getAvailableCulturalPoints : function() {
			return this.getModel('player').getAvailableCulturalPoints();
		},

		getAcademyLevel : function() {
			return this.getTownBuildings().getBuildingLevel('academy');
		},

		getLibraryLevel : function() {
			return this.getTownBuildings().getBuildingLevel('library');
		},

		hasAcademy : function() {
			return this.getAcademyLevel() > 0;
		},

		hasLibrary : function() {
			return this.getLibraryLevel() === 1;
		},

		getAdditionalResearchPoints : function() {
			return this.hasLibrary() ? GameDataResearches.getResearchPointsPerLibraryLevel() : 0;
		},

		getSpentResearchPoints : function() {
			var gd_researches = GameData.researches,
				town_researches = this.getTownResearches(),
				research_orders = this.getResearchOrders(),
				points = 0;

			for (var research_id in gd_researches) {
				if (gd_researches.hasOwnProperty(research_id)) {
					var research = gd_researches[research_id];
					if (town_researches.hasResearch(research_id) || research_orders.isResearchInQueue(research_id)) {
						points += research.research_points;
					}
				}
			}

			return points;
		},

		getMaxResearchPoints : function() {
			return GameDataBuildings.getBuildingMaxLevel('academy') * GameDataResearches.getResearchPointsPerAcademyLevel() + this.getAdditionalResearchPoints();
		},

		getMaxResearchPointsWithoutLibrary : function() {
			return GameDataBuildings.getBuildingMaxLevel('academy') * GameDataResearches.getResearchPointsPerAcademyLevel();
		},

		getCurrentResearchPoints : function() {
			if(!this.getCollection('building_orders').isBuildingTearingDown('academy')) {
				return this.getAcademyLevel() * GameDataResearches.getResearchPointsPerAcademyLevel() + this.getAdditionalResearchPoints();
			} else {
				return ((this.getAcademyLevel() - 1) * GameDataResearches.getResearchPointsPerAcademyLevel()) + this.getAdditionalResearchPoints();
			}
		},

		getAvailableResearchPoints : function() {
			return this.getCurrentResearchPoints() - this.getSpentResearchPoints();
		},

		isLibraryBeingTearingDown : function() {
			return this.getCollection('building_orders').isBuildingTearingDown('library');
		},

		/**
		 * Researches new thing
		 *
		 * @param {String} research_id
		 */
		buyResearch : function(research_id) {
			var research_model = new window.GameModels.ResearchOrder({
				research_type: research_id
			});

			research_model.research(function() {
				$.Observer(GameEvents.building.academy.research.buy).publish({
					research_id : research_id
				});
			});
		},

		/**
		 * Reverts research
		 *
		 * @param {String} research_id
		 * @param {Function} callback
		 */
		revertResearch : function(research_id, callback) {
			var research_model = new window.GameModels.ResearchOrder({
				research_type: research_id
			});

			research_model.revert(callback);
		},

		destroy : function() {
			this.town_model = null;
		}
	});

	window.GameControllers.AcademyBaseController = AcademyBaseController;
}());
