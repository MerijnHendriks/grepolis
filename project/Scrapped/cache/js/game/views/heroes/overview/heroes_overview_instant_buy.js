/* global DateHelper */

(function() {
	'use strict';

	var HeroesOverview = window.GameViews.HeroesOverview;
	var GameDataInstantBuy = window.GameDataInstantBuy;

	var HeroesOverviewInstantBuy = HeroesOverview.extend({

		_sub_context: 'instant_buy_tooltip',

		getStrategyName : function() {
			return 'instant_buy';
		},

		/**
		 * Initializes the instant buy button and all related timers.
		 * Called once for every hero.
		 *
		 * @param $el	the instant_buy button dom element
		 * @param hero	the corresponding hero
		 */
		initializePremiumButton : function($el, hero) {
			// set up button and onclick action
			var btn = this._registerPremiumButton($el, hero);
			// update softcapped prices in certain intervals
			this._initializePremiumButtonUpdateTimer(btn, hero);
			// check if instant buy is blocked in certain intervals
			this._initializePremiumButtonBlockCheckTimer(btn, hero);

			this.controller.registerFeatureBlockingUpdates(
				this._initializePremiumButtonBlockCheckTimer.bind(this, btn, hero));

			this._initializePremiumButtonTooltip(btn, hero);
		},

		_initializePremiumButtonTooltip : function($btn, hero) {
			var hero_id = $btn.data('heroid');

			this.controller.unregisterComponent('instant_buy_tooltip_' + hero_id);

			var instant_buy_tooltip = this.controller.registerComponent('instant_buy_tooltip_' + hero_id, $btn.instantBuyTooltip({
				template : this.controller.getTemplate('tooltip_with_arrow'),
				selector: null
			}));

			instant_buy_tooltip
				.on('ibt:load:data', this._loadDataToTooltip.bind(this, hero))
				.on('ibt:destroy', this.controller.unregisterComponents.bind(this.controller, this._sub_context));
		},

		_loadDataToTooltip : function(hero, e, _ibt, $content) {
			this.controller.unregisterComponents(this._sub_context);

			var tooltip_content_template = this.controller.getTemplate('instant_buy_tooltip');

			$content.html(us.template(tooltip_content_template, {
				l10n : this.l10n.instant_buy,
				completion_time: DateHelper.formatDateTimeNice(hero.getCuredAt(), true)
			}));

			var $progressbar = $content.find('.js-item-progressbar');

			this.controller.registerComponent('healing_tooltip_progressbar_' + hero.getId(),
				$progressbar.singleProgressbar(
					GameDataHeroes.getSettingsForHeroInjuredProgressbar(hero)),
				this._sub_context);
		},

		_initializePremiumButtonUpdateTimer : function(btn, hero) {
			var callback = this._updatePremiumButton.bind(this, btn, hero);
			this.controller._registerUpdatePremiumButtonsCaptionsTimer(hero, callback);
		},

		_initializePremiumButtonBlockCheckTimer : function(btn, hero) {
			var callback = this._updatePremiumButton.bind(this, btn, hero);
			this.controller._registerUpdatePremiumButtonBlockingTimer(hero, callback);
		},

		_updatePremiumButton : function(btn, hero) {
			var ctrl = this.controller,
				price = ctrl.getCurrentInstantBuyCost(hero),
				disabled = ctrl.isHeroInstantBuyDisabled(hero);

			btn.setCaption(price);
			btn.disable(disabled);
			btn.setState(disabled);
			this._initializePremiumButtonTooltip(btn, hero);
		},

		_registerPremiumButton : function($el, hero) {
			var ctrl = this.controller,
				hero_id = hero.getId();

			$el.addClass('btn_instant_buy single_border');

			return ctrl.registerComponent('btn_instant_buy_' + hero_id, $el.button(
					this.getSettingsForCureHeroButton(hero)
				).on('btn:click', function(e, _btn) {
					ctrl.onPremiumClick(_btn, hero_id);
				})
			);
		},

		/**
		 * Returns settings for the button to instantly heal a hero
		 *
		 * @param {GameModels.PlayerHero} hero
		 * @return {Object}
		 */
		getSettingsForCureHeroButton : function(hero) {
			var ctrl = this.controller,
				disabled = ctrl.isHeroInstantBuyDisabled(hero);

			return {
				caption : ctrl.getCurrentInstantBuyCost(hero),
				icon: true,
				icon_type: 'gold',
				icon_position: 'right',
				disabled : disabled,
				state : disabled
			};
		}

	});

	window.GameViews.HeroesOverviewInstantBuy = HeroesOverviewInstantBuy;
}());
