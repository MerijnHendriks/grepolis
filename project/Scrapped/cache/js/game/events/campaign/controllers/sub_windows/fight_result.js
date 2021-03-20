define('events/campaign/controllers/sub_windows/fight_result', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var GameEvents = window.GameEvents;
	var SubWindowFightResultView = require('events/campaign/views/sub_windows/fight_result');

	var SubWindowFightResultController = GameControllers.BaseController.extend({
		stage_id : null,
		fight_result_type : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.stage_id = options.stage_id;
			this.fight_result = options.fight_result;
			this.fight_result_type = options.fight_result_type;

			// when the Army model changes (which may happen after rendering),
			// we update the tooltips to reflect this
			this.getModel('campaign_player_army').onArmyChange(this, function() {
				if (this.view) {
					this.view.initializeMercenaryTooltip();
				}
			}.bind(this));
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowFightResultView({
				el : this.$el,
				controller : this
			});

			this.observeEvent(GameEvents.active_happening.reward.use, this.useReward.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.stash, this.stashReward.bind(this));
			this.observeEvent(GameEvents.active_happening.reward.trash, this.trashReward.bind(this));

			return this;
		},

		getStageRewardHtml : function() {
			return this.window_controller.getStageRewardHtml(this.stage_id);
		},

		useReward : function() {
			this.window_controller.useReward(this.stage_id);
		},

		stashReward : function() {
			this.window_controller.stashReward(this.stage_id);
		},

		trashReward : function() {
			this.window_controller.trashReward(this.stage_id);
		},

		getLastHonorPoints: function() {
			return this.getModel('campaign_ranking').getGainedPoints();
		},

		getStageId : function() {
			return this.stage_id;
		},

		getFightResultType : function() {
			return this.fight_result_type;
		},

		getLuck : function() {
			return this.window_controller.getLuckValue(this.stage_id);
		},

		getHeroValue : function() {
			return this.window_controller.getHeroValue(this.stage_id);
		},

		getReward : function() {
			return this.window_controller.getStageReward(this.stage_id)[0];
		},

		/**
		 * in case of defeat, return all rewards, including onetime bonus rewards,
		 * otherwise only the normal stage reward
		 */
		getRewards : function() {
			var stage_rewards = this.window_controller.getStageReward(this.stage_id),
				onetime_rewards = this.window_controller.getStageOnetimeReward(this.stage_id),
				did_not_win_this_stage_yet = this.window_controller.getStageLevel(this.stage_id) === 1;

			if (this.fight_result_type === 'defeat' && did_not_win_this_stage_yet) {
				return stage_rewards.concat(onetime_rewards);
			}

			return stage_rewards;
		},

		_getFightResultAmount : function(units, mercenary_type) {
			if (!units[mercenary_type]) {
				return {
					total: 0,
					damaged: 0,
					healthy: 0
				};
			}
			return {
				total: units[mercenary_type].amount_total,
				healthy: units[mercenary_type].amount_healthy,
				damaged: -1 * units[mercenary_type].amount_damaged
			};
		},

		/**
		 * given a mercenary_type returns the amount 'my army' has
		 * from the fight_result
		 * @param {String} mercenary_type
		 * @return {Object} amount
		 */
		getMyArmyUnitAmount : function(mercenary_type) {
			var units = this.fight_result.attackers;
			return this._getFightResultAmount(units, mercenary_type);
		},

		/**
		 * given a mercenary_type returns the amount 'enemy army' has for current stage
		 *
		 * @param {String} mercenary_type
		 * @return {Object} amount
		 */
		getEnemyArmyUnitAmount : function(mercenary_type) {
			var units = this.fight_result.defenders;
			return this._getFightResultAmount(units, mercenary_type);
		},

		/**
		 * get HTML from parent controller
		 * @param {Function} getAmountFunc
		 */
		getMercenariesBoxHtml : function(getAmountFunc, enemy) {
			return this.window_controller.getMercenariesBoxHtml(getAmountFunc, enemy);
		},

		/**
		 * passthrough for getMercenaryTooltip
		 */
		getMercenaryTooltip : function() {
			return this.window_controller.getMercenaryTooltip.apply(this.window_controller, arguments);
		},

		/**
		 * tell parent controller we want a rematch
		 */
		retryButtonClicked : function() {
			this.window_controller.reFightStage(this.stage_id);
		},

		destroy : function() {
			// if the user closes the subwindow, also make sure the context menu is empty
			$('#context_menu').empty();
		}
	});

	return SubWindowFightResultController;
});
