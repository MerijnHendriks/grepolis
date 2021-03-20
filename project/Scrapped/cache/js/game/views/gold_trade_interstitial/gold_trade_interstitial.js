/*global us, Game */

(function() {
	'use strict';

	var View = window.GameViews.BaseView;
    var GameDataFeatureFlags = require('data/features');

	window.GameViews.GoldTradeInterstitialView = View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			var unlock_level = GameDataFeatureFlags.isPremiumExchangeEnabled() ?
                	Game.constants.market.needed_market_level_for_premium_exchange :
					Game.constants.market.min_market_level_for_trade;

			this.$el.html(us.template(this.controller.getTemplate('index'), {
				l10n : this.controller.getPreloadedL10n(),
				state : this.controller.getGoldTradingState(),
				unlock_level: unlock_level
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getPreloadedL10n();

			this.registerComponent('btn_go_to_market', this.$el.find('.btn_go_to_market').button({
				caption : l10n.button_caption
			}).on('btn:click', this.controller.onButtonClick.bind(this.controller)));
		},

		destroy : function() {

		}
	});
}());
