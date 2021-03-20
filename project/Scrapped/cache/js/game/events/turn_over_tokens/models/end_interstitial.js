/*
 * CAUTION for the devs who create new large icons similar to this, do not forget to enter the type to models/common/Benefit.php
 */
(function() {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageAssassinsEndInterstitial = function() {

	};

    InfopageAssassinsEndInterstitial._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(3);
	};

	window.GameModels.InfopageAssassinsEndInterstitial = BenefitWithPreconditions.extend(InfopageAssassinsEndInterstitial);
}());
