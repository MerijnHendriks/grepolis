define('events/rota/models/welcome_interstitial', function () {
	'use strict';

	var GameModels = require_legacy('GameModels');
	var InfopageRotaEventWelcomeInterstitial = GameModels.BenefitWithPreconditions;

	GameModels.InfopageRotaEventWelcomeInterstitial = InfopageRotaEventWelcomeInterstitial.extend({});

	return InfopageRotaEventWelcomeInterstitial;
});