/*global GameViews, ConfirmationWindowFactory, GameControllers */

(function() {
	'use strict';

	var AcademyResetController = GameControllers.AcademyBaseController.extend({
		isInResetingModeActive : function() {
			return true;
		},

		getViewClass : function() {
			return GameViews.AcademyResetView;
		},

		onBtnClick : function(research_id) {
			ConfirmationWindowFactory.openConfirmationResettingResearch(function(research_id) {

				var updateResearchPoints = function() {
					this.view.updateResearchPoints();
					this.view.updateAvailableResearchPointsTooltip();
					this.view.updateRevertTooltips(); // for culture points
				};

				this.revertResearch(research_id, updateResearchPoints.bind(this));

			}.bind(this, research_id));
		}
	});

	window.GameControllers.AcademyResetController = AcademyResetController;
}());