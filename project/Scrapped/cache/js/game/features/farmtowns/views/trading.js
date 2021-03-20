/* global readableUnixTimestamp */

define('farmtowns/views/trading', function () {
	'use strict';

	var DateHelper = require('helpers/date');
	var Timestamp = require('misc/timestamp');

	var FarmTownBase = require('farmtowns/views/farm_town_base'),
		MAX_OFFER_VALUE = 3000,
		MIN_OFFER_VALUE = 100,
		SPINNER_STEPS = 100;

	var Features = require('data/features');

	return FarmTownBase.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			FarmTownBase.prototype.initialize.apply(this, arguments);
			this.controller = options.controller;
			this.type = options.type;
			this.l10n = this.controller.l10n;
			this.has_market = options.has_market;
			this.main_context = 'farmtown_trading';
		},

		render : function() {
			this.renderTemplate(this.$el.find('.action_wrapper'), 'trading', {
				l10n: this.controller.getl10n()
			});
			this.$el.find('.action_description').text(this.controller.getl10n().tabs_title.trade);
			this.registerViewComponents();
			this.createResourceOfferBox(this.$el.find('.action_wrapper .trade_you_pay .resource'));
			this.createResourceDemandBox(this.$el.find('.action_wrapper .trade_you_get .resource'));
			this.prepareNeededData();

			this.removeBanner();

			if (!this.controller.hasMarket()) {
				this.showCurtain();
				this.showBanner('trade');
			}

			this.controller.updateHymnToAphroditeOutput();
		},

		prepareNeededData : function() {
			var offer_value = this.getComponent('sp_trading_offer', this.main_context).getValue();
			this.controller.updateDemandRatio();
			var state = this.controller.isTradeAllowed(offer_value);
			this.controller.setButtonTradeState(state.status, state.message);
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n();

			this.controller.prepareOfferSpinnerOnLoad();
			this.registerCapacityBar(this.$el.find('.action_wrapper  .bpv_capacity_bar'));
			this.registerRatioLabel(this.$el.find('.action_wrapper .trade_ratio'));
			this.registerTradeOfferSpinners(this.$el.find('.action_wrapper .bpv_trading_offer'));
			this.registerTradeDemandSpinner(this.$el.find('.action_wrapper .bpv_trading_demand'));
			this.registerTradeLabel(this.$el.find('.action_wrapper .you_pay_text'));
			this.registerTradeLabel(this.$el.find('.action_wrapper .you_get_text'));

			if (Features.battlepointVillagesEnabled()){
				this.registerHymnToAphroditeBonus(this.$el.find('.action_wrapper .hymn_to_aphrodite_trade_output'));
			}

			this.registerTimerArrivalTime();
			this.updateRuntimes();

			this.unregisterComponent('btn_trade', this.main_context);
			this.registerComponent('btn_trade', this.$el.find('.action_wrapper .btn_trade').button({
				caption : l10n.trade
			}).on('btn:click', function() {
				this.controller.doTrade(this.getComponent('sp_trading_offer', this.main_context).getValue());
			}.bind(this)), this.main_context);
		},

		registerRatioLabel : function(lbl_el) {
			this.unregisterComponent('lbl_ratio', this.main_context);
			this.lbl_ratio = this.registerComponent('lbl_ratio', lbl_el.label({
				caption : '1:' + this.controller.getRatio(),
				template : 'tpl_label_shadow'
			}), this.main_context);
		},

		createResourceOfferBox : function(elem) {
			var offer = this.controller.getResourceOffer();
			elem.addClass(offer);
		},

		createResourceDemandBox : function(elem) {
			var demand = this.controller.getResourceDemand();
			elem.addClass(demand);
		},

		registerCapacityBar : function(progress_bar_el) {
			this.unregisterComponent('pb_trading_capacity', this.main_context);
			this.progressBar = this.registerComponent('pb_trading_capacity', progress_bar_el.singleProgressbar({
				value : (this.controller.getAvailableCapacity() < this.controller.getOffer()) ? 0 : (this.controller.getAvailableCapacity() - this.controller.getOffer()),
				max: this.controller.getMaxCapacity(),
				caption: this.l10n.capacity
			}), this.main_context);
		},

		registerTradeOfferSpinners : function(offer_trade_el) {
			this.unregisterComponent('sp_trading_offer', this.main_context);
			this.sp_trading_offer = this.registerComponent('sp_trading_offer', offer_trade_el.spinner({
				value : this.controller.getOffer(),
				step : SPINNER_STEPS,
				max : MAX_OFFER_VALUE,
				min : 0,
				tabindex : 1,
				disabled : this.controller.getAvailableCapacity() < MIN_OFFER_VALUE
			}).on('sp:change:value', function(e, new_val, old_val) {
				//Update progressbar
				var pb_bar = this.progressBar,
					pb_value = pb_bar.getValue(),
					pb_new_value = old_val - new_val;

				pb_bar.setValue(pb_value + pb_new_value);
				this.controller.updateDemandRatio();

				if (Features.battlepointVillagesEnabled()) {
					this.controller.updateHymnToAphroditeOutput();
				}

				this.checkForEnablingDisablingSpinner();
			}.bind(this)), this.main_context);
		},

		registerTradeDemandSpinner : function(demand_trade_el) {
			this.unregisterComponent('sp_trading_demand', this.main_context);
			this.sp_trading_demand = this.registerComponent('sp_trading_demand', demand_trade_el.spinner({
				value : this.controller.getDemand(),
				step : SPINNER_STEPS,
				max : this.controller.getRatio() * this.getComponent('sp_trading_offer', this.main_context).getMax(),
				min : 0,
				tabindex : 2,
				disabled : this.getComponent('sp_trading_offer', this.main_context).hasClass('disabled')
			}).on('sp:change:value', function(e, new_val) {
				this.controller.updateOfferRatio();
				this.checkForEnablingDisablingSpinner();
			}.bind(this)), this.main_context);
		},

		registerTradeLabel : function(trade_label) {
			trade_label.label({});
		},

		registerHymnToAphroditeBonus : function (el) {

			var hymnToAphroditeOutput = this.controller.getHymnToAphroditeOutput();

			if (hymnToAphroditeOutput) {
				el.tooltip(this.l10n.tooltips.hymn_to_aphrodite);
			}

			el.text(hymnToAphroditeOutput);
		},

		/**
		 * if the offer is set to 0 (if it is less then 100) disable both spinner,
		 * else enable them
		 */
		checkForEnablingDisablingSpinner : function() {
			if(this.controller.getOffer() >= MIN_OFFER_VALUE) {
				this.getComponent('sp_trading_offer', this.main_context).enable();
				this.getComponent('sp_trading_demand', this.main_context).enable();
			}
			else if(this.controller.getOffer() < MIN_OFFER_VALUE && this.controller.getAvailableCapacity() < MIN_OFFER_VALUE) {
				this.getComponent('sp_trading_offer', this.main_context).disable();
				this.getComponent('sp_trading_demand', this.main_context).disable();
			}
		},

		registerTimerArrivalTime : function() {
			this.controller.unregisterTimers();
			this.controller.registerTimer('arrival_timer', 1000, this.updateRuntimes.bind(this));
		},

		// update the duration and arrival time
		updateRuntimes : function() {
			 var runtime = this.controller.getTradeDuration(),
				 $way_duration = this.$el.find('.action_wrapper .way_duration'),
				 $arrival_time = this.$el.find('.action_wrapper .arrival_time');

			 $way_duration.text('~' + DateHelper.readableSeconds(runtime));
			 $arrival_time.text('~' + readableUnixTimestamp(Timestamp.now() + runtime));
			 $arrival_time.tooltip(this.l10n.arrival_time);
			 $way_duration.tooltip(this.l10n.way_duration);
		},

		// Used intentionally for the cards
		destroy : function() {
			//do not remove -> needed because this view does not get destroyed by the controller
			this.stopListening();
			this.removeBanner();
		}
	});
});
