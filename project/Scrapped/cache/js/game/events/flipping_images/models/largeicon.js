define('events/flipping_images/models/largeicon', function(require) {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;
	var LargeiconFlippingimages = BenefitWithPreconditions.extend({
		_satisfiesPrerequisites : function() {
			return this._hasSenateOnLevelGreaterOrEqualThan(3);
		}
	});

	window.GameModels.LargeiconFlippingimages= LargeiconFlippingimages;
	return LargeiconFlippingimages;
});


