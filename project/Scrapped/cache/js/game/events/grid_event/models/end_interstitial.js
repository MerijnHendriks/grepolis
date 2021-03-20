define('events/grid_event/models/end_interstitial', function (require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var InfopageGridEventEndInterstitial = GameModels.BenefitWithPreconditions;

	GameModels.InfopageGridEventEndInterstitial = InfopageGridEventEndInterstitial.extend({
		_satisfiesPrerequisites : function() {
			return this._hasSenateOnLevelGreaterOrEqualThan(5);
		}
	});

	return InfopageGridEventEndInterstitial;
});