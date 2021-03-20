/* globals GameData */

define('farmtowns/views/cards', function () {
	'use strict';

	var FarmTownBase = require('farmtowns/views/farm_town_base');
	var CARDS = 4;
	var FarmTownTabs = require('features/farmtowns/enums/farm_town_tabs');
	var UNITS = ['sword', 'slinger', 'archer', 'hoplite'];
	var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
	var DateHelper = require('helpers/date');

	return FarmTownBase.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			FarmTownBase.prototype.initialize.apply(this, arguments);

			this.controller = options.controller;
			this.type = options.type;
			this.l10n = this.controller.getl10n();
			this.sub_context = options.sub_context;
		},

		/**
		 * Renders all 4 cards
		 */
		render : function() {
			var i;
			this.$el.find('.action_wrapper').empty();
			this.$el.find('.action_description').text(this.controller.getl10n().tabs_title[this.type]);

			if(this.type === FarmTownTabs.RESOURCES) {
				for (i=1; i <= CARDS; i++) {
					this.renderCard(i, this.controller.getClaimResourceValues()[i-1], this.controller.getClaimTimesResources()[i-1], null);
				}
			} else {
				for (i=1; i <= CARDS; i++) {
					this.renderCard(i, this.controller.getClaimUnits()[UNITS[i-1]], this.controller.getClaimTimesUnits()[UNITS[i-1]], UNITS[i-1]);
				}
			}

			if (!this.controller.isLootable()) {
				this.showBanner('loot');
			}
		},

		reRenderButtons: function() {
			for (var index=1; index <= CARDS; index++) {
				this.registerCardButton(index);
				if (this.type === FarmTownTabs.RESOURCES) {
					this.registerCardTooltips(index, this.controller.getClaimResourceValues()[index-1], this.controller.getClaimTimesResources()[index-1], null);
				} else {
					this.registerCardTooltips(index,  this.controller.getClaimUnits()[UNITS[index-1]], this.controller.getClaimTimesUnits()[UNITS[index-1]], UNITS[index - 1]);
				}
			}
		},

		/**
		 * locks all cards / shows curtain
		 */

		/**
		 * Renders a card showing all infos + button for a claim
		 *
		 * @param index - number of card (1 based)
		 * @param count - number of resources/units
		 * @param time - time until claim arrives
		 * @param icon - unit icon type
		 */
		renderCard : function(index, count, time, icon) {
			var $el = this.$el,
				is_loot_running = !this.controller.isLootable(),
				is_card_locked = this.controller.isCardLocked(this.type, index),
				display_time = DateHelper.readableSecondsWithLabels(time, DateHelper.SHORT_LABEL_TYPE),
				card = this.getTemplate('card', {
					l10n: this.l10n,
					card_type: this.type,
					index: index,
					count: count,
					icon_type: icon,
					locked : is_loot_running,
					card_locked : is_card_locked,
					locked_text : is_card_locked ? this.l10n.locked_card(this.type, this.controller.getBuildingDependencies(this.type, index).level) : '',
					time: display_time
				});

			$el.find('.action_wrapper').append(card);

			this.registerCardButton(index);
			this.registerCardTooltips(index, count, time, icon);
		},

		registerCardButton : function(index) {
			var is_loot_running = !this.controller.isLootable(),
				is_card_locked = this.controller.isCardLocked(this.type, index);

			var $btn = this.$el.find('.action_wrapper .btn_claim_'+this.type).eq(index-1), // take the nth card
				claim_button = $btn.button({
					disabled: is_loot_running || is_card_locked,
					state: is_loot_running || is_card_locked,
					caption: this.type === FarmTownTabs.RESOURCES ? this.l10n.collect : this.l10n.accept
				}),
				$claim_card = this.$el.find('.action_wrapper .card_click_area').eq(index-1);

			$claim_card.on('click', function() {
				if(claim_button.isDisabled()) {
					return;
				}
				this.showCurtain();

				if(this.type === 'resources') {
					var claimResourceValue = this.controller.getClaimResourceValues();
					var resource_data = {
						wood : claimResourceValue[index-1],
						stone : claimResourceValue[index-1],
						iron : claimResourceValue[index-1]
					};
					ConfirmationWindowFactory.openConfirmationWastedResources(function() {
						this.controller.doClaim(this.type, index);
					}.bind(this), function() {
						this.hideCurtain();
					}.bind(this), resource_data);
				} else {
					this.controller.doClaim(this.type, index);
				}

			}.bind(this));
			this.unregisterComponent('btn_claim_' + this.type + '_' + index, this.sub_context);
			this.registerComponent('btn_claim_' + this.type + '_' + index, claim_button, this.sub_context);
		},

		registerCardTooltips: function(index, count, time, icon) {
			var $claim_card = this.$el.find('.action_wrapper .card_click_area').eq(index-1),
				$html = $('<div>');

			this.renderTemplate($html, 'claim_tooltip', {
					 l10n: this.l10n.tooltips,
					 cooldown: DateHelper.readableSeconds(time),
					 amount: count,
					 type: this.type,
					 unit_name: icon ? GameData.units[icon].name : ''
			});

			$claim_card.tooltip($html);
		},

		destroy : function() {
			//do not remove -> needed because this view does not get destroyed by the controller
			this.stopListening();
		}
	});
});
