/*globals ConfirmationWindowData, DM, GameDataGrepolympia */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * "buy grepolympia training slot for gold"
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationBuyGrepolympiaSlotWindowData(props) {
		this.props = props;

		if (typeof props.onConfirm !== "function") {
			throw "onConfirm callback has to be function";
		}

		if (typeof props.onCancel !== "function") {
			throw "onCancel callback has to be function";
		}

		this.l10n = DM.getl10n("premium").buy_grepolympia_training_slot.confirmation;
	}

	ConfirmationBuyGrepolympiaSlotWindowData.inherits(ConfirmationWindowData);

	ConfirmationBuyGrepolympiaSlotWindowData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationBuyGrepolympiaSlotWindowData.prototype.getQuestion = function() {
		return this.l10n.question.part1(GameDataGrepolympia.getExtraSlotCost()) +
			'<div class="tip">' + this.l10n.question.part2 + '</div>';
	};

	ConfirmationBuyGrepolympiaSlotWindowData.prototype.getConfirmCallback = function() {
		return this.props.onConfirm;
	};

	ConfirmationBuyGrepolympiaSlotWindowData.prototype.getCancelCallback = function() {
		return this.props.onCancel;
	};

	ConfirmationBuyGrepolympiaSlotWindowData.prototype.hasCheckbox = function() {
		return true;
	};

	window.ConfirmationBuyGrepolympiaSlotWindowData = ConfirmationBuyGrepolympiaSlotWindowData;
}());