/* global us, GameDataPowers */
(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;
	var TooltipFactory = require('factories/tooltip_factory');

	var SubWindowCampaignDailyRewardsView = BaseView.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			BaseView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		render : function() {
			var daily_reward = this.controller.getDailyRankingReward();
			var reward = daily_reward.reward;
			var daily_award_id = this.controller.getDailyRankingAward();

			this.$el.html(us.template(this.controller.getTemplate('sub_window_daily_ranking'), {
				l10n : this.controller.getl10n(),
				daily_award : daily_award_id,
				daily_reward : GameDataPowers.getRewardCssClassIdWithLevel(reward),
				daily_reward_amount : daily_reward.amount,
				reward_name : this.controller.getRewardName()
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
			var daily_reward = this.controller.getDailyRankingReward();
			var reward = daily_reward.reward;
			var	template = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);
			var daily_award_id = this.controller.getDailyRankingAward();

			this.$el.find('.js-reward').tooltip(template, {maxWidth: 400});
			this.$el.find('.award_box .award').tooltip(TooltipFactory.getAwardTooltip(daily_award_id));
		},

		destroy : function() {

		}
	});

	window.GameViews.SubWindowCampaignDailyRewardsView = SubWindowCampaignDailyRewardsView;
}());
