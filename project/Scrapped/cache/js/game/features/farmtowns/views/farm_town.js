/*global define */

define('farmtowns/views/farm_town', function () {
	'use strict';

	var FarmTownBase = require('farmtowns/views/farm_town_base');
	var CardsView = require('farmtowns/views/cards');
	var TradingView = require('farmtowns/views/trading');
	var PopupFactory = require_legacy('PopupFactory');
	var GameDataPremium = require_legacy('GameDataPremium');
	var FarmTownTabs = require('features/farmtowns/enums/farm_town_tabs');

	var MAX_LEVEL = 6;
	var LOCKED_LEVEL = 0;

	return FarmTownBase.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			FarmTownBase.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.l10n;

			this.render();
		},

		render : function() {
			var advisor_advertisment = this.controller.showAdvisorOverlay();

			this.controller.unregisterComponents();

			this.renderTemplate(this.$el, 'index', {
				l10n: this.controller.getl10n(),
				level: this.controller.getLevel(),
				max_level : MAX_LEVEL,
				name: this.controller.getName(),
				battle_points: this.controller.getBattlePoints(),
				upgrade_timestamp: this.controller.getUpgradeEndTimeStamp(),
				advisor_advertisment: advisor_advertisment
			});


			this.registerLevelArea();

			if(this.controller.getLevel() !== LOCKED_LEVEL) {
				this.registerTownSwitchButtons();
				this.registerTabs();
				this.renderTab(this.controller.getLastRenderedTab());
			}
			else {
				this.renderUnlockScreen();
			}

			// Render advisors container only if necessary
			if (advisor_advertisment) {
				this.renderAdvisorContainer();
			}
		},

		renderAdvisorContainer : function() {
			this.renderTemplate(this.$el.find('.advisor_advertisment'), 'advisor_container', {
				l10n : this.l10n,
				advisor : 'captain'
			});

			this.initializeAdvisorContainer();
		},

		registerUnlockButton: function() {
			var l10n = this.l10n,
				cost = this.controller.getUnlockCost(),
				disabled = this.controller.getBattlePoints() < cost;

			this.unregisterComponent('btn_unlock');
			this.registerComponent('btn_unlock', this.$el.find('.btn_unlock').button({
				caption : '<div class="description_text">' + l10n.build + '</div><div class="cost_text"> ' + cost + '</div>',
				disabled: disabled,
				state: disabled,
				icon: true,
				icon_type: 'battle_points',
				icon_position: 'right',
				tooltips : [
                    {
                        title: this.getTemplate('upgrade_button_tooltip', {
                            l10n: this.l10n,
                            cost: cost,
							battle_points: this.controller.getBattlePoints(),
							show_time: false,
							disabled: disabled,
							advantages: [
								l10n.tooltips.collect_resources,
								l10n.tooltips.accept_units,
								l10n.tooltips.trade_resources
							]
                        }),
                        styles: {
                            width: 276
                        }
                    }
				]
			}).on('btn:click', function() {
				this.controller.doUnlock();
			}.bind(this)));
		},

		registerTownSwitchButtons: function() {
			this.registerComponent('btn_next', this.$el.find('.btn_next').button({
				disabled : this.controller.getNumOfFarmTownsOnSameIslandOwnedByPlayer() < 2,
				state: this.controller.getNumOfFarmTownsOnSameIslandOwnedByPlayer() < 2
			}).on('btn:click', function() {
				this.controller.switchToNextFarmTown();
			}.bind(this)));

			this.registerComponent('btn_prev', this.$el.find('.btn_prev').button({
				disabled : this.controller.getNumOfFarmTownsOnSameIslandOwnedByPlayer() < 2,
				state: this.controller.getNumOfFarmTownsOnSameIslandOwnedByPlayer() < 2
			}).on('btn:click', function() {
				this.controller.switchToPrevFarmTown();
			}.bind(this)));
		},

		/**
		 * Make clicking on the tabs change content
		 */
		registerTabs: function() {
			var registerTab = function(type) {
				var tab = this.$el.find('.' + type).button({
					// The trade tab has a tooltip, others have not
					tooltips: type === FarmTownTabs.TRADE ? [{
						title: this.l10n.tooltips.trade_tab,
						styles: {width: 350}
					}] : []
				}).on('btn:click', this.renderTab.bind(this, type));

				this.registerComponent(type, tab);
			}.bind(this);

			[FarmTownTabs.RESOURCES, FarmTownTabs.UNITS, FarmTownTabs.TRADE].forEach(registerTab);
		},

		/**
		 * Replace the lower content area with a view for the chosen tab
		 * @param tab - the tab to show
		 */
		renderTab : function(tab) {
			var view_data = {
					controller: this.controller,
					el: this.$el,
					type: tab
				},
				constructors = {
					resources: CardsView,
					units: CardsView,
					trade: TradingView
				};

			if (!constructors[tab]) {
				throw 'no view defined for: ' +tab;
			}

			if (this.current_tab_view) {
				this.$el.find('.'+this.controller.getLastRenderedTab()).removeClass('selected');
				this.current_tab_view.destroy();
			}

			this.current_tab_view = new constructors[tab](view_data);
			this.current_tab_view.render();
			this.$el.find('.'+tab).addClass('selected');

			this.controller.setLastRenderedTab(tab);

			var res_elem = this.$el.find('.resources_max');
			if(tab === FarmTownTabs.RESOURCES) {
				res_elem.show();
				this.registerResourceStorageBar();
			} else {
				res_elem.hide();
			}

		},

		renderUnlockScreen : function() {
			var $el = this.$el.find('.action_wrapper'),
				locked = this.getTemplate('locked', {
					l10n: this.l10n,
					ratio_value: '1:' + this.controller.getRatio(),
					demand: this.controller.getResourceDemand(),
					offer: this.controller.getResourceOffer()
				});

			$el.append(locked);
			this.registerUnlockButton();
		},

		/**
		 * enable / disable the current tab whenever a upgrade is started.
		 */
		toggleUpgradeRunning : function() {
			if (this.controller.isUpgradeRunning()) {
				this.showUpgradeInProgress();
			} else {
				this.hideUpgradeInProgress();
			}
		},


		/**
		 * hide the upgrade banner, show the upgrade button and hide the timer
		 */
		hideUpgradeInProgress : function() {
			this.unregisterComponent('pb_bpv_upgrade_time');
			this.unregisterComponent('pb_bpv_unlock_time');

			this.$el.find('.village_update_btn').show();
			this.$el.find('.upgrade_running').hide();
		},

		initializeAdvisorContainer : function() {
			this.unregisterComponent('activate_captain');

			this.registerComponent('activate_captain', this.$el.find('.btn_activate_captain').button({
				caption: this.l10n.advisor_banner.activate(GameDataPremium.getAdvisorCost('captain')),
				icon: true,
				icon_type: 'gold',
				icon_position: 'right',
				tooltips : [
					{title : PopupFactory.texts.captain_hint}
				]
			}).on('btn:click', function(e, _btn) {
				this.controller.activateCaptain(_btn);
			}.bind(this)));
		},

		/**
		 * Cleans up HTML and components after removing "Advisor Commercial Box"
		 */
		removeAdvisorContainer : function() {
			this.$el.find('.advisor_container').remove();
			this.controller.unregisterComponent('activate_curator');
		},

		registerResourceStorageBar : function() {
			this.$el.find('.resources_max').tooltip(this.controller.getl10n().tooltips.max_resource_per_day);
			this.unregisterComponent('resources_pb');
			var max_loot = this.controller.getMaxResourceStorage();
			this.registerComponent('resources_pb', this.$el.find('.resources_pb').singleProgressbar({
				value : max_loot - this.controller.getLoot(),
				max: max_loot
			}));
		},

		destroy : function() {
			this.$el.empty();
		}
	});
});
