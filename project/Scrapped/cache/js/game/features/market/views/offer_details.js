/*global us, Game, MM */

define('market/views/offer_details', function () {
	'use strict';

	var View = window.GameViews.BaseView;
	var GameDataMarket = window.GameDataMarket;

	return View.extend({

		$offer: null,
		$demand: null,

		btn_trade: null,

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();
			this.offer = this.controller.getModel('offer');
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'offer_details', {
				l10n: this.controller.getl10n(),
				offer: this.offer,
				custom_flag_color_html : this.offer.getCustomFlagColorInlineHtml()
			});

			this.unregisterComponents();
			this.registerViewComponents();

			this.$el.find('.alliance_name').on('click', '', function(e) {
				if (this.offer.getAllianceName() && this.offer.getAllianceId()) {
					window.Layout.allianceProfile.open(this.offer.getAllianceName(), this.offer.getAllianceId());
				}
			}.bind(this));
		},

		registerViewComponents : function() {
			this.registerButton();
			this.registerSlider();
			this.registerOfferTextbox();
			this.registerDemandTextbox();
		},

		registerButton: function() {
			var min_trading_sum = GameDataMarket.getMinTradingSum();

			this.btn_trade = this.controller.registerComponent('btn_trade', this.$el.find('.btn_trade').button({
				template: 'tpl_simplebutton_borders',
				caption: this.l10n.trade,
				tooltips : [{title: this.l10n.trade}, { title: this.l10n.min_trading_sum_no_premium(min_trading_sum)}]
			}).on('btn:click', this.handleTradeButtonClick.bind(this)));
		},

		updateButtonState : function() {
			var offer_value = parseInt (this.$offer.getValue(), 10) || 0,
				demand_value = parseInt (this.$demand.getValue(), 10) || 0,
				min_trading_sum = GameDataMarket.getMinTradingSum();

			if (offer_value < min_trading_sum || demand_value < min_trading_sum) {
				this.btn_trade.setState(true);
				this.btn_trade.disable();
			} else if ((offer_value <= 0 && demand_value <= 0) || (offer_value > this.offer.getOffer() && demand_value > this.offer.getDemand())) {
				this.btn_trade.setState(true);
				this.btn_trade.disable();
			} else {
				this.btn_trade.setState(false);
				this.btn_trade.enable();
			}
		},

		registerSlider: function() {
			this.slider = this.registerComponent('sl_trade_partial', this.$el.find('.slider').grepoSlider({
				max: this.offer.getDemand(),
				min: 100,
				step : 1,
				value : this.getCurrentPossibleTradeValue(),
				snap: true,
				disabled: false
			}).on('sl:change:value', this.updateAmounts.bind(this)));
		},

		getCurrentPossibleTradeValue : function() {
			var demand = this.offer.getDemand(),
				current_town_data = MM.getOnlyCollectionByName('Town').getCurrentTown(),
				available_trade_capacity = current_town_data.getAvailableTradeCapacity(),
				available_resources = current_town_data.getResources(),
				available_demand_type_resources = available_resources[this.offer.getDemandType()],
				min_value = Math.min(demand, available_trade_capacity),
				finale_min_value = Math.min(min_value, available_demand_type_resources),
				finale_value = Math.max(finale_min_value, 100);
			return finale_value;
		},

		getCurrentPossibleOfferValueFromDemand : function() {
			if (this.getCurrentPossibleTradeValue() === this.offer.getDemand()) {
				return this.offer.getOffer();
			}
			return Math.floor(this.getCurrentPossibleTradeValue() * this.offer.getRatio());
		},

		setOfferValue : function(value) {
			var possible_value = us.clamp(Game.constants.market.min_trading_sum, value, this.offer.getOffer()),
				demand = Math.floor(possible_value / this.offer.getRatio());

			this.$demand.setValue(demand, {silent: true});
			if (this.slider) {
				this.slider.setValue(demand, {silent: true});
			}
			if (value !== possible_value) {
				this.$offer.setValue(possible_value, {silent: true});
			}
			this.updateButtonState();
		},

		setDemandValue : function(value) {
			var possible_value = us.clamp(Game.constants.market.min_trading_sum, value, this.offer.getDemand()),
				offer = Math.floor(possible_value * this.offer.getRatio());

			this.$offer.setValue(offer, {silent: true});
			if (this.slider) {
				this.slider.setValue(possible_value, {silent: true});
			}
			if (value !== possible_value) {
				this.$demand.setValue(possible_value, {silent: true});
			}
			this.updateButtonState();
		},

		registerOfferTextbox : function() {
			this.$offer = this.registerComponent('txt_offer', this.$el.find('.offer').textbox({
				value : this.getCurrentPossibleOfferValueFromDemand(),
				disabled : false
			}).on('txt:change:value', function(e, value) {
				this.setOfferValue(value);
			}.bind(this)));
		},

		registerDemandTextbox : function() {
			this.$demand = this.registerComponent('txt_demand', this.$el.find('.demand').textbox({
				value : this.getCurrentPossibleTradeValue(),
				disabled : false
			}).on('txt:change:value', function(e, value) {
				this.setDemandValue(value);
			}.bind(this)));
		},

		updateAmounts: function(e, _sl, value) {
			// automatically triggers calculation of the offer textbox and button state (cf. registerDemandTextbox)
			this.$demand.setValue(value);
		},

		handleTradeButtonClick: function() {
			var trade = this.controller.trade.bind(this.controller, this.getAmount());

			trade();
		},

		/**
		 * For partial trades
		 * @returns {number} amount to trade
		 */
		getAmount: function() {
			return this.$demand.getValue();
		},

		destroy : function() {

		}
	});
});
