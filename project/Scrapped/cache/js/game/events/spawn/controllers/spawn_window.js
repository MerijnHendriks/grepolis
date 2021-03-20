/* global Promise */

define('events/spawn/controllers/spawn_window', function() {
	'use strict';

	var TabController = window.GameControllers.TabController,
		SubWindowRewardController = require('events/spawn/controllers/sub_window_reward'),
		SpawnWindowView = require('events/spawn/views/spawn_window'),
		ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory'),
		GameEvents = require('data/events'),
		PLAYER_HINT = 'hades_tutorial';

	return TabController.extend({

		initialize : function(options) {
			TabController.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners: function() {
			this.stopObservingEvent(GameEvents.town.town_switch);
			this.observeEvent(GameEvents.town.town_switch, this.reRender.bind(this));

			this.stopListening();
			this.mission_collection.onMissionChange(this.view, this.view.renderMissions);
			this.units_collection.onUnitsChange(this, this.reRender.bind(this));
		},

		renderPage : function() {
			this.mission_collection = this.getCollection('spawn_missions');
			this.units_collection = this.getCollection('units');
			this.spawn_model = this.getModel('spawn');

			this.initializeView();
			this.checkAndShowTutorial();

			return this;
		},

		reRender : function() {
			this.initializeView();
			this.reRenderSubWindow();
		},

		initializeView: function() {
			this.view = new SpawnWindowView({
				el : this.$el,
				controller : this
			});

			this.registerEventListeners();
		},

		checkAndShowTutorial: function() {
			var tutorial_hint = this.getCollection('player_hints').getForType(PLAYER_HINT);
			if (!tutorial_hint.isHidden()) {
				this.view.openTutorial();
				tutorial_hint.disable();
			}
		},

		getEndRewardData: function() {
			var end_rewards = this.spawn_model.getEndRewards();
			return {
				reward: end_rewards[0],
				amount: end_rewards.length
			};
		},

		getEventEndAt: function() {
			return this.spawn_model.getEndDate();
		},

		getMissions: function() {
			return this.mission_collection.getMissions();
		},

		getRunningMission: function() {
			return this.mission_collection.getRunningMission();
		},

		reFetchMissions: function(options) {
			this.mission_collection.reFetch();
		},

		/**
		 *
		 * @param index - the mission_id
		 * @returns {Promise}
		 */
		doSendMission: function(index) {
			return this.mission_collection.sendMission(index);
		},

		claimReward: function() {
			var running_mission = this.getRunningMission(),
				mission_id = running_mission.getMissionId(),
				mission_collection = this.mission_collection,
				reward_data = this.mission_collection.getMissionResourcesAndFavor(mission_id);

			return new Promise(function(resolve, reject) {
				ConfirmationWindowFactory.openConfirmationWastedResources(function() {
					mission_collection.claimMissionReward(mission_id).then(function() {
						resolve();
					});
				}, function() {
					reject();
				}, reward_data);
			})
			.catch(function(err) {
				return Promise.reject(err);
			}.bind(this));
		},

		getNumberOfStones: function() {
			return this.spawn_model.getStones();
		},

		allStonesCollected: function() {
			return this.getNumberOfStones() >= 6;
		},

		openRewardSubWindow: function() {
			var	controller = new SubWindowRewardController({
				l10n : this.getl10n('sub_window_reward'),
				window_controller : this,
				templates : {
					sub_window_reward: this.getTemplate('sub_window_reward')
				},
				models : { mission: this.getRunningMission() },
				collections : {},
				cm_context : {
					main : this.getMainContext(),
					sub : 'reward'
				}
			});

			this.openSubWindow({
				title: this.getl10n('sub_window_reward').title,
				controller : controller,
				skin_class_names : 'classic_sub_window spawn_sub_window_reward'
			});

		},

		destroyPortal: function() {
			$('.hades_unit_movement').hide();
			var destroyHeader = this.view.destroyHeader.bind(this.view);
			return this.spawn_model.claimEndReward().then(destroyHeader);
		},

		sendDestroyCityPortalEvent: function() {
			$.Observer(GameEvents.spawn.destroy_city_portal).publish('spawn');
		},

		/**
		 * @returns {Object} units in current town
		 */
		getUnitsInTownModel : function() {
			return this.units_collection.getUnitsInTown();
		},

		hasMissingUnits : function(mission_id) {
			var units = this.getUnitsInTownModel(),
				mission = this.mission_collection.getMission(mission_id);

			return us.some(mission.getNeededUnits(), function(amount, unit) {
				return units.getUnitCount(unit) < amount;
			});
		},

		destroy : function() {

		}
	});

});
