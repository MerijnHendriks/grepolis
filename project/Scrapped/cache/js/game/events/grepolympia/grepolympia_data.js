/*globals GameData */

(function(window) {
	"use strict";

	var GameDataGrepolympia = {
		/**
		 * Returns cost in gold for opening extra slot in the training queue
		 *
		 * @return {Number}
		 */
		getExtraSlotCost : function() {
			return GameData.grepolympiaTraining.extra_slot_gold;
		},

		/**
		 * Returns cost in gold for reseting athlete skills
		 *
		 * @return {Number}
		 */
		getResetSkillsCost : function() {
			return GameData.grepolympiaTraining.reset_skills_gold;
		},

		getExtraAttemptCost : function() {
			return GameData.grepolympiaTraining.extra_attempt_gold;
		},

		/**
		 * Returns value of Bonus which is given when user has bought "Training Bonus"
		 *
		 * @return {Float}
		 */
		getTrainingBonusImprovementValue : function() {
			return 0.2;
		},

		/**
		 * Returns cost in gold for bonus which increases efectivity of training
		 * athlete
		 *
		 * @return {Number}
		 */
		getTrainingBonusCost : function() {
			return GameData.grepolympiaTraining.training_bonus_gold;
		},

		getTrainingPointsPerSkillpoint : function() {
			return GameData.grepolympiaTraining.training_points_per_skillpoint;
		},

		/**
		 * Returns number of training poins which athlete receive after fight
		 * with it
		 *
		 * @param {String}  unit_id
		 * @param {Boolean} is_bonus_running
		 *
		 * @return {Number}
		 */
		getTrainingPointsForUnit : function(unit_id, is_bonus_active) {
			if (typeof is_bonus_active !== "boolean") {
				throw "'is_bonus_active' argument has to be a Boolean.";
			}

			var received_points = GameData.grepolympiaTraining[unit_id][0],
				bonus_factor = 1 + (is_bonus_active ? GameDataGrepolympia.getTrainingBonusImprovementValue() : 0),
				received_points_with_bonus = Math.floor(received_points * bonus_factor);

			return received_points_with_bonus;
		},

		/**
		 * Returns number of units which can be put into the slot for
		 * training athlete
		 *
		 * @param {String} unit_id
		 *
		 * @return {Number}
		 */
		getSlotLimitForUnit : function(unit_id) {
			return GameData.grepolympiaTraining[unit_id][1];
		},

		/**
		 * Returns a time when unit can train athelete
		 *
		 * @return {Number}
		 */
		getTrainingTimeForUnit : function(unit_id) {
			return GameData.grepolympiaTraining[unit_id][2];
		},

		/**
		 * Determinates if unit can be used for training athlete
		 *
		 * @param {String} unit_id
		 *
		 * @return {Boolean}
		 */
		canUnitBeUsedForTraining : function(unit_id) {
			return typeof GameData.grepolympiaTraining[unit_id] !== 'undefined';
		}
	};

	window.GameDataGrepolympia = GameDataGrepolympia;
}(window));