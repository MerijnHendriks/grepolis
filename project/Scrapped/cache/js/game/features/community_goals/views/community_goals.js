/* global numberToLocaleString */

define('events/turn_over_tokens/views/community_goals', function(require) {
	'use strict';

	var TooltipFactory = require_legacy('TooltipFactory');
	var View = window.GameViews.BaseView;

	return View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'goals', {
				l10n: this.l10n,
				level : this.controller.getLevel()
			});

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			this.registerProgressbars();
			this.enableActiveRewards();
			this.registerInfoButton();
			this.bindRewardTooltips();
		},

		registerProgressbars : function() {
			var fill_rates = this.controller.getFillRateForPgBars(),
				total_points = this.controller.getTotalPoints(),
				sub_context = 'goals_progress';

			this.unregisterComponents(sub_context);

			this.$el.find('.single-progressbar').each(function(idx, el) {
				var fill_rate = fill_rates[idx],
					template = 'tpl_pb_single',
					show_value = false,
					caption = this.l10n.calculating,
					tooltip = caption,
					threshold = this.controller.getThresholdForLevel(idx),
					is_valid_goal = threshold > 0 && fill_rate >= 0;

				if (is_valid_goal) {
					show_value = true;
					template = 'tpl_pb_community_goal_element';
					caption = numberToLocaleString(threshold);
					tooltip = this.l10n.progress_tooltip(total_points, threshold);
				}

				this.registerComponent('pg_' + idx, this.$el.find('.progress_' + idx).singleProgressbar({
					value: fill_rate,
					max: 100,
					caption: caption,
					animate: false,
					template: template,
					format_locale: true,
					show_value: show_value
				}), sub_context);

				this.registerComponent('pg_tooltip' + idx, this.$el.find('.progress_' + idx + ' .caption').tooltip(
					tooltip
				), sub_context);

				if (!is_valid_goal) {
					return false;
				}
			}.bind(this));
		},

		/**
		 * activate all reached reward icons
		 */
		enableActiveRewards : function() {
			this.$el.find('.reward').each(function(idx, el) {
				if (this.controller.isRewardEnabled(idx)) {
					var $el = $(el);
					$el.removeClass('disabled');
				}
			}.bind(this));
		},

		/**
		 * bind all tooltips for the rewards
		 */
		bindRewardTooltips : function(level) {
			this.$el.find('.reward').each(function(idx, el) {
				var reward = this.controller.getFirstRewardForLevel(idx),
					$el = this.$el.find('.reward.reward_' + idx),
					tooltip = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);

				$el.tooltip(tooltip);
			}.bind(this));
		},

		/**
		 * it is actually no button, but just a tooltip hover thing
		 */
		registerInfoButton : function() {
			this.$el.find('.info').tooltip(this.l10n.infobutton_tooltip, { width: 400 });
		},

		/**
		 * update all progressbars with new values
		 */
		updateProgressbars: function() {
			var fill_rates = this.controller.getFillRateForPgBars();
			this.$el.find('.single-progressbar').each(function(idx, el) {
				var pg_bar = this.getComponent('pg_' + idx);
				if (pg_bar && typeof pg_bar.setValue === 'function') {
					pg_bar.setValue(fill_rates[idx]);
				}
			}.bind(this));

			this.enableActiveRewards();
			this.updateProgressbarLevel();
			this.registerProgressbars();
		},

		/**
		 * when a goal is reached the progressbar changes it color, expressed by the lvl class
		 * this function removes all levels and sets the correct current one
		 */
		updateProgressbarLevel : function() {
			var $pg_container = this.$el.find('.progress_container');

			$pg_container.removeClass('lvl_-1');

			this.$el.find('.single-progressbar').each(function(idx, el) {
				$pg_container.removeClass('lvl_' + idx);
				$pg_container.addClass('lvl_' + this.controller.getLevel());
			}.bind(this));
		},

		destroy : function() {

		}
	});
});

