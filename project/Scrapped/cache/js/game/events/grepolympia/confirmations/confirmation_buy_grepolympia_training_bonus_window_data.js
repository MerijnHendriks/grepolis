/*globals ConfirmationWindowData, DM, GameDataGrepolympia */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * "buy grepolympia training bonus for gold"
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationBuyGrepolympiaTrainingBonusWindowData(props) {
		this.props = props;

		if (typeof props.onConfirm !== "function") {
			throw "onConfirm callback has to be function";
		}

		this.l10n = DM.getl10n("premium").buy_grepolympia_training_bonus.confirmation;
	}

	ConfirmationBuyGrepolympiaTrainingBonusWindowData.inherits(ConfirmationWindowData);

	ConfirmationBuyGrepolympiaTrainingBonusWindowData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationBuyGrepolympiaTrainingBonusWindowData.prototype.getQuestion = function() {
		return this.l10n.question(GameDataGrepolympia.getTrainingBonusCost());
	};

	ConfirmationBuyGrepolympiaTrainingBonusWindowData.prototype.getConfirmCallback = function() {
		return this.props.onConfirm;
	};

	ConfirmationBuyGrepolympiaTrainingBonusWindowData.prototype.getCancelCallback = function() {
		return this.props.onCancel;
	};

	ConfirmationBuyGrepolympiaTrainingBonusWindowData.prototype.hasCheckbox = function() {
		return true;
	};

	window.ConfirmationBuyGrepolympiaTrainingBonusWindowData = ConfirmationBuyGrepolympiaTrainingBonusWindowData;
}());