/* global WM, MM, us */

(function() {
	'use strict';

	var Hercules2014WindowFactory = window.Hercules2014WindowFactory;

	var HelperHercules2014 = {
		gifts_collection : null,

		/**
		 * register gifts collection
		 *
		 * @returns {Boolean}
		 */
		_initializeGiftsCollection : function() {
			this.gifts_collection = new window.GameCollections.CampaignDroppedUnits();

			WM.markPersistentData('collections', 'CampaignDroppedUnits');
			MM.addCollection(this.gifts_collection);
		},

		/**
		 * Register showing collecting window
		 *
		 * @return {void}
		 */
		registerEvent : function(models, collections) {
			this._initializeGiftsCollection();

			this.gifts_collection.onReceivingUnit(function() {
				var hint = collections.player_hints.getForType('hercules2014_collect');

				//Show this window only if user wants it
				if (!hint.isHidden()) {
					Hercules2014WindowFactory.openCollectWindow();
				}
				this.showAnimationOnEventIcon();
			}.bind(this));

			$('#happening_large_icon').click(this.resetAmountBadge);
		},

		showAnimationOnEventIcon : function() {
			var icon = $('#happening_large_icon'),
				notification = icon.find('.notification'),
				amount = icon.find('.amount'),
				reset = function() {
					notification.css({'opacity': 1, y: 0}).hide();
				};

			// animate head
			notification.show().transition({
				y: '-50px',
				opacity: 0
			}, 3000, 'ease', reset);

			// update counter
			var curr_amount = parseInt(amount.html(), 10) || 0;
			amount
				.html(curr_amount + 1)
				.show();
		},

		resetAmountBadge : function() {
			$('#happening_large_icon .amount').html(0).hide();
		},

		/**
		 * Returns an object listing how many units of a certain type got dropped
		 * @returns {{}}
		 */
		getCombinedDroppedUnits : function() {
			var dropped_units = this.gifts_collection.getDroppedUnits(),
				units, combined_units = {};

			for(var i = 0, l = dropped_units.length; i < l; i++) {
				units = dropped_units[i].getUnits();

				for (var unit_id in units) {
					if (units.hasOwnProperty(unit_id)) {
						if (!combined_units[unit_id]) {
							combined_units[unit_id] = 0;
						}

						combined_units[unit_id] += units[unit_id];
					}
				}
			}

			return combined_units;
		},

		/**
		 * Returns the accumulated amount of received units
		 * @returns {number}
		 */
		getTotalAmountOfDroppedUnits : function() {
			var sum = function(a,b) {return a+b;};
			return us.values(this.getCombinedDroppedUnits()).reduce(sum, 0);
		},

		/**
		 * The attack window shows the 'healthy' units in the same place as the 'total'
		 * units on the main screen, this function flips the two amounts for display
		 *
		 * @param {Function} decoratedFunc function to call to get the real amounts
		 * @returns {Function} decorated Function which flips
		 */
		flipTotalAndHealthyAmountsDecorator : function(decoratedFunc) {
			return function(mercenary_type) {
				var orig_amount = decoratedFunc(mercenary_type);
				return {
					total: orig_amount.healthy,
					healthy: orig_amount.total,
					damaged: orig_amount.damaged
				};
			};
		}

	};

	window.HelperHercules2014 = HelperHercules2014;
}());
