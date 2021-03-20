/* globals Game, Timestamp */

define('features/olympus/controllers/temple_info', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers'),
        GameData = require_legacy('GameData'),
		TempleInfoView = require('features/olympus/views/temple_info'),
		CommandTypes = require('enums/command_types'),
		OlympusStages = require('enums/olympus_stages'),
		TempleSizes = require('enums/temple_sizes'),
		TempleInfoHelper = require('features/olympus/helpers/temple_info'),
		OlympusHelper = require('helpers/olympus'),
		TABS = require('game/windows/tabs');

	return GameControllers.TabController.extend({
		view: null,

		initialize: function (options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			var temple_size = '';

			this.temple_info = this.getModel('temple_info');
			this.temple = this.getCollection('temples').getTempleById(this.getTempleId());
			this.olympus = this.getModel('olympus');
			this.custom_colors = this.getCollection('custom_colors');

			if (this.isOlympus()) {
				var window_tabs = this.window_model.getTabsCollection();
				var ranking_tab = window_tabs.getTabByType(TABS.RANKING);
				this.showTab(ranking_tab.getIndex());
			}

			temple_size = this.temple.getTempleSize();

			if (temple_size === TempleSizes.SMALL) {
				this.setWindowTitle(this.l10n.small_temple_title(this.temple.getName()));
			} else if (temple_size === TempleSizes.LARGE) {
				var god = GameData.gods[this.temple.getGod()].name;
				this.setWindowTitle(this.l10n.large_temple_title(god));
			} else {
				this.setWindowTitle(this.temple.getName());
			}

			this.view = new TempleInfoView({
				controller: this,
				el: this.$el
			});

			this.registerEventListeners();
			TempleInfoHelper.registerTempleInfoRefetchTimer(this.temple_info);
		},

		registerEventListeners: function () {
			this.stopListening();
			this.temple_info.onMovementsChange(this, function () {
				this.view.renderMovements();
			}.bind(this));
			this.temple_info.onStateChange(this, this.view.render.bind(this.view));
			this.temple_info.onUnitsChange(this, this.view.renderSummarizedSupportTroops.bind(this.view));
			this.custom_colors.onColorChange(this, this.view.render.bind(this.view));

			if (this.isOlympus()) {
				this.olympus.onNextJumpAtChange(this, this.view.renderTempleInfoImage.bind(this));
			}

			this.window_model.on("data:replaced", function () {
				this.window_model.cleanData();
				this.render();
			}.bind(this));
		},

		getCustomColors: function () {
			return this.custom_colors;
		},

		getTemple: function () {
			return this.temple;
		},

		getTempleId: function () {
			return this.temple_info.getId();
		},

		getTempleName: function () {
			return this.temple.getName();
		},

		getTemplePowers: function () {
			return OlympusHelper.getTemplePowersArray(this.temple);
		},

		getTempleSize: function () {
			return this.temple.getTempleSize();
		},

		getOwnerAllianceId: function () {
			return this.temple.getAllianceId();
		},

		getOwnerAllianceName: function () {
			return this.temple.getAllianceName();
		},

		getOwnerFlagType: function () {
			return this.temple_info.getFlagType();
		},

		getAllUnits: function () {
			var units = this.temple_info.getUnits();
			return units.all_units;
		},

		getState: function () {
			return this.temple_info.getState();
		},

		getTakeoverAllianceId: function () {
			return this.temple_info.getTakeover().alliance_id;
		},

		getTakeoverAllianceName: function () {
			return this.temple_info.getTakeover().alliance_name;
		},

		getTempleProtectionEndsTimestamp: function () {
			return Timestamp.now() + this.temple_info.getShieldTimeRemaining();
		},

		isGlobalShieldActive: function() {
			return this.olympus.isGlobalShieldActive();
		},

		getNextGlobalShieldToggle: function() {
			return this.olympus.getNextGlobalShieldToggle();
		},

		getTakeoverEnd: function () {
			return this.temple_info.getTakeover().end;
		},

		getTakeover: function () {
			return this.temple_info.getTakeover();
		},

		getSmallTempleStageStartTime: function () {
			return this.olympus.getOlympusSmallOceanTempleStageTimestamp();
		},

		isPreTempleStageActive: function () {
			return this.olympus.getOlympusStage() === OlympusStages.PRE_TEMPLE_STAGE;
		},

		getIncomingSupport: function () {
			return this.temple_info.getActiveMovementsCountByTypes([
				CommandTypes.SUPPORT,
				CommandTypes.PORTAL_SUPPORT_OLYMPUS
			]);
		},

		getIncomingAttacks: function () {
			return this.temple_info.getActiveMovementsCountByTypes([
				CommandTypes.ATTACK,
				CommandTypes.PORTAL_ATTACK_OLYMPUS
			]);
		},

		getMovements: function () {
			return this.temple_info.getMovements();
		},

		getTempleIslandX: function () {
			return this.temple.getIslandX();
		},

		getTempleIslandY: function () {
			return this.temple.getIslandY();
		},

		getTempleGod: function () {
			return this.temple.getGod();
		},

		isOlympus: function () {
			return this.getTempleSize() === TempleSizes.OLYMPUS;
		},

		getOlympusJumpDays: function () {
			return this.olympus.getOlympusJumpDays();
		},

		getNextOlympusJumpTimestamp: function () {
			return this.olympus.getNextJumpAt();
		},

		isPortalTemple: function () {
			return this.temple.isPortalTemple();
		},

		isOlympusStageActive: function () {
			return this.olympus.getOlympusStage() === OlympusStages.OLYMPUS_STAGE;
		},

		isOwner: function () {
			return Game.alliance_id && this.getOwnerAllianceId() === Game.alliance_id;
		},

		canStartPortalCommands: function () {
			return this.isOlympusStageActive() &&
				this.isOwner() &&
				this.isPortalTemple();
		},

		destroy: function () {
			TempleInfoHelper.unregisterTempleInfoRefetchTimer();
		}
	});
});
