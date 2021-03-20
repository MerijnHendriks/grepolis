/*globals ConfirmationWindowData */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * 'waste resources'
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationWasteResourcesFarmTowns(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);
	}

	ConfirmationWasteResourcesFarmTowns.inherits(ConfirmationWindowData);

	ConfirmationWasteResourcesFarmTowns.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationWasteResourcesFarmTowns.prototype.getQuestion = function() {
		return this.l10n.question;
	};

	ConfirmationWasteResourcesFarmTowns.prototype.getSecondQuestion = function() {
		return this.l10n.additional_question || '';
	};

	ConfirmationWasteResourcesFarmTowns.prototype.getType = function() {
		return 'waste_resources_farm_towns';
	};

	ConfirmationWasteResourcesFarmTowns.prototype.hasCheckbox = function() {
		return false;
	};

	window.ConfirmationWasteResourcesFarmTowns = ConfirmationWasteResourcesFarmTowns;
}());
