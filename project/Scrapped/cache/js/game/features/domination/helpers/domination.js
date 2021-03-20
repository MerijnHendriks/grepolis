/* global TM */

define('features/domination/helpers/domination', function (require) {
    'use strict';

    var Timestamp = require('misc/timestamp'),
        tabs = require('game/windows/tabs'),
        DOMINATION_ERAS = require('enums/domination_eras');

    return {
        setTabs: function (controller, era, player_model) {
            var window_model = controller.getWindowModel(),
                active_tabs = window_model.getTabsCollection(),
                status_tab = active_tabs.getTabByType(tabs.STATUS),
                info_tab = active_tabs.getTabByType(tabs.INFO),
                ranking_tab = active_tabs.getTabByType(tabs.RANKING);

            switch (era) {
                case DOMINATION_ERAS.PRE_DOMINATION:
                    controller.switchTab(info_tab.getIndex());
                    controller.hideTab(status_tab.getIndex());
                    controller.hideTab(ranking_tab.getIndex());
                    break;
                case DOMINATION_ERAS.DOMINATION:
                    if (!player_model.getAllianceId() && status_tab.isHidden() === false) {
                        controller.switchTab(info_tab.getIndex());
                        controller.hideTab(status_tab.getIndex());
                        controller.showTab(ranking_tab.getIndex());
                    } else if (player_model.getAllianceId()) {
                        controller.showTab(status_tab.getIndex());
                        controller.showTab(ranking_tab.getIndex());
                    }
                    break;
                case DOMINATION_ERAS.POST_DOMINATION:
                    controller.hideTab(status_tab.getIndex());
                    controller.showTab(ranking_tab.getIndex());
                    break;
                default:
                    break;
            }
        },

        createStatusReFetchTimer: function (model_status) {
            //we don't need to refetch once post domination era is reached as the data won't change anymore
            if (model_status.getDominationEra() === DOMINATION_ERAS.POST_DOMINATION) {
                return;
            }
            var time_left = (model_status.getNextCalculationTimestamp() - Timestamp.now()) * 1000;

            if (time_left <= 0) {
                return;
            }

            TM.unregister('refetch_domination_status');
            TM.register('refetch_domination_status', time_left, model_status.reFetch.bind(model_status), {max: 1});
        }
    };
});