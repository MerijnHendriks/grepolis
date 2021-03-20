/*global GameControllers, GameViews */
(function() {
	'use strict';

	var AcademyResearchController = GameControllers.AcademyBaseController.extend({
		isInResetingModeActive : function() {
			return false;
		},

		getViewClass : function() {
			return GameViews.AcademyResearchView;
		},

		onBtnClick : function(research_id) {
			this.buyResearch(research_id);
		}
	});

	window.GameControllers.AcademyResearchController = AcademyResearchController;
}());
