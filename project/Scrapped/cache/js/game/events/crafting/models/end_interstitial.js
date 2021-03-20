/*
 * CAUTION for the devs who create new large icons similar to this, do not forget to enter the type to models/common/Benefit.php
 */
define('events/crafting/models/end_interstitial', function(require) {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageEasterEndInterstitial = function() {

	};

	InfopageEasterEndInterstitial._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(5);
	};

	window.GameModels.InfopageEasterEndInterstitial = BenefitWithPreconditions.extend(InfopageEasterEndInterstitial);
	return InfopageEasterEndInterstitial;
});
