(function() {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageAssassinsShopInterstitial = function() {

	};

	InfopageAssassinsShopInterstitial._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(3);
	};

	window.GameModels.InfopageAssassinsShopInterstitial = BenefitWithPreconditions.extend(InfopageAssassinsShopInterstitial);
}());
