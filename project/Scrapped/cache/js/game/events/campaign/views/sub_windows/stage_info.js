/* globals GameDataHercules2014 */

define('events/campaign/views/sub_windows/stage_info', function (require) {
	'use strict';

	var View = window.GameViews.BaseView;
	var TooltipFactory = window.TooltipFactory;
	var GameDataPowers = window.GameDataPowers;
	var GameFeatures = require('data/features');

	var SubWindowStageInfoView = View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			this.$el.html(this.controller.getStageTooltip());

			this.initializeMercenaryTooltip();
			this.initializeMainRewardTooltip();
			this.initializeHeroRewardTooltip();
			this.initializeCultureRewardTooltip();
		},

		initializeMercenaryTooltip : function() {
			var controller = this.controller;

			this.$el.find('.mercenary .mercenary_image').each(function(idx, val) {
				var $el = $(val),
					type = $el.data('type');

				$el.tooltip(controller.getMercenaryTooltip(type), {}, false);
			});
		},

		/**
		 * bind tooltips to the (single) reward which must not be a "hero" or "culture" reward
		 */
		initializeMainRewardTooltip : function() {
			var reward = this.controller.getReward(),
				$el = this.$el.find('.reward.' + GameDataPowers.getCssPowerId(reward)),
				tooltip = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);

			$el.tooltip(tooltip);
		},

		/**
		 * bind custom tooltip for special hero
		 */
		initializeHeroRewardTooltip : function() {
			if (GameFeatures.areHeroesEnabled() && this.controller.window_controller.hasHeroReward()) {
				var $el = this.$el.find('.reward.hero');

				$el.tooltip(TooltipFactory.getHeroCard(GameDataHercules2014.getRewardHeroId(), {
					show_requirements: true, l10n: {
						exclusive_hero: this.l10n.onetime_once
					}
				}), {}, false);
			}
		},

		/**
		 * bind custom tooltip for culture level reward
		 */
		initializeCultureRewardTooltip : function() {
			var $el = this.$el.find('.reward.culture_level');

			$el.tooltip(this.l10n.onetime_culture + '<br><br><span style="color:red">' + this.l10n.onetime_once + '</span>', {
				width : 250
			});
		},

		destroy : function() {

		}
	});

	return SubWindowStageInfoView;
});
