define('events/grid_event/models/welcome_interstitial', function (require) {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var InfopageGridEventWelcomeInterstitial = GameModels.BenefitWithPreconditions;

	GameModels.InfopageGridEventWelcomeInterstitial = InfopageGridEventWelcomeInterstitial.extend({});

	return InfopageGridEventWelcomeInterstitial;
});