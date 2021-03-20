/**
 * custom assassins controller for the welcome dialog instance which handles the infopage benefits with an animation at the start
 */
/* global GameViews */
(function () {
	'use strict';

	var GameControllers = window.GameControllers,
		BenefitHelper = require('helpers/benefit');

	var PREVENT_CLOSING = false;

	var AssassinsWelcomeInterstitialController = GameControllers.DialogInterstitialController.extend({

		initializeEventsListeners: function () {
			this.getBenefit().onEnded(this, this.handleOnBenefitEnded.bind(this));

			this.setOnManualClose(this.onCloseButtonAction.bind(this));
		},
		/**
		 * Overwrite the parent rendering because the parent render contains initializing of the basic interstitial view
		 * and when customized we don't want this behaviour
		 * @returns {AssassinsWelcomeInterstitialController}
		 */
		render: function () {
			this.extendWindowData();
			return this;
		},

		renderPage: function () {
			this.view = new GameViews.AssassinsWelcomeInterstitialView({
				el : this.$el,
				controller : this
			});
			this.isSlideShowEnabled = true;
		},

		onCloseButtonAction: function () {
			if(this.isSlideShowEnabled) {
				this.disableSlideShow();
				this.view.stopSlideShow();
				return PREVENT_CLOSING;
			}
			else {
				this.disableWindowForFuture();
			}
		},

		disableSlideShow: function () {
			this.isSlideShowEnabled = false;
		},

		getBenefitSkin: function () {
			return BenefitHelper.getBenefitSkin();
		}

	});

	window.GameControllers.AssassinsWelcomeInterstitialController = AssassinsWelcomeInterstitialController;
}());
