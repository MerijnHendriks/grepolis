(function() {
	'use strict';

	var HeroesOverview = window.GameViews.HeroesOverview;

	var HeroesOverviewHalvingTime = HeroesOverview.extend({

		getStrategyName : function() {
			return 'halving_time';
		},

		initializePremiumButton : function($el, hero) {
			var ctrl = this.controller,
				hero_id = hero.getId();

			$el.addClass('btn_reduct_time square gold');

			return ctrl.registerComponent('btn_reduct_time_' + hero_id, $el.button(
					this.getSettingsForCureHeroButton(hero, ctrl.getModel('player_ledger'))
				).on('btn:click', function(e, _btn) {
					ctrl.onPremiumClick(_btn, hero_id);
				})
			);

		},

		/**
		 * Returns settings for the cutting Hero healing time
		 *
		 * @param {GameModels.PlayerHero} hero
		 * @param {GameModels.PlayerLedger} player_ledger
		 *
		 * @return {Object}
		 */
		getSettingsForCureHeroButton : function(hero, player_ledger) {
			var l10n = DM.getl10n("heroes", "overview");

			return {
				caption : '',
				disabled : !hero.isInjured(),
				state : !hero.isInjured(),
				tooltips : [
					{title : TooltipFactory.getReductionInfo('hero_cure_time', player_ledger.getGold())},
					{title : hero.isInjured() ? l10n.can_not_halve_cure_time : l10n.hero_is_not_injured}
				]
			};
		}

	});

	window.GameViews.HeroesOverviewHalvingTime = HeroesOverviewHalvingTime;
}());
