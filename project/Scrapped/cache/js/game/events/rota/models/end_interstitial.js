define('events/rota/models/end_interstitial', function () {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var InfopageRotaEventEndInterstitial = GameModels.BenefitWithPreconditions;

	GameModels.InfopageRotaEventEndInterstitial = InfopageRotaEventEndInterstitial.extend({
		_satisfiesPrerequisites : function() {
			return this._hasSenateOnLevelGreaterOrEqualThan(5);
		}
	});

	return InfopageRotaEventEndInterstitial;
});