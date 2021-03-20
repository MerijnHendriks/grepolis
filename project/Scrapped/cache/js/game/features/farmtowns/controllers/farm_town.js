/*global define, Timestamp, us, Game, BuyForGoldWindowFactory, NotificationLoader */

define('farmtowns/controllers/farm_town', function() {
	'use strict';

	var controllers = window.GameControllers,
		FarmTownIndexView = require('farmtowns/views/farm_town'),
		MarketHelper = require('market/helper/market'),
		FarmTownData = require('farmtowns/data/farm_town'),
		GameEvents = require('data/events'),
		Powers = require('enums/powers'),
		FarmTownTabs = require('features/farmtowns/enums/farm_town_tabs'),
		offer = 3000,
		demand = 0,
		MIN_OFFER_VALUE = 100,
		MAX_OFFER_VALUE = 3000,
		AVG_PERCENT_RESOURCE_GAIN = 15,
		MAX_FARMTOWN = 6,
		LOCKED_LEVEL = 0,
		RESEARCH_BOOTY = 'booty';

	return controllers.TabController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			controllers.TabController.prototype.initialize.apply(this, arguments);
			this.last_rendered_tab = 'resources';
		},

		registerRelationEvents : function() {
			var relation = this.getFarmTownRelationData();

			this.stopListening(relation);

			// relation events
			relation.onFarmTownRelationStatusChange(this, this.reRender, this);
			relation.onTownSpecificDataChange(this, this.reRender, this);
			relation.onFarmTownLastLootedAtChange(this, function() {
				this.view.current_tab_view.showBanner('loot');
				this.view.registerResourceStorageBar();
			}, this);

			// start of upgrade
			relation.onExpansionAtChange(this, this.view.toggleUpgradeRunning.bind(this.view));
			// end of upgrade (level change)
			relation.onLevelChange(this, this.reRender, this);

			relation.onCurrentTradeRatioChange(this, function() {
				if (this.view.current_tab_view && this.view.current_tab_view.type === FarmTownTabs.TRADE) {
					this.view.current_tab_view.render();
				}
			}, this);

			relation.onTradeDurationChange(this, function() {
				if (this.view.current_tab_view && this.view.current_tab_view.type === FarmTownTabs.TRADE) {
					this.view.current_tab_view.updateRuntimes.bind(this.view.current_tab_view);
				}
			},this);

			relation.onClaimResourceValuesChanged(this, function() {
				if (this.view.current_tab_view && this.view.current_tab_view.type !== FarmTownTabs.TRADE) {
					this.view.current_tab_view.render();
				}
			},this);
		},

		unRegisterRelationEvents : function() {
			var relation = this.getFarmTownRelationData();
			this.stopListening(relation);
		},

		registerEventListeners : function() {
			var current_town = this.town_collection.getCurrentTown(),
				buildings = current_town.getBuildings(),
				casted_powers = this.getCollection('casted_powers');

			this.stopListening();
			this.player_killpoints.onPointsChange(this, function() {
				if(this.getLevel() === LOCKED_LEVEL) {
					this.view.registerUnlockButton();
				}
				this.view.registerLevelArea();
			}.bind(this));
			this.getModel('premium_features').onCaptainChange(this, this.reRender);
			this.researches.onResearchesChange(this, function(new_model) {
				if(new_model.hasChanged(RESEARCH_BOOTY)) {
					this.onMarketLevelOrResearchChange();
				}
			});
			this.stopObservingEvent(window.GameEvents.town.town_switch);
			this.observeEvent(window.GameEvents.town.town_switch, this.onTownSwitch.bind(this));

			buildings.onBuildingMarketLevelChange(this, this.onMarketLevelOrResearchChange);
			buildings.onBuildingStorageLevelChange(this, function() {
				if (this.view.current_tab_view && this.view.current_tab_view.type !== FarmTownTabs.TRADE) {
					this.view.current_tab_view.render();
				}
			}.bind(this));
			buildings.onBuildingFarmLevelChange(this, function() {
				if (this.view.current_tab_view && this.view.current_tab_view.type !== FarmTownTabs.TRADE) {
					this.view.current_tab_view.render();
				}
			}.bind(this));

			current_town.onAvailableTradeCapacityChange(this, function() {
				if (this.view.current_tab_view && this.view.current_tab_view.type === FarmTownTabs.TRADE) {
					this.view.current_tab_view.render();
				}
			}.bind(this));

			casted_powers.onCastedPowerCountChange(this, function (power) {
				var current_tab = this.view.current_tab_view ? this.view.current_tab_view.type : null;

				if (power.getPowerId() !== Powers.HYMN_TO_APHRODITE || !current_tab) {
					return;
				}

				if (current_tab === FarmTownTabs.TRADE || current_tab === FarmTownTabs.RESOURCES) {
					this.getFarmTownRelationData().refetchTownSpecificData();
				}
			}.bind(this));

			this.registerRelationEvents();
		},

		/**
		 * handle Town switch action:
		 * to make sure we only re-render once, all Listeners are unregistered and only the one we are interested in
		 * is registerd.
		 */
		onTownSwitch : function() {
			this.stopListening();
			this.showLoading();

			// close the farm town window if user switches the island
			if (!this.currentTownAndFarmTownOnSameIsland()) {
				this.closeWindow();
				return;
			}

			this.getFarmTownRelationData().onTownSpecificDataChange(this, function() {
				this.stopListening();
				this.hideLoading();
				this.reRender();
			}.bind(this));

			// reload trade ratio etc.
			this.getFarmTownRelationData().refetchTownSpecificData();
		},

		upgradeCompletedTimerTrigger: function() {
			this.stopListening();
			this.getFarmTownRelationData().refetchTownSpecificData();
			this.getFarmTownRelationData().onTownSpecificDataChange(this, function() {
				this.stopListening();
				this.reRender();
			}.bind(this));
			NotificationLoader.resetNotificationRequestTimeout(100);
		},

		// refetch market / town related data (triggers re-render)
		onMarketLevelOrResearchChange: function() {
			this.getFarmTownRelationData().refetchTownSpecificData();
		},

		updateWindowTitle : function() {
			this.setWindowTitle(this.getl10n().window_title + ' (' + this.getName() + ')');
		},

		renderPage : function(data) {
			var args = this.getWindowModel().getArguments();

			this.farm_town_collection = this.getCollection('farm_towns');
			this.farm_town_relation_collection = this.getCollection('farm_town_player_relations');
			this.town_collection = this.getCollection('towns');
			this.researches = this.getCollection('towns').getCurrentTown().getResearches();
			this.player_killpoints = this.getModel('player_killpoints');
			this.farm_town = this.farm_town_collection.get(args.farm_town_id);
			this.getFarmTownRelationData().refetchTownSpecificData();

			this.getWindowModel().hideLoading();
			this.initializeView();

		},

		reRender: function() {
			this.initializeView();
		},


		/**
		 * @returns {Boolean} true, if the current_town and farm_town are on the same island
		 */
		currentTownAndFarmTownOnSameIsland: function() {
			var current_town = this.town_collection.getCurrentTown(),
				island_x = current_town.getIslandX(),
				island_y = current_town.getIslandY();

			if (island_x !== this.farm_town.getIslandX() || island_y !== this.farm_town.getIslandY()) {
				return false;
			}
			return true;
		},

		initializeView : function() {
			this.view = new FarmTownIndexView({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		setLastRenderedTab : function(tab) {
			this.last_rendered_tab = tab;
		},

		getLastRenderedTab : function() {
			return this.last_rendered_tab;
		},

		getTradeDuration: function() {
			return this.getFarmTownRelationData().getTradeDuration();
		},

		getFarmTownRelationData : function() {
			return this.farm_town_relation_collection.getRelationForFarmTown(this.farm_town.id);
		},

		getName : function() {
			return this.farm_town.getName();
		},

		getLevel: function() {
			return this.getFarmTownRelationData().getLevel();
		},

		getBattlePoints: function() {
			return this.getModel('player_killpoints').getUnusedPoints();
		},

		isUpgradeRunning: function() {
			return this.getFarmTownRelationData().isUpgradeRunning();
		},

		isCardLocked : function(type, index) {
			var town_building_levels = this.town_collection.getCurrentTown().getBuildings(),
				claim_dependency = this.getBuildingDependencies(type, index);

			if(town_building_levels.getBuildingLevel(claim_dependency.building) < claim_dependency.level) {
				return true;
			}
			return false;
		},

		getBuildingDependencies : function(type, index) {
			return FarmTownData.getFarmTownBuildingRequirement()[type][index];
		},

		getMaxResourceStorage : function() {
			return FarmTownData.getMaxResourceStorage()[this.getLevel()] * Game.game_speed;
		},

		/**
		 * return the differences in maxResourceStorage for the current level and the next
		 * returns 0 if the next level is invalid
		 * @returns {Number}
		 */
		getMaxResourcesStorageGain: function() {
			var cur = this.getLevel(),
				nex = cur + 1,
				storage_data = FarmTownData.getMaxResourceStorage();

			if (!storage_data[nex]) {
				return 0;
			}

			return (storage_data[nex] - storage_data[cur]) * Game.game_speed;
		},

		/**
		 * returns average gain for resources when upgrading the farm town to next level in percent
		 * @returns {Number}
		 */
		getProcentualResourceGainForNextLevel: function() {
			return AVG_PERCENT_RESOURCE_GAIN;
		},

		isLootable: function() {
			return this.getFarmTownRelationData().isLootable();
		},

		getLoot: function() {
			return this.getFarmTownRelationData().getLoot();
		},

		getUpgradeEndTimeStamp : function() {
			return this.getFarmTownRelationData().getExpansionAt();
		},

		getLootableAtTimeStamp : function() {
			return this.getFarmTownRelationData().getLootableAt();
		},

		getUpgradeDuration: function() {
			return FarmTownData.getExpansionTimes()[this.getLevel() + 1];
		},

		getUpgradeTimeLeft: function() {
			return this.getUpgradeEndTimeStamp() - Timestamp.now();
		},

		getLootableTimeLeft: function() {
			return this.getLootableAtTimeStamp() - Timestamp.now();
		},

		getUpgradeCost : function() {
			return FarmTownData.getExpansionCosts()[this.getLevel() + 1];
		},

		getUnlockCost : function() {
			var amountOfOwnedFarmTowns = this.farm_town_relation_collection.getAmountOfOwnedFarmTowns();
			return (amountOfOwnedFarmTowns < MAX_FARMTOWN) ? FarmTownData.getUnlockCosts()[amountOfOwnedFarmTowns + 1] : FarmTownData.getUnlockCosts()[MAX_FARMTOWN];
		},

		getFarmTownsOnSameIslandOwnedByPlayer: function(island) {
			var towns = this.farm_town_collection.getAllForIsland(island);
			return us.filter(towns, function(town) {
				return this.farm_town_relation_collection.getRelationForFarmTown(town.getId()).getRelationStatus() === 1;
			}.bind(this));
		},

		getRatio : function() {
			return this.getFarmTownRelationData().getCurrentTradeRatio();
		},

		getResourceOffer : function() {
			return this.farm_town.getResourceDemand(); // to avoid confusion: resource_demand data from backend is what the player offers / farmtown demands
		},

		getResourceDemand : function() {
			return this.farm_town.getResourceOffer(); // to avoid confusion: resource_offer data from backend is what the player demands / farmtown offers
		},

		getClaimUnits : function() {
			return FarmTownData.getClaimUnits()[this.getLevel()];
		},

		getClaimTimesResources : function() {
			var has_booty = this.getCollection('towns').getCurrentTown().getResearches().get('booty');
			return has_booty ? FarmTownData.getClaimTimesBootyResources() : FarmTownData.getClaimTimesNormalResources();
		},

		getClaimTimesUnits : function() {
			return FarmTownData.getClaimTimesUnits();
		},

		doClaim : function(type, option) {
			this.getFarmTownRelationData().claim(type, option, {
				success: function() {
					if(type === 'resources') {
						$.Observer(GameEvents.window.farm.claim_load).publish({
							targets : this.getFarmTownRelationData().getFarmTownId(),
							claim_type : 'normal',
							data : {
								expansion_stage : this.getFarmTownRelationData().getExpansionStage()
							}
						});
					} else {
						$.Observer(GameEvents.window.farm.claim_load).publish({
							targets : this.getFarmTownRelationData().getFarmTownId(),
							claim_type : 'double',
							data : {
								expansion_stage : 1
							}
						});
					}
				}.bind(this),
				error: function() {
					this.view.current_tab_view.hideCurtain();
				}.bind(this)
			});
		},

		doTrade : function(amount) {
			this.getFarmTownRelationData().trade(amount,
				function() {
					$.Observer(GameEvents.window.farm.trade).publish({});
					this.reRender();
				}.bind(this));
		},

		doUpgrade : function() {
			this.getFarmTownRelationData().upgrade(
				function() {
					$.Observer(GameEvents.window.farm.send_resources).publish({});
				}
			);
		},

		doUnlock : function() {
			this.getFarmTownRelationData().unlock();
		},

		getClaimResourceValues : function() {
			return this.getFarmTownRelationData().getClaimResourceValues();
		},

		_switchFarmTown: function(farm_town) {
			this.unRegisterRelationEvents();
			this.farm_town = farm_town;
			this.registerRelationEvents();
			this.getFarmTownRelationData().refetchTownSpecificData();
		},

		switchToNextFarmTown : function() {
			var owned_towns = this.getFarmTownsOnSameIslandOwnedByPlayer(this.farm_town.getIslandXy()),
				position = (us.last(owned_towns) === this.farm_town) ? 0 : (owned_towns.indexOf(this.farm_town) + 1),
				farm_town = owned_towns[position];

			if (farm_town) {
				this._switchFarmTown(farm_town);
			}
		},

		switchToPrevFarmTown : function() {
			var owned_towns = this.getFarmTownsOnSameIslandOwnedByPlayer(this.farm_town.getIslandXy()),
				position = (us.first(owned_towns) === this.farm_town) ? (owned_towns.length - 1) : (owned_towns.indexOf(this.farm_town) - 1),
				farm_town = owned_towns[position];

			if (farm_town) {
				this._switchFarmTown(farm_town);
			}
		},

		getNumOfFarmTownsOnSameIslandOwnedByPlayer : function () {
			return this.getFarmTownsOnSameIslandOwnedByPlayer(this.farm_town.getIslandXy()).length;
		},

		showAdvisorOverlay : function() {
			return !this.getModel('premium_features').hasCaptain() && !this.getFarmTownRelationData().isLocked();
		},

		activateCaptain: function(button) {
			BuyForGoldWindowFactory.openBuyAdvisorWindow(button, 'captain', function() {
				this.getModel('premium_features').extendCaptain();
			}.bind(this));
		},

		updateDemandRatio : function() {
			var new_demand_value,
				offer_value = this.getComponent('sp_trading_offer', this.view.current_tab_view.main_context).getValue();
			new_demand_value = Math.round(offer_value * this.getRatio());
			this.getComponent('sp_trading_demand', this.view.current_tab_view.main_context).setValue(new_demand_value);
			this.setState(offer_value);
			this.setDemand(new_demand_value);
		},

		updateOfferRatio : function() {
			var new_offer_value,
				demand_value = this.getComponent('sp_trading_demand', this.view.current_tab_view.main_context).getValue();
			new_offer_value = Math.round(demand_value / this.getRatio());
			this.getComponent('sp_trading_offer', this.view.current_tab_view.main_context).setValue(new_offer_value);
			this.setState(new_offer_value);
			this.setOffer(new_offer_value);
		},

		getHymnToAphroditeOutput : function() {
			var hymn_bonus = this.getFarmTownRelationData().getHymnToAphroditeTradeBonus();

			if (!hymn_bonus) {
				return '';
			}

			return '+' + Math.round((this.getDemand() * hymn_bonus) / 100);
		},

		updateHymnToAphroditeOutput : function() {
			this.$el.find('.action_wrapper .hymn_to_aphrodite_trade_output').text(this.getHymnToAphroditeOutput());
		},

		/**
		 * setState is a function for setting the current state on the trade button
		 * @param value Boolean
		 */
		setState : function(value) {
			var state = this.isTradeAllowed(value);
			this.setButtonTradeState(state.status, state.message);
		},

		isTradeAllowed : function(offer) {
			var current_resources = this.getCollection('towns').getCurrentTown().getResources();
			if ((offer <= current_resources[this.farm_town.getResourceDemand()]) &&
				 offer >= MIN_OFFER_VALUE && offer <= MAX_OFFER_VALUE && offer <= this.getAvailableCapacity()) {
				return { status : true, message : null};
			}
			else if(this.getAvailableCapacity() === 0 || offer >= this.getAvailableCapacity()) {
				return { status : false, message : this.getl10n().not_enough_capacity };
			}
			else if(offer > current_resources[this.farm_town.getResourceDemand()] || current_resources[this.farm_town.getResourceDemand()] < MIN_OFFER_VALUE) {
				return { status : false, message : this.getl10n().not_enough_resources };
			}
			else if(offer < MIN_OFFER_VALUE) {
				return { status : false, message : this.getl10n().input_offer_to_low };
			}
			else if(offer > MAX_OFFER_VALUE) {
				return { status : false, message : this.getl10n().input_offer_to_high };
			}
			else {
				return { status : false, message : this.getl10n().not_enough_capacity};
			}
		},

		setButtonTradeState : function(enabled, message) {
			this.getComponent('btn_trade', this.view.current_tab_view.main_context).disable(!enabled);
			if (enabled) {
				this.getComponent('btn_trade', this.view.current_tab_view.main_context).destroyTooltip();
			} else {
				this.getComponent('btn_trade', this.view.current_tab_view.main_context).setTooltip(message);
			}
		},

		getAvailableCapacity : function() {
			var current_town = this.town_collection.getCurrentTown();

			return current_town.getAvailableTradeCapacity();
		},

		getMaxCapacity : function() {
			return this.getFarmTownRelationData().getMaxCapacity();
		},

		hasMarket : function() {
			return MarketHelper.hasMarket();
		},

		setOffer : function(value) {
			offer = value;
		},

		setDemand : function(value) {
			demand = value;
		},

		getOffer : function() {
			return offer;
		},

		getDemand : function() {
			return demand;
		},

		/**
		 * sets the offer spinner always to max
		 * in normal cases offer will be set to 3000
		 * if the capacity is less than it will be equal the capacity
		 * if there are less resources it will be the number of the resources
		 * and if the capacity is less then 100 or the resources are less then 100 the offer should be set to 0
		 */
		prepareOfferSpinnerOnLoad : function() {
			var current_resources = this.town_collection.getCurrentTown().getResources(),
				available_resource = current_resources[this.farm_town.getResourceDemand()];

			if(this.getAvailableCapacity() >= MAX_OFFER_VALUE && available_resource >= MAX_OFFER_VALUE) {
				this.setOffer(MAX_OFFER_VALUE);
			}
			else if(this.getAvailableCapacity() < MIN_OFFER_VALUE || available_resource < MIN_OFFER_VALUE) {
				this.setOffer(0);
			}
			else if(this.getAvailableCapacity() >= MAX_OFFER_VALUE && available_resource < this.getAvailableCapacity()){
				this.setOffer(available_resource);
			}
			else if(this.getAvailableCapacity() < MAX_OFFER_VALUE && this.getAvailableCapacity() >= MIN_OFFER_VALUE && available_resource >= this.getAvailableCapacity()) {
				this.setOffer(this.getAvailableCapacity());
			}
			else if(this.getAvailableCapacity() < MAX_OFFER_VALUE && this.getAvailableCapacity() >= MIN_OFFER_VALUE && available_resource < this.getAvailableCapacity()) {
				this.setOffer(available_resource);
			}
		},

		destroy : function() {

		}
	});
});
