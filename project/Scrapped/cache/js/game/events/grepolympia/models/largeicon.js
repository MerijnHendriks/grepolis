define('events/grepolympia/models/largeicon', function(require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var BenefitWithPreconditions = GameModels.BenefitWithPreconditions;

	var LargeiconGrepolympia = BenefitWithPreconditions.extend({

		getHappeningName : function () {
			return require('enums/happenings').GREPOLYMPIA;
		}

	});

	GameModels.LargeiconGrepolympia = LargeiconGrepolympia;

	return LargeiconGrepolympia;
});