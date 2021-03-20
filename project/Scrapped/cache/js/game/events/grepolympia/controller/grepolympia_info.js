/*globals ConfirmationWindowFactory, TM, Timestamp */

define('events/grepolympia/controller/grepolympia_info', function(require) {
	'use strict';

	var GrepolympiaInfoController,
		EventJsonTrackingController = require('controllers/common/event_json_tracking'),
		GrepolympiaInfoView = require('events/grepolympia/views/grepolympia_info'),
		GrepolympiaWindowFactory = require('events/grepolympia/factories/grepolympia_window_factory'),
		EVENT_SKINS = require('enums/event_skins'),
		LAURELS = 'laurels',
		TUTORIAL_PLAYER_HINT = 'grepolympia_tutorial',
        GrepolympiaHelper = require('events/grepolympia/helpers/grepolympia');

	GrepolympiaInfoController = EventJsonTrackingController.extend({
		view: null,

		initialize: function (options) {
			//Don't remove it, it should call its parent
			EventJsonTrackingController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.model_discipline = this.getModel('grepolympia_discipline');
			this.model_player_ledger = this.getModel('player_ledger');
			this.model_discipline_ranking = this.getModel('grepolympia_discipline_ranking');
			this.model_grepolympia = this.getModel('grepolympia');
			this.model_athlete = this.getModel('grepolympia_athlete');
			this.collection_grepolympia_ranking = this.getCollection('grepolympia_rankings');

			if (this.model_discipline.getSecondsToTheEndOfDiscipline() > 0) {
				// we add a 1 second buffer to the refresh time to give all models / timestamps a chance to update
				// and avoid reloading the window in the wrong state
				this.refresh_window_after = (this.model_discipline.getSecondsToTheEndOfDiscipline() + 1) * 1000;
				this.initializeDisciplineCountdown();
			}

			this.initializeView();
			this.registerListeners();
			return this;
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
			this.view = new GrepolympiaInfoView({
				controller: this,
				el: this.$el
			});

			this.checkAndShowTutorial();
		},

		checkAndShowTutorial : function() {
			var tutorial_hint = this.getCollection('player_hints').getForType(TUTORIAL_PLAYER_HINT);
			if (!tutorial_hint.isHidden()) {
				this.openTutorialWindow();
				tutorial_hint.disable();
			}
		},

		openTutorialWindow : function() {
			this.openEventTutorialWindow(this.l10n.tutorial.title, this.getTutorialTemplate());
		},

		getTutorialTemplate : function() {
			var tutorial = this.l10n.tutorial,
				reset_skill_costs = this.getResetSkillsCosts(),
                window_args = this.getWindowModel().getArguments(),
                skin = window_args.window_skin ? window_args.window_skin : false,
				is_worldcup_skin = skin === EVENT_SKINS.GREPOLYMPIA_WORLDCUP;

			return us.template(this.getTemplate('tutorial'), {
				fixed_steps : tutorial.fixed_steps,
				tutorial_skills : tutorial.skills,
				page_info : this.l10n.page_info,
				step_1 : tutorial.step_1(this.model_discipline.getDisciplineDuration() / 3600),
				step_5 : tutorial.step_5(this.getParticipationIntervalDurationHours()),
				training_ground : this.l10n.training_ground,
				page_athlete : this.l10n.page_athlete,
				skills : this.l10n.skills,
				extra_slot_costs : this.getExtraSlotCosts(),
				attend : this.l10n.attend,
				laurels :  20 + ' ' + this.l10n.attend_info_popup.laurels, // should be a hardcoded value
				score : is_worldcup_skin ? 93 + 's' : 1250 + 'm', // should be a hardcoded value
				score_text : this.l10n.attend_info_popup.you_scored,
				current_best : is_worldcup_skin ? 66 + 's' : 1300 + 'm', // should be a hardcoded value
				current_best_text : this.l10n.attend_info_popup.previous_score,
				rank : 947 + '.', // should be a hardcoded value
				rank_text : this.l10n.attend_info_popup.your_rank,
				skill_reset : this.l10n.skills.reset_skills(reset_skill_costs),
                show_more_steps : is_worldcup_skin //todo remove when GD decides to use it in all skins
			});
		},

		registerListeners : function() {
			this.model_player_ledger.onLaurelsChange(this, this.view.setNewLaurelAmountToLaurelBox.bind(this.view));
			this.collection_grepolympia_ranking.onRankingChanges(this, function() {
				this.view.renderCurrentRankingTemplate();
				this.fetchPage(this.view.renderAllianceScoreTemplate.bind(this.view));
			}.bind(this));
		},

		getActiveGrepolympiaDiscipline : function() {
			return this.model_discipline.getDiscipline();
		},

		getDisciplineEndsAt : function() {
			return this.model_discipline.getDisciplineEndsAt();
		},

		getRewardEffectDuration : function() {
			return this.model_athlete.getRewardEffectDuration();
		},

		getScoreUnit : function() {
            var discipline_id = this.getActiveGrepolympiaDiscipline(),
                active_discipline_data = GrepolympiaHelper.getDisciplineDataByDisciplineId(discipline_id, this.model_grepolympia);
			return active_discipline_data.score_unit;
		},

		getDisciplineDescription: function() {
            var discipline_id = this.getActiveGrepolympiaDiscipline(),
				active_discipline_data = GrepolympiaHelper.getDisciplineDataByDisciplineId(discipline_id, this.model_grepolympia);
            return active_discipline_data.description;
		},

		getCurrency : function() {
			return this.model_player_ledger.getCurrency(LAURELS);
		},

		getGold : function() {
			return this.model_player_ledger.getGold();
		},

		getNextFreeParticipationAt : function() {
			return this.model_athlete.getNextFreeParticipationAt();
		},

		getResetSkillsCosts : function() {
			return this.model_grepolympia.getResetSkillsCosts();
		},

		getNumberOfTopAlliances : function() {
			return this.model_grepolympia.getNumberOfTopAlliances();
		},

		getCurrentRankingPosition : function() {
			var player_ranking_model = this.collection_grepolympia_ranking.models[0],
				position = 0;
			if (player_ranking_model) {
				position = player_ranking_model.getPosition();
			}
			return position;
		},

		getCurrentRankingScore : function() {
			var player_ranking_model = this.collection_grepolympia_ranking.models[0],
				score = 0;
			if (player_ranking_model) {
				score = player_ranking_model.getScore();
			}
			return score;
		},

		getRows : function() {
			return this.model_discipline_ranking.getRows();
		},

		hasFreeAttempt : function() {
			return this.model_athlete.hasFreeAttempt() || this.model_athlete.getNextFreeParticipationAt() <= Timestamp.now();
		},

		getParticipationIntervalDurationHours : function() {
			return this.model_athlete.getParticipationIntervalDuration() / 3600;
		},

		getExtraAttemptCost : function() {
			return this.model_athlete.getCalculatedParticipationCosts();
		},

		getExtraSlotCosts : function() {
			return this.model_grepolympia.getExtraSlotCosts();
		},
        /**
         * Check if alliance reward is "high percentage power" to decide which tooltip value range to show
         *
         * @param power
         * @return boolean
         **/
        isHighPercentagePower : function(power) {
            return power.meta_defaults.percent === 10;
        },

		getDisciplineAwards : function() {
			return this.model_athlete.getDisciplineAwards();
		},

		getDisciplineRewardId : function() {
			return this.model_athlete.getDisciplineReward();
		},

		fetchPage : function(callback) {
			var source = 'alliance',
				filter = this.getActiveGrepolympiaDiscipline();
			this.model_discipline_ranking.fetchPage(source, filter, false, false, callback);
		},

		participate : function(callback) {
			if (this.hasFreeAttempt()) {
				this.model_athlete.doAttempt(callback);
			} else if (this.getGold() < this.getExtraAttemptCost()) {
				this.view.showBuyGoldPopup();
			} else {
				this.buyAttempt(callback);
			}
		},

		buyAttempt : function(callback) {
			ConfirmationWindowFactory.openConfirmationGrepolympiaBuyAttempt(
				this.getExtraAttemptCost(),
				function() {
					this.model_athlete.buyAttempt(callback);
				}.bind(this)
			);
		}
	});

	return GrepolympiaInfoController;
});
