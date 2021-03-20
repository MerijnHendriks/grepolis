/* globals Timestamp */

define('events/grepolympia/models/grepolympia_athlete', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var GrepolympiaAthlete = GrepolisModel.extend({
		urlRoot : 'GrepolympiaAthlete',

		getDiscipline : function () {
			return this.get('discipline');
		},

		getAvailableSkillPoints : function () {
			return Math.floor(this.get('training_points') / this.get('training_points_per_skillpoint'));
		},

		getSkills : function() {
			return [
				this.get('first_skill_points'),
				this.get('second_skill_points'),
				this.get('third_skill_points')
			];
		},

		getSkillPoints : function(type) {
			return this.get(type);
		},

		/**
		 * @return number of available skill points
		 *
		 */
		increaseSkill : function(type) {
			var _self = this, available_skill_points = this.getAvailableSkillPoints(),
				training_points,
				training_points_per_skill,
				value;

			if (available_skill_points > 0) {
				value = this.getSkillPoints(type);
				training_points = this.get('training_points');
				training_points_per_skill = this.get('training_points_per_skillpoint');

				this.execute('updateSkills', {skill : type}, function() {
					//Update model only when action was successful
					_self.set('training_points', training_points - training_points_per_skill, {silent : true});
					_self.set(type, value + 1);
				});

				return available_skill_points - 1;
			}

			return 0;
		},

		getTrainingPointsPerSkillpoint : function() {
			return this.get('training_points') % this.get('training_points_per_skillpoint');
		},

		getMaxTrainingPointsPerSkillpoint : function() {
			return this.get('training_points_per_skillpoint');
		},

		startTraining : function(unit_type, amount) {
			this.execute('startTraining', {'unit_type' : unit_type, 'amount' : amount});
		},

		resetSkills : function() {
			var skill_points = 0;

			//Get all points which has been already distributed
			$.each(this.getSkills(), function(index, value) {
				skill_points += value;
			});

			//Add also points which remained to distribute
			skill_points += this.getAvailableSkillPoints();

			this.execute('resetSkills', {});

		},

		buySlot : function () {
			this.execute('buySlot', {});
		},

		buyBonus : function (callbacks) {
			var _self = this;

			this.execute('buyBonus', {}, {
				success : function(data) {
					_self.set('training_bonus', data.bonus_finished_at);

					if (typeof callbacks !== 'undefined' && typeof callbacks.success === 'function') {
						callbacks.success();
					}
				},

				error : function() {
					if (typeof callbacks !== 'undefined' && typeof callbacks.error === 'function') {
						callbacks.error();
					}
				}
			});
		},

		isBonusActive : function() {
			return this.get('training_bonus_ends_at') > Timestamp.now();
		},

		makeBonusInactive : function() {
			return this.set('training_bonus_ends_at', null);
		},

		getTimestampBonusEndsAt : function() {
			return this.get('training_bonus_ends_at');
		},

		getTimestampBonusStartsAt : function() {
			return this.get('training_bonus_starts_at');
		},

		doAttempt : function(callback) {
			this.execute('doAttempt', {}, callback);
		},

		buyAttempt : function (callback) {
			this.execute('buyAttempt', {}, callback);
		},

		hasFreeAttempt : function() {
			return this.get('has_free_attempt');
		},

		onTrainingBonusEndsAtChange : function(obj, callback) {
			obj.listenTo(this, 'change:training_bonus_ends_at', callback);
		},

		onTrainingPointsChange : function(obj, callback) {
			obj.listenTo(this, 'change:training_points', callback);
		},

		onExtraSlotCountChange : function(obj, callback) {
			obj.listenTo(this, 'change:extra_slot_count', callback);
		}

	});

	GrepolisModel.addAttributeReader(GrepolympiaAthlete.prototype,
		'id',
		'training_bonus_starts_at',
		'training_bonus_ends_at',
		'extra_slot_count',
		'training_points',
		'current_level',
		'participation_interval_duration',
		'discipline_awards',
		'calculated_participation_costs',
		'current_training_points',
		'next_free_participation_at',
        'discipline_reward',
        'reward_effect_duration',
		'athlete_boost_active',
		'athlete_boost_configuration'
	);

	// this is needed for the model manager to discover this model
	window.GameModels.GrepolympiaAthlete = GrepolympiaAthlete;

	return GrepolympiaAthlete;
});
