/*global TooltipFactory */

(function () {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var ValentinesDayCollectView = BaseView.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			BaseView.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			var l10n = this.controller.getl10n();

			this.$el.html(us.template(this.controller.getTemplate('welcome_screen'), {
				l10n : l10n,
				event_type_css_class : 'valentinesday_collect'
			}));

			this.$el.find('.yellowBox').includeTemplate('generic_box');

			this.$el.find('.description').after('<div class="your_reward">' + l10n.your_reward + '</div><div class="small_divider"></div><div class="scroll"><div class="' + this.controller._getIconClassName() + '"></div></div>');

			this.$el.find('.power_icon60x60').on('click', this.controller.handleCastingSpell.bind(this.controller));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n();
			var reward = this.controller.getReward();

			this.controller.registerComponent('btn_start', this.$el.find('.btn_start').button({
				caption : l10n.btn_caption
			}).on('btn:click', this.controller.handleCastingSpell.bind(this.controller)));

			var	template = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);

			this.$el.find('.power_icon60x60').tooltip(template, {maxWidth: 400});
		},

		destroy : function() {

		}
	});

	window.GameViews.ValentinesDayCollectView = ValentinesDayCollectView;

	return ValentinesDayCollectView;
}());
