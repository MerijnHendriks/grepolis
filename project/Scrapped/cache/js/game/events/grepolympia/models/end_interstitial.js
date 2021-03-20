define('events/grepolympia/models/end_interstitial', function(require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var BenefitWithPreconditions = GameModels.BenefitWithPreconditions;

	var InfopageGrepolympiaEndInterstitial = BenefitWithPreconditions.extend({

		_satisfiesPrerequisites: function () {
			return this._hasSenateOnLevelGreaterOrEqualThan(5);
		},

		getHappeningName : function () {
			return require('enums/happenings').GREPOLYMPIA;
		}
	});

	GameModels.InfopageGrepolympiaEndInterstitial = InfopageGrepolympiaEndInterstitial;

	return InfopageGrepolympiaEndInterstitial;
});
