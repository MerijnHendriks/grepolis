define('events/turn_over_tokens/models/community_goals', function (require) {
	'use strict';

	var GrepolisModel = window.GrepolisModel;

	var CommunityGoals = GrepolisModel.extend({
		urlRoot : 'AssassinsCommunityGoals' //GP-23766  Rename to match backend
	});

	/**
	 * goals is an Array of objects containing:
	 * {
	 * 	threshold : <int>
	 * 	rewards : [<Reward>]
	 * }
	 */
	GrepolisModel.addAttributeReader(CommunityGoals.prototype,
		'goals',
		'total_points'
	);

	/**
	 * Helpers to access details of a goal
	 */
    CommunityGoals.prototype.getThresholdForLevel = function(level) {
		return this.get('goals')[level].threshold;
	};

    CommunityGoals.prototype.getRewardsForLevel = function(level) {
		return this.get('goals')[level].rewards;
	};

	/**
	 * return the total sum of all thresholds for all levels
	 */
    CommunityGoals.prototype.getPointsSumForAllLevel = function() {
		var goals = this.get('goals');

		return goals.reduce(function(prev, current) {
			return prev + current.threshold;
		}, 0);
	};

    CommunityGoals.prototype.onTotalPointsChange = function(obj, callback) {
		obj.listenTo(this, 'change:total_points', callback);
	};

    CommunityGoals.prototype.onGoalsChange = function(obj, callback) {
    	obj.listenTo(this, 'change:goals', callback);
	};

	window.GameModels.CommunityGoals = CommunityGoals;

	return CommunityGoals;
});

