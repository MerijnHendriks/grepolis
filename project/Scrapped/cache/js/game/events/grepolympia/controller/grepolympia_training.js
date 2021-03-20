/*globals ConfirmationWindowFactory, GameEvents, TM, ITowns, Game */

define('events/grepolympia/controller/grepolympia_training', function() {
	'use strict';

	var GrepolympiaTrainingController,
		EventJsonTrackingController = require('controllers/common/event_json_tracking'),
		GrepolympiaTrainingView = require('events/grepolympia/views/grepolympia_training'),
		GrepolympiaWindowFactory = require('events/grepolympia/factories/grepolympia_window_factory'),
		LAURELS = 'laurels';

	GrepolympiaTrainingController = EventJsonTrackingController.extend({
		view: null,

		initialize: function (options) {
			//Don't remove it, it should call its parent
			EventJsonTrackingController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.model_discipline = this.getModel('grepolympia_discipline');
			this.model_athlete = this.getModel('grepolympia_athlete');
			this.model_grepolympia = this.getModel('grepolympia');
			this.model_player_ledger = this.getModel('player_ledger');
			this.collection_training_orders = this.getCollection('training_orders');

			if (this.model_discipline .getSecondsToTheEndOfDiscipline() > 0 ) {
				this.refresh_window_after = (this.model_discipline.getSecondsToTheEndOfDiscipline() + 1) * 1000;
				this.initializeDisciplineCountdown();
			}
			this.initializeView();
			this.registerListeners();
			return this;
		},

		registerListeners : function() {
			this.model_athlete.onTrainingBonusEndsAtChange(this, this.view._handleChangeTrainingBonusEndsAtEvent.bind(this.view));
			this.model_athlete.onTrainingPointsChange(this, this.view._updateTrainingPointsRelatedUi.bind(this.view));
			this.model_athlete.onExtraSlotCountChange(this, this.view.reRender.bind(this.view));
			this.collection_training_orders.onTrainingOrdersChange(this, this.view.reRender.bind(this.view));

			this.stopObservingEvent(GameEvents.town.town_switch);
			this.observeEvent(GameEvents.town.town_switch, function() {
				this.view.reRender();
			}.bind(this));

			this.stopObservingEvent(GameEvents.town.units.change);
			this.observeEvent(GameEvents.town.units.change, function() {
				this.view.reRender();
			}.bind(this));
		},

		initializeDisciplineCountdown : function() {
			var _self = this;
			TM.unregister('refresh_grepolympia_window');
			//Refresh window when discipline will change
			TM.once('refresh_grepolympia_window', _self.refresh_window_after, function() {
				_self.window_model.close();
				GrepolympiaWindowFactory.openWindow();
			});
		},

		initializeView: function () {
			this.view = new GrepolympiaTrainingView({
				controller: this,
				el: this.$el
			});
		},

		getActiveGrepolympiaDiscipline : function() {
			return this.model_discipline.getDiscipline();
		},

		getDisciplineEndsAt : function() {
			return this.model_discipline.getDisciplineEndsAt();
		},

		getCurrency : function() {
			return this.model_player_ledger.getCurrency(LAURELS);
		},

		isTraining : function() {
			return this.collection_training_orders.length;
		},

		getSlotData : function() {
			return this.collection_training_orders.models;
		},

		getExtraSlotCount : function() {
			return this.model_athlete.getExtraSlotCount();
		},

		getExtraSlotCosts : function() {
			return this.model_grepolympia.getExtraSlotCosts();
		},

		isBonusActive : function() {
			return this.model_athlete.isBonusActive();
		},

		buyBonus : function () {
			ConfirmationWindowFactory.openConfirmationGrepolympiaBuyBonus(
				this.getBonusCosts(),
				function() {
					this.model_athlete.buyBonus();
				}.bind(this)
			);
		},

		bonusDuration : function () {
			return this.model_grepolympia.getTrainingBonusDurationSeconds();
		},

		bonusPercentage: function () {
			return this.model_grepolympia.getTrainingBonusPercent();
		},

		getBonusCosts : function () {
			return this.model_grepolympia.getTrainingBonusCosts();
		},

		getTimestampBonusEndsAt : function() {
			return this.model_athlete.getTrainingBonusEndsAt();
		},

		getTimestampBonusStartsAt : function() {
			return this.model_athlete.getTrainingBonusStartsAt();
		},

		makeBonusInactive : function() {
			this.model_athlete.makeBonusInactive();
		},

		buySlot : function() {
			ConfirmationWindowFactory.openConfirmationGrepolympiaBuyTrainingSlot(
				this.getExtraSlotCosts()[this.getExtraSlotCount()],
				function() {this.model_athlete.buySlot();}.bind(this)
			);
		},

		increaseSkill : function(type) {
			this.model_athlete.increaseSkill(type);
		},

		resetSkills : function() {
			ConfirmationWindowFactory.openConfirmationGrepolympiaResetSkillpoints(
				this.getResetSkillsCosts(),
				function() {
					this.model_athlete.resetSkills();
				}.bind(this)
			);
		},

		getResetSkillsCosts : function() {
			return this.model_grepolympia.getResetSkillsCosts();
		},

		startTraining : function(unit_id, unit_count) {
			this.model_athlete.startTraining(unit_id, unit_count);
		},

		getTrainingPointsPerSkillpoint : function() {
			return this.model_athlete.getTrainingPointsPerSkillpoint();
		},

		getMaxTrainingPointsPerSkillpoint : function() {
			return this.model_athlete.getMaxTrainingPointsPerSkillpoint();
		},

		getAvailableTrainingPoints : function() {
			return this.model_athlete.getTrainingPoints();
		},

		getAthleteLevel : function () {
			return this.model_athlete.getCurrentLevel();
		},

		getSkillNames : function() {
			var disciplines = this.model_grepolympia.getDataDisciplines(),
				active_discipline = this.getActiveGrepolympiaDiscipline();
			return disciplines[active_discipline].skillnames;
		},

		getAvailableSkillPoints : function() {
			return this.model_athlete.getAvailableSkillPoints();
		},

		getSkillPoints : function(type) {
			return this.model_athlete.getSkillPoints(type);
		},

		getSkills : function() {
			return this.model_athlete.getSkills();
		},

		getScoreUnit : function() {
			var discipline_data = this.model_grepolympia.getDataDisciplines(),
				active_discipline_data = discipline_data[this.getActiveGrepolympiaDiscipline()];
			return active_discipline_data.score_unit;
		},

		/**
		 * Returns the decimal training bonus (20% -> 1.2)
		 * @returns int
		 */
		getTrainingBonusPercent : function() {
			return this.model_grepolympia.getTrainingBonusPercent() * 0.01;
		},

		getTrainingTimeForUnit : function(unit_id) {
			var training_data = this.model_grepolympia.getTrainingData(),
				unit_training_data = training_data[unit_id];
			return unit_training_data[2];
		},

		getSlotLimitForUnit : function(unit_id) {
			var training_data = this.model_grepolympia.getTrainingData(),
				unit_training_data = training_data[unit_id];
			return unit_training_data[1];
		},

		getTrainingPointsForUnit : function(unit_id, is_bonus_active) {
			var training_data = this.model_grepolympia.getTrainingData(),
				unit_training_data = training_data[unit_id],
				received_points = unit_training_data[0],
				bonus_factor = 1 + (is_bonus_active ? this.getTrainingBonusPercent() : 0);

			return Math.ceil(received_points * bonus_factor);
		},

		getGold : function() {
			return this.model_player_ledger.getGold();
		},

		canUnitBeUsedForTraining : function(unit_id) {
			var training_data = this.model_grepolympia.getTrainingData();
			return training_data && training_data[unit_id];
		},

		getUnitsForTraining : function() {
			var iunit_id,
				units_for_training = [],
				units = ITowns.getTown(Game.townId).units();

			for (iunit_id in units) {
				if (units.hasOwnProperty(iunit_id) && this.canUnitBeUsedForTraining(iunit_id) && units[iunit_id] > 0) {
					units_for_training.push({value : iunit_id, name : units[iunit_id]});
				}
			}

			return units_for_training;
		},

		getAthleteBoostActive : function() {
			return this.model_athlete.getAthleteBoostActive();
		},

        getAthleteBoostConfiguration : function() {
			return this.model_athlete.getAthleteBoostConfiguration();
		}
	});

	return GrepolympiaTrainingController;

});
