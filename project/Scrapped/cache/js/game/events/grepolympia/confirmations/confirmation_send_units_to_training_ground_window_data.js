/*globals ConfirmationWindowData, DM */

(function() {
	'use strict';

	/**
	 * Class which represents data in confirmation dialog when user wants to
	 * send units to the training ground in the Grepolympia 'Training Ground'
	 * window
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationSendUnitsToTrainingGroundWindowData(props) {
		if (typeof props.onConfirm !== "function") {
			throw "onConfirm callback has to be function";
		}

		this.props = props;
		this.l10n = DM.getl10n("COMMON", "confirmation_window").send_units_to_training_ground;
	}

	ConfirmationSendUnitsToTrainingGroundWindowData.inherits(ConfirmationWindowData);

	ConfirmationSendUnitsToTrainingGroundWindowData.prototype.getTitle = function() {
		return this.l10n.title;
	};

	ConfirmationSendUnitsToTrainingGroundWindowData.prototype.getQuestion = function() {
		return this.l10n.question.part1 + '<div class="tip">' + this.l10n.question.part2 + '</div>';
	};

	ConfirmationSendUnitsToTrainingGroundWindowData.prototype.getConfirmCallback = function() {
		return this.props.onConfirm;
	};

	/*ConfirmationSendUnitsToTrainingGroundWindowData.prototype.getCancelCallback = function() {
		//Not needed in this case, but don't remove this comment
	};*/

	window.ConfirmationSendUnitsToTrainingGroundWindowData = ConfirmationSendUnitsToTrainingGroundWindowData;
}());