/*
 * CAUTION for the devs who create new large icons similar to this, do not forget to enter the type to models/common/Benefit.php
 */
define('events/crafting/models/largeicon', function(require) {
	"use strict";

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var LargeiconEaster = function() {};

	LargeiconEaster._satisfiesPrerequisites = function() {
		return this._hasSenateOnLevelGreaterOrEqualThan(3);
	};

	window.GameModels.LargeiconEaster = BenefitWithPreconditions.extend(LargeiconEaster);
	return LargeiconEaster;
});
