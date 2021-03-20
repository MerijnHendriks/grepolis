/*globals ConfirmationWindowData */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * 'found city'
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationFoundCityData(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);
	}

	ConfirmationFoundCityData.inherits(ConfirmationWindowData);

	ConfirmationFoundCityData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationFoundCityData.prototype.getQuestion = function() {
		return this.l10n.question;
	};

	ConfirmationFoundCityData.prototype.getType = function() {
		return 'found_city';
	};

	ConfirmationFoundCityData.prototype.hasCheckbox = function() {
		return true;
	};

	window.ConfirmationFoundCityData = ConfirmationFoundCityData;
}());
