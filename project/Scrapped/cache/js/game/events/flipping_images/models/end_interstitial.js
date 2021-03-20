define('events/flipping_images/models/end_interstitial', function(require) {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;
	var InfopageFlippingImagesEnd = BenefitWithPreconditions.extend({
		_satisfiesPrerequisites : function() {
			return this._hasSenateOnLevelGreaterOrEqualThan(3);
		}
	});

	window.GameModels.InfopageFlippingImagesEnd= InfopageFlippingImagesEnd;
	return InfopageFlippingImagesEnd;
});