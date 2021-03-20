/*globals window, DM, us */

(function(controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');

	var type = windows.DIALOG;

	settings[type] = function(props) {
		props = props || {};

		var l10n = DM.getl10n(windows.DIALOG);

		return us.extend({
			window_type : type,
			minheight : 200,
			width : 525,
			tabs : [
			/**
			 * Please specify templates in the 'data_frontend_bridge.json'
			 */

				//Info windows
				{type : 'info_all_towns_in_one_group', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'info_attack_planner_help', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'info_create_first_town_group', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'info_mass_recruit_help', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'info_phoenician_salesman_help', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},

				//Go to page
				{type : 'go_to_page_default', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},

				//Save coordinates
				{type : 'save_coordinates_default', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},

				//Confirmation windows
				{type : 'confirmation_window_default', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},

				//Not enough gold windows
				{type : 'not_enough_gold_window_default', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'not_enough_gold_window_building_build_cost_reduction', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'not_enough_gold_window_buy_advisor', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'not_enough_gold_window_building_build_time', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'not_enough_gold_window_research_build_time', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'not_enough_gold_window_unit_orders', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},
				{type : 'not_enough_gold_window_celebrate_olympic_games', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true},

				//Interstitials
				{type : 'interstitial_default', title : l10n.tabs[0], content_view_constructor : controllers.DialogBaseController, hidden : true}
			],
			max_instances : Infinity,
			minimizable : true,
			activepagenr : 0,
			title : l10n.window_title,
			modal : false
		}, props);
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));