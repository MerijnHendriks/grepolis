define('farmtowns/views/farm_town_base', function () {
	'use strict';

	var View = window.GameViews.BaseView;
	var DateHelper = require('helpers/date');
	var LOCKED_LEVEL = 0;
	var MAX_LEVEL = 6;

	return View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
		},

		registerLevelArea: function() {
			var l10n = this.l10n,
				cost = null,
				disabled = true,
				gained_resources,
				gained_max_resources;

			if(this.controller.getLevel() !== LOCKED_LEVEL) {
				cost = this.controller.getUpgradeCost();
				disabled = (this.controller.getBattlePoints() < cost);
				gained_resources = this.controller.getProcentualResourceGainForNextLevel();
				gained_max_resources = this.controller.getMaxResourcesStorageGain();

				if(this.controller.getLevel() !== MAX_LEVEL) {
					this.unregisterComponent('btn_upgrade');
					this.registerComponent('btn_upgrade', this.$el.find('.btn_upgrade').button({
						caption: l10n.upgrade + ' ' + cost,
						disabled: disabled,
						state: disabled,
						icon: true,
						icon_type: 'battle_points',
						icon_position: 'right',
						tooltips: [{
							title: this.getTemplate('upgrade_button_tooltip', {
								disabled: disabled,
								l10n: this.l10n,
								cost: this.controller.getUpgradeCost(),
								upgrade_duration: DateHelper.readableSeconds(this.controller.getUpgradeDuration()),
								battle_points: this.controller.getBattlePoints(),
								show_time: true,
								advantages: [
									l10n.tooltips.plus_resources(gained_resources),
									l10n.tooltips.daily_collectable(gained_max_resources)
								]
							}),
							styles: {
								width: 276
							}
						}]
					}).on('btn:click', function (e, _btn) {
						_btn.disable();
						this.controller.doUpgrade();
					}.bind(this)));
				}
			}

			if (this.controller.isUpgradeRunning()) {
				this.showUpgradeInProgress();
			}

			this.$el.find('.battle_points').tooltip(this.l10n.available_battle_points, {maxWidth: 400});
		},

		/**
		 * show the upgrade banner, hide the upgrade button and timer
		 */
		showUpgradeInProgress: function() {
			this.unregisterComponent('pb_bpv_upgrade_time');
			this.registerComponent('pb_bpv_upgrade_time', this.$el.find('.pb_bpv_upgrade_time')
				.singleProgressbar({
					value : this.controller.getUpgradeTimeLeft(),
					max : this.controller.getUpgradeDuration(),
					liveprogress: true,
					reverse_progress: true,
					type: 'time',
					countdown: true,
					template : 'tpl_pb_single'
				}).on('pb:cd:finish', function() {
					this.controller.upgradeCompletedTimerTrigger();
				}.bind(this)));

			this.$el.find('.village_update_btn').hide();
			this.$el.find('.upgrade_running').show();
		},

		showBanner : function(state) {
			this.removeBanner();

			if(state === 'loot') {
				this.showLootBanner();
			} else {
				this.showTradeNoMarketBanner();
			}
		},

		removeBanner : function() {
			var banner = this.$el.find('.actions .actions_locked_banner');
			var countdown = this.getComponent('pb_bpv_unlock_time');
			banner.addClass('hidden');
			this.hideCurtain();
			if (countdown) {
				this.unregisterComponent('pb_bpv_unlock_time');
				countdown.empty();
			}
			var cardBanner = $('.actions .action_card .card_banner');
			cardBanner.removeClass('hidden');
			cardBanner.parent().find('.curtain').removeClass('hidden');
		},

		showLootBanner : function() {
			var time = this.controller.getLootableTimeLeft();
			this._renderBanner(time);
		},

		showCurtain: function() {
			this.$el.find('.curtain').removeClass('hidden');
		},

		hideCurtain: function() {
			this.$el.find('.curtain').addClass('hidden');
			if(this.type !== 'trade') {
				this.$el.find('.action_card .card_banner').siblings('.curtain').removeClass('hidden');
			}
		},

		_renderBanner : function(time) {
			var banner = this.$el.find('.actions .actions_locked_banner');
			banner.removeClass('hidden');
			banner.addClass('cooldown');
			banner.find('.text').text(this.l10n.cool_down_time);
			this.showCurtain();

			if(this.type !== 'trade') {
				this.reRenderButtons();
				var cardBanner = $('.actions .action_card .card_banner');
				cardBanner.addClass('hidden');
			}
			this.registerLevelArea();

			this.unregisterComponent('pb_bpv_unlock_time');
			this.registerComponent('pb_bpv_unlock_time', this.$el.find('.pb_bpv_unlock_time').countdown2({
				value : time,
				display : 'readable_seconds'
			}).on('cd:finish', function() {
				// keep banner for upgrade case, the upgrade timer will take care of the re-render
				this.removeBanner();
				this.registerLevelArea();
				if(this.type !== 'trade') {
					this.reRenderButtons();
				}
			}.bind(this)));
		},

		showTradeNoMarketBanner: function() {
			var banner = this.$el.find('.actions .actions_locked_banner');
			banner.removeClass('hidden');
			banner.removeClass('cooldown');
			this.showCurtain();
			banner.find('.text').text(this.l10n.market_required);
		},

		destroy : function() {

		}
	});
});
