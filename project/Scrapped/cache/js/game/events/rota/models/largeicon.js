define('events/rota/models/largeicon', function () {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var LargeiconRota = GameModels.BenefitWithPreconditions;

	GameModels.LargeiconRota = LargeiconRota.extend({});

	return LargeiconRota;
});