/*globals GPWindowMgr, _, hCommon */

window.AttackPlannerWindowFactory = (function() {
	'use strict';

	return {
		/**
		 * Opens 'AttackPlanner' window
		 */
		openAttackPlannerWindow : function() {
			return GPWindowMgr.Create(GPWindowMgr.TYPE_ATTACK_PLANER, _('Attack planner'));
		},

		openAttackPlannerForTarget : function(target_id, callback) {
			callback = callback || function() {};

			return hCommon.openWindow(GPWindowMgr.TYPE_ATTACK_PLANER, _('Attack planner'), {
				prevent_default_request : true
			}, 'attack_planer', 'show_attack_dialog', {target_id : target_id}, 'get', callback);
		}
	};
}());