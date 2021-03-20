define('features/community_goals/factories/goal_reached', function (require) {
	'use strict';

	var WF = require_legacy('WF'),
		WQM = require_legacy('WQM'),
    	windows = require('game/windows/ids'),
    	priorities = require('game/windows/priorities'),
		BenefitHelper = require('helpers/benefit');

	var CommunityGoalReachedWindowFactory = {

		openWindow: function (rewards) {
            WQM.addQueuedWindow({
                type : windows.COMMUNITY_GOAL_REACHED,
                priority : priorities.getPriority(),
                open_function : function() {
                    return WF.open(windows.COMMUNITY_GOAL_REACHED, {
                    	args: {
							rewards: rewards,
							window_skin: BenefitHelper.getBenefitSkin()
						}
                    });
                }
            });
		}
	};

	window.CommunityGoalReachedWindowFactory = CommunityGoalReachedWindowFactory;

	return CommunityGoalReachedWindowFactory;
});