/*
 * CAUTION for the devs who create new large icons similar to this, do not forget to enter the type to models/common/Benefit.php
 */
define('events/crafting/models/welcome_interstitial', function(require) {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageEasterWelcome = function() {

	};

    InfopageEasterWelcome._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(3);
	};

	window.GameModels.InfopageEasterWelcome = BenefitWithPreconditions.extend(InfopageEasterWelcome);
	return InfopageEasterWelcome;
});
