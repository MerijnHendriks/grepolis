define('events/grepolympia/models/largeicon_shop', function(require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var BenefitWithPreconditions = GameModels.BenefitWithPreconditions;

	var LargeiconGrepolympiashop = BenefitWithPreconditions.extend({

		getHappeningName : function () {
			return require('enums/happenings').GREPOLYMPIA;
		}

	});

	GameModels.LargeiconGrepolympiashop = LargeiconGrepolympiashop;

	return LargeiconGrepolympiashop;
});