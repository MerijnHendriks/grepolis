/*globals GameData */

(function(window) {
	"use strict";

	var SPY_MOVEMENT = 'spy_movements';

	var GameDataCommands = {

		/**
		 * Returns time in seconds during which the command can be cancelled
		 *
		 * @return {Integer}
		 */
		getCancelCommandTime : function() {
			return GameData.cancel_times.unit_movements;
		},

		/**
		 * Returns time in seconds during which the command can be cancelled
		 *
		 * @return {Integer}
		 */
		getCancelEspionageTime : function() {
			return GameData.cancel_times.espionage;
		},

		getCancelCommandTimeByType : function(command_type) {
			return command_type === SPY_MOVEMENT ? this.getCancelEspionageTime() : this.getCancelCommandTime();
		}
	};

	window.GameDataCommands = GameDataCommands;
}(window));