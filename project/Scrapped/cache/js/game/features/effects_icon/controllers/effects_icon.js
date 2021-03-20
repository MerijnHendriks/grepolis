define('features/effects_icon/controllers/effects_icon', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/effects_icon/views/effects_icon');
	var BenefitType = require('enums/benefit_types');

	return GameControllers.BaseController.extend({
		initialize: function (options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.benefits = this.getCollection('benefits');
			this.initializeView();
		},

		registerEventListeners: function () {
			this.stopListening();

			this.benefits.onBenefitAdd(this, this.renderPage);
            this.benefits.onBenefitChange(this, this.renderPage);
            this.benefits.onBenefitEnded(this, this.renderPage);
            this.benefits.onBenefitStarted(this, this.renderPage);
		},

		renderPage: function () {
			if (this.getActiveEffects().length > 0) {
				this.$el.show();
				this.view.render();
		 	} else {
				this.$el.hide();
			}
		},

		initializeView: function () {
            this.view = new View({
                controller: this,
                el: this.$el
            });

            this.registerEventListeners();
            this.renderPage();
        },

		getActiveEffects: function () {
			return this.benefits.models.filter(function (benefit) {
				var type = benefit.getBenefitType();

				return (type === BenefitType.PARTY ||
                    type === BenefitType.AUGMENTATION ||
                    type === BenefitType.AUGMENTATION_FAVOR ||
					type === BenefitType.AUGMENTATION_RESOURCE) &&
					benefit.isRunning();
			});
		}
	});
});
