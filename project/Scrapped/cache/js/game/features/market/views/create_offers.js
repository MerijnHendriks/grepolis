
define('market/views/create_offers', function () {
	'use strict';

	var View = window.GameViews.BaseView;
	var GameDataBuildings = window.GameDataBuildings;

	return View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.has_market = options.has_market;
			this.l10n = this.controller.l10n;
			this.main_context = 'create_offer_market';
			this.render();
		},

		render : function() {
			if (this.has_market) {
				this.renderTemplate(this.$el, 'create_offer', {
					l10n: this.l10n
				});
				this.registerViewComponents();
			} else {
				this.renderTemplate(this.$el, 'no_building', GameDataBuildings.getNoBuildingTemplateData('market'));
			}
		},

		registerViewComponents : function() {
			this.registerCapacityBar(this.$el.find('.pb_trading_capacity'));
			this.registerRatioLabel(this.$el.find('.lbl_ratio'));
			this.registerTradeOfferSpinners(this.$el.find('.sp_trading_offer'), this.controller.updateRatio.bind(this.controller));
			this.registerTradeDemandSpinner(this.$el.find('.sp_trading_demand'), 3, this.controller.updateRatio.bind(this.controller));
			this.registerTradeLabel(this.$el.find('.lbl_offer'));
			this.registerTradeLabel(this.$el.find('.lbl_demand'));
			this.registerResourceDropdowns();
			this.registerTradingLifetime();
			this.registerVisibilityRadioButtons();
			this.registerSubmitOffer(this.$el.find('.btn_submit_offer'), function() {
				var params = {
					offer : this.sp_trading_offer.getValue(),
					offer_type : this.dropdownOffer.getValue(),
					demand : this.sp_trading_demand.getValue(),
					demand_type : this.dropdownDemand.getValue(),
					max_delivery_time : this.sp_lifetime.getTimeValueAsSeconds(),
					visibility : this.rbtn_visibility.getValue()
				};
				this.controller.makeOffer(params);
			}.bind(this));
		},

		registerRatioLabel : function(lbl_el) {
			this.unregisterComponent('lbl_ratio', this.main_context);
			this.lbl_ratio = this.registerComponent('lbl_ratio', lbl_el.label({
				caption : this.controller.getRatio(),
				template : 'tpl_label_shadow'
			}), this.main_context);
		},

		registerCapacityBar : function(progress_bar_el) {
			this.unregisterComponent('pb_trading_capacity', this.main_context);
			this.progressBar = this.registerComponent('pb_trading_capacity', progress_bar_el.singleProgressbar({
				value : (this.controller.getAvailableCapacity() < this.controller.getOffer()) ? 0 : (this.controller.getAvailableCapacity() - this.controller.getOffer()),
				max: this.controller.getMaxCapacity(),
				caption: this.l10n.capacity
			}), this.main_context);
		},

		registerTradeOfferSpinners : function(offer_trade_el, update) {
			this.unregisterComponent('sp_trading_offer', this.main_context);
			this.sp_trading_offer = this.registerComponent('sp_trading_offer', offer_trade_el.spinner({
				value : this.controller.getOffer(),
				step : 500,
				max : this.controller.getAvailableCapacity(),
				min : 0,
				tabindex : 1
			}).on('sp:change:value', function(e, new_val, old_val) {
				//Update progressbar
				this.controller.setOffer(new_val);
				var pb_bar = this.progressBar,
					pb_value = pb_bar.getValue(),
					pb_new_value = old_val - new_val;

				pb_bar.setValue(pb_value + pb_new_value);
				update();
			}.bind(this)), this.main_context);
		},

		registerTradeDemandSpinner : function(demand_trade_el, max_value, update) {
			this.unregisterComponent('sp_trading_demand', this.main_context);
			this.sp_trading_demand = this.registerComponent('sp_trading_demand', demand_trade_el.spinner({
				value : this.controller.getDemand(),
				step : 500,
				max : max_value * this.controller.getAvailableCapacity(),
				min : 0,
				tabindex : 2
			}).on('sp:change:value', function(e, new_val, old_val) {
				this.controller.setDemand(new_val);
				update();
			}.bind(this)), this.main_context);
		},

		registerTradeLabel : function(trade_label) {
			trade_label.label({});
		},

		registerSubmitOffer : function(submit_offer, callback) {
			this.unregisterComponent('btn_submit_offer', this.main_context);
			this.submit_offer = this.registerComponent('btn_submit_offer', submit_offer.button({
				caption : this.l10n.create_offer,
				tooltips: [
					{ title: '' },
					{ title: '' }
				]
			}).on('btn:click', callback), this.main_context);
		},

		registerResourceDropdowns : function() {

			this.unregisterComponent('dd_res_demand', this.main_context);
			this.dropdownDemand = this.registerComponent('dd_res_demand', this.$el.find('#dd_res_demand').dropdown({
				list_pos : 'center',
				hover : true,
				type : 'image',
				value : this.controller.getDemandType(),
				exclusions : [this.controller.getOfferType()],
				template : 'tpl_dd_resources',
				options : this.controller.getResourceOptions()
			}).on('dd:change:value', function(e, new_val, old_val) {
				this.controller.setDemandType(new_val);
				this.controller.updateRatio();
				this.controller.adjustSpinner();
			}.bind(this)), this.main_context);

			this.unregisterComponent('dd_res_offer', this.main_context);
			this.dropdownOffer = this.registerComponent('dd_res_offer', this.$el.find('#dd_res_offer').dropdown({
				list_pos : 'center',
				hover : true,
				type : 'image',
				value : this.controller.getOfferType(),
				template : 'tpl_dd_resources',
				options : this.controller.getResourceOptions()
			}).on('dd:change:value', function(e, new_val, old_val) {
				this.controller.setOfferType(new_val);
				this.dropdownDemand.setExclusions([new_val]);
				this.controller.setDemandType(this.dropdownDemand.getValue());
				this.controller.updateRatio();
				this.controller.adjustSpinner();
			}.bind(this)), this.main_context);
		},

		registerTradingLifetime : function() {
			this.unregisterComponent('sp_trading_lifetime', this.main_context);
			this.sp_lifetime = this.registerComponent('sp_trading_lifetime', this.$el.find('.sp_trading_lifetime').spinner({
				value : this.controller.getLifeTime(), step : '00:30:00', max : '48:00:00', min : '00:30:00', type : 'time', tabindex : 3
			}).on('sp:change:value', function(e, new_val, old_val) {
				this.controller.setLifeTime(new_val);
			}.bind(this)), this.main_context);
		},

		registerVisibilityRadioButtons : function() {
			 this.unregisterComponent('rbtn_visibility', this.main_context);
			 this.rbtn_visibility = this.registerComponent('rbtn_visibility', this.$el.find('.rbtn_visibility').radiobutton({
				 value : this.controller.getVisibility(),
				 options : this.controller.getVisibilityOptions()
			 }).on('click', '.option', function(e) {
				 var $target = $(e.currentTarget);
				 this.controller.setVisibility($target.attr('name'));
			 }.bind(this)), this.main_context);

			 if (!this.controller.hasAlliance()) {
				 //Disable last 2 options of the radiobutton if user is not in alliance
				 this.rbtn_visibility.disableOptions(['ally', 'pact', 'not_enemy']);
			 }

		},

		destroy : function() {

		}
	});
});
