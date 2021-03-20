/*global GrepolisModel, Game */

(function() {
	'use strict';

	var PlayerSettings = function() {};

	PlayerSettings.urlRoot = 'PlayerSettings';

	PlayerSettings.constructor = function() {
		GrepolisModel.apply(this, arguments);
		// as long as player settings are not migrated to backbone we put them in here
		this.addStaticGamePlayerSettings();
	};

	PlayerSettings.addStaticGamePlayerSettings = function() {

		Object.keys(Game.player_settings).forEach(function(setting_name) {
			var setting_value = Game.player_settings[setting_name];
			this.set(setting_name, setting_value);
		}.bind(this));
	};

	PlayerSettings.isExtendingAdvisorEnabled = function(advisor_id) {
		return this.get('extend_premium_' + advisor_id) === true;
	};

	PlayerSettings.tutorialArrowActivatedByDefault = function() {
		return this.get('activate_tutorial_arrow_by_default');
	};

	PlayerSettings.isCityNightModeEnabled = function() {
		return this.get('night_gfx_city');
	};

	PlayerSettings.isMapNightModeEnabled = function() {
		return this.get('night_gfx');
	};

	PlayerSettings.isShowUnitsInTownTooltipEnabled = function() {
		return this.get('map_show_supporting_units');
	};

	PlayerSettings.areMapMovementsEnabled = function() {
		return this.get('map_movements');
	};

	/**
	 * Checks if a player has enabled a certain kind of web notification.
	 * If the specific kind is not known, this function defaults to return a falsy value.
	 * @param category - e.g. 'combat'
	 * @param event_id - e.g. 'attack_incoming'
	 * @returns {*}
     */
	PlayerSettings.isWebNotificationEnabled = function(category, event_id) {
		return this.get('webnotification_' + category + '_' + event_id);
	};

	PlayerSettings.showWebNotificationsInForegroundTab = function() {
		return this.get('webnotifications_in_foreground');
	};

	window.GameModels.PlayerSettings = GrepolisModel.extend(PlayerSettings);
}());
