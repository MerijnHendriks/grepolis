define('events/grid_event/models/largeicon', function (require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var LargeiconGridevent = GameModels.BenefitWithPreconditions;

	GameModels.LargeiconGridevent = LargeiconGridevent.extend({});

	return LargeiconGridevent;
});