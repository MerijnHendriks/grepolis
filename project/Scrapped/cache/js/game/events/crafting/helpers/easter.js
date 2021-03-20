/*globals HelperPlayerHints, EasterWindowFactory, WM, MM, DM */

define('events/crafting/helpers/easter', function(require) {
	'use strict';

	var BenefitHelper = require('helpers/benefit');
	var CRAFTING = 'crafting';

	var HelperEaster = {
		dropped_ingredients_collection : null,

		getSkinl10n: function() {
			var skin = BenefitHelper.getBenefitSkin(),
				skin_translation = DM.getl10n(skin),
				shared_crafting_translation = DM.getl10n(CRAFTING);

			return $.extend(true, shared_crafting_translation, skin_translation);
		},

		getEasterl10nForSkin: function () {
			var skin_l10n = this.getSkinl10n();
			return skin_l10n.easter;
		},

		getEasterCollectl10nForSkin: function () {
			var skin_l10n = this.getSkinl10n();
			return skin_l10n.easter_collect;
		},

		getInterstitialSkinl10n: function(type) {
			var skin_l10n = this.getSkinl10n();
			return skin_l10n[type];
		},

		/**
		 * Register showing collecting window
		 *
		 * @return {void}
		 */
		registerEvent : function() {
			this.initializeEvent();
		},

		/**
		 *  init collection and event handler
		 */
		initializeEvent : function() {
			this.initializeGiftsCollection();
			this.initializeGiftsCollectionWindow();
		},

		/**
		 * initialize on add handler to open collect window
		 */
		initializeGiftsCollectionWindow : function() {
			HelperEaster.dropped_ingredients_collection.on('add', HelperEaster.checkAndDisplayCollectWindow.bind(this));
		},

		/**
		 * register dropped ingredients collection
		 */
		initializeGiftsCollection : function() {
			HelperEaster.dropped_ingredients_collection = new window.GameCollections.EasterDroppedIngredients();
			WM.markPersistentData('collections', 'EasterDroppedIngredients');
			MM.addCollection(HelperEaster.dropped_ingredients_collection);
		},

		/**
		 * show collected ingredient window if player hint is enabled
		 */
		checkAndDisplayCollectWindow : function() {
			if ( HelperPlayerHints.isHintEnabled('easter_collect') ) {
				EasterWindowFactory.openEasterCollectWindow();
			}
			this.showAnimationOnEventIcon();
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

			if (!WM.isOpened('easter')) {
				// update counter
				var curr_amount = parseInt(amount.html(), 10) || 0;
				amount
					.html(curr_amount + 1)
					.show();
			}
		},

		resetAmountBadge : function() {
			$('#happening_large_icon .amount').html(0).hide();
		}
	};

	window.HelperEaster = HelperEaster;
	return HelperEaster;
});
