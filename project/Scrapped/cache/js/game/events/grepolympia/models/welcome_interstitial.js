define('events/grepolympia/models/welcome_interstitial', function(require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var BenefitWithPreconditions = GameModels.BenefitWithPreconditions;

	var InfopageGrepolympiaWelcome = BenefitWithPreconditions.extend({

		getHappeningName : function () {
			return require('enums/happenings').GREPOLYMPIA;
		}

	});

	GameModels.InfopageGrepolympiaWelcome = InfopageGrepolympiaWelcome;

	return InfopageGrepolympiaWelcome;
});
