define('models/alternative_gods/alternative_gods', function(require) {
	'use strict';

	var GameModels = require_legacy('GameModels');

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var AlternativeGodImages = BenefitWithPreconditions.extend({

		initialize : function() {
			var gods_class = this.getParam('css_class');
			if (this.isRunning()) {
				$('body').addClass('gods-' + gods_class);
			}

			this.onStarted(this, function() {
				$('body').addClass('gods-' + gods_class);
			});

			this.onEnded(this, function() {
				$('body').removeClass('gods-' + gods_class);
			});
		}
	});

	GameModels.AlternativeGodImages = AlternativeGodImages;

	return AlternativeGodImages;
});
