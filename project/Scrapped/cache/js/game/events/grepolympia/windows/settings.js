define('events/gerpolympia/windows/settings', function() {
	'use strict';

	var windows = require('game/windows/ids'),
		tabs = require('game/windows/tabs'),
		GREPOLYMPIA = windows.GREPOLYMPIA,
		GREPOLYMPIA_SHOP = windows.GREPOLYMPIA_SHOP,
		SKINS = require('enums/event_skins'),
		WindowFactorySettings = require_legacy('WindowFactorySettings'),
    	WindowSettingsHelper = require('helpers/event_window_settings'),
		GrepolympiaShopController = require('events/grepolympia/controllers/grepolympia_shop'),
		GrepolympiaTrainingController = require('events/grepolympia/controller/grepolympia_training'),
		GrepolympiaRankingController = require('events/grepolympia/controller/grepolympia_ranking'),
		GrepolympiaInfoController = require('events/grepolympia/controller/grepolympia_info'),
        GrepolympiaMatchesController = require('events/grepolympia/controller/grepolympia_matches'),
    	BenefitHelper = require('helpers/benefit'),
		Happenings = require('enums/happenings');

	var options = {
			tabs: [
				{type : tabs.INFO, content_view_constructor : GrepolympiaInfoController},
				{type : tabs.TRAINING,  content_view_constructor : GrepolympiaTrainingController},
				{type : tabs.RANKING, content_view_constructor : GrepolympiaRankingController},
				{type : tabs.SHOP, content_view_constructor : GrepolympiaShopController}
			],
			window_settings: {
                happening_name: Happenings.GREPOLYMPIA
			}
		};

    function addWorldCupMatchesTab () {
        //Todo move up to the tabs when GD decides to use the tab in all skins
        if (BenefitHelper.getBenefitSkin() === SKINS.GREPOLYMPIA_WORLDCUP && options.tabs[0].type !== tabs.MATCHES) {
            var matches_tab = {type : tabs.MATCHES, content_view_constructor : GrepolympiaMatchesController};
            options.tabs.unshift(matches_tab);
            options.activepagenr = 1;
        }
	}

	WindowFactorySettings[GREPOLYMPIA] = function(props) {
		addWorldCupMatchesTab();
        return WindowSettingsHelper.getEventWindowSettings(GREPOLYMPIA, options, props);
	};

	WindowFactorySettings[GREPOLYMPIA_SHOP] = function(props) {
		var shop_tabs = [];

		addWorldCupMatchesTab();
        shop_tabs = options.tabs.filter(function (tab) {
			return tab.type === tabs.SHOP || tab.type === tabs.RANKING || tab.type === tabs.MATCHES;
		});

		var shop_options = {
			tabs: shop_tabs,
			window_settings: {
                happening_name: Happenings.GREPOLYMPIA
			}
		};

        return WindowSettingsHelper.getEventWindowSettings(GREPOLYMPIA, shop_options, props);
	};

	return WindowFactorySettings[GREPOLYMPIA];
});
