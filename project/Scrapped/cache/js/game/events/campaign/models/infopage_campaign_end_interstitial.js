(function() {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var ModelClass = function() {};

	ModelClass._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(5);
	};

	window.GameModels.InfopageHercules2014EndInterstitial = BenefitWithPreconditions.extend(ModelClass);
}());
