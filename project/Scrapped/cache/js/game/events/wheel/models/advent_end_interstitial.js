/**
 * class to hold the infopage advent model
 */
(function() {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageAdventEndInterstitial = function() {
	};

	InfopageAdventEndInterstitial._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(5);
	};

	window.GameModels.InfopageAdventEndInterstitial = BenefitWithPreconditions.extend(InfopageAdventEndInterstitial);
}());
