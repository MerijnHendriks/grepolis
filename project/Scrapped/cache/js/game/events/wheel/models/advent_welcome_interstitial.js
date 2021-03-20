(function() {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageAdventWelcome = function() {
	};

	InfopageAdventWelcome._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(3);
	};

	window.GameModels.InfopageAdventWelcome = BenefitWithPreconditions.extend(InfopageAdventWelcome);
}());
