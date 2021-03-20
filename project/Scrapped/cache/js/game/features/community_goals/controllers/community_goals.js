define('features/community_goals/controllers/community_goals', function(require) {
	'use strict';

	var DM = require_legacy('DM');
	var controllers = window.GameControllers;
	var CommunityGoalsView = require('events/turn_over_tokens/views/community_goals');

	return controllers.TabController.extend({
		initialize : function(options) {
			controllers.TabController.prototype.initialize.apply(this, arguments);
			this.parent_controller = options.parent_controller;
			this.l10n = DM.getl10n('community_goals');
			this.goals_model = this.getModel('assassins_community_goals');
		},

		initializeView : function() {
			this.view = new CommunityGoalsView({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		renderPage : function(data) {
			this.initializeView();
		},

		registerEventListeners : function() {
			this.stopListening();
			this.goals_model.onTotalPointsChange(this, this.updateProgress.bind(this));
			this.goals_model.onGoalsChange(this, this.updateProgress.bind(this));
		},

		/**
		 * update the visual Progress, called after data recevied from BE
		 */
		updateProgress : function() {
			this.view.updateProgressbars();
		},

		/**
		 * @returns {number} how many points are currently archived
		 */
		getTotalPoints : function() {
			return this.goals_model.getTotalPoints();
		},

		/**
		 * @returns {number} the number of total points possible
		 */
		getPointsSumForAllLevel : function() {
			return this.goals_model.getPointsSumForAllLevel();
		},

		/**
		 * @returns {number} the number of points for every level
		 */
		getThresholdForLevel : function(level) {
			return this.goals_model.getThresholdForLevel(level);
		},

		/**
		 * @returns {Reward} _the first_ reward for a level
		 */
		getFirstRewardForLevel : function(level) {
			return this.goals_model.getRewardsForLevel(level)[0];
		},

		/**
		 * @returns {number} whenever a goal is reached we advance a level from 0 .. 4
		 */
		getLevel : function() {
			var fill_rates = this.getFillRateForPgBars(),
				level = -1;

			fill_rates.forEach(function (rate) {
				if (rate <= 0) {
					return;
				}
				level += 1;
			});

			return level;
		},

		/**
		 * @returns {array} with percentages of fill rate for every progressbar
		 */
		getFillRateForPgBars : function() {
			var ret = [],
				current = this.getTotalPoints(),
				found_end = false,
				goals = this.getGoals();

			// Rules for this algo:
			// Every progressbar to the right from the progressbar which contains the value is always 0 % full
			// Every progressbar to the left from the progressbar which contains the vaule is always 100% full
			//  - using reduce allows easy access to the previous values
			goals.reduce(function(prev_level_goal, level_goal, idx) {
				var threshold = level_goal.threshold;

				if (found_end || threshold === 0) {
					ret.push(-1);
					return threshold;
				}
				// if the level is completely full, shortcut
				if (current >= threshold) {
					ret.push(100);
				} else {
					// the level is somewhat full, calculate the exact percentage
					// and then stop calculating
					var cur = current - prev_level_goal,
						max = threshold - prev_level_goal;
					ret.push(Math.floor(cur / max * 100));
					found_end = true;
				}
				return threshold;
			}.bind(this), 0);

			return ret;
		},

		/**
		 * @returns {boolean} true if a reward for a level is enabled
		 */
		isRewardEnabled : function(level) {
			var threshold = this.getThresholdForLevel(level);

			if (threshold > 0 && this.getTotalPoints() >= threshold) {
				return true;
			}
			return false;
		},

		/**
		 * @returns {Reward} of the last reached community goal
		 */
		getLastReachedCommunityGoal: function() {
			var total_points = this.getTotalPoints(),
				goals = this.getGoals(),
				highest_archived_goal = goals[0];

			goals.forEach(function(goal) {
				if (goal.threshold > 0 && total_points >= goal.threshold) {
					 highest_archived_goal = goal;
				}
			});

			return highest_archived_goal;
		},

		getGoals: function () {
			return this.goals_model.getGoals();
		},

		/**
		 * checks if total points reach a goal and triggers an event for the last reached goal
		 */
		checkAndTriggerGoalReachedEvent : function() {
			var highest_archived_goal = this.getLastReachedCommunityGoal();

			$.Observer(window.GameEvents.community_goals.goal_reached).publish({
				 goal: highest_archived_goal,
				 reward: highest_archived_goal.rewards[0]
			});
		},

		destroy : function() {
		}
	});
});
