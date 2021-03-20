define('events/crafting/views/sub_windows/overall_rewards', function(require) {
	'use strict';

	var BaseView = window.GameViews.BaseView;
	var TooltipFactory = require('factories/tooltip_factory');

	var SubWindowEasterOverallRewardsView = BaseView.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			BaseView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('sub_window_overall_ranking'), {
				l10n : this.controller.getl10n(),
				rewards : this.controller.getRankingRewards(),
				getAward : this.controller.getRankingAward.bind(this.controller)
			}));

			this.initializeViewComponents();
		},

		initializeViewComponents : function() {
			var $viewport = this.$el.find('.js-viewport'),
				$list = this.$el.find('.js-list');

			//Initialize list
			this.controller.registerComponent('recipes_scrollbar', $viewport.skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'narrow',
				disabled: false,
				elements_to_scroll: $list,
				element_viewport: $viewport,
				scroll_position: 0,
				min_slider_size : 16
			}));

			this.initializeRewardsTooltips();
		},

		initializeRewardsTooltips : function() {
			var overall_rewards = this.controller.getOverallRankingRewards();

			for(var i = 0; i < overall_rewards.length; i++) {
				var rewards = overall_rewards[i];

				for(var j = 0; j < rewards.length; j++) {
					var reward = rewards[j].reward;
					var	template = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);

					this.$el.find('.js-reward-' + i + '-' + j).tooltip(template, {maxWidth: 400});
				}
			}

			this.$el.find('.js-award').each(function(index, el) {
				var $el = $(el);

				// data-award_id contains the level at the end (e.g. "demeter2016_ranking_overall_2"), therefore we need to strip the last 2 characters.
				var award_id = $el.data('award_id').slice(0,-2);

				$el.tooltip(TooltipFactory.getAwardTooltip(award_id));
			});
		},

		destroy : function() {

		}
	});

	window.GameViews.SubWindowEasterOverallRewardsView = SubWindowEasterOverallRewardsView;
	return SubWindowEasterOverallRewardsView;
});
