/*globals ConfirmationWindowData */

define('features/spells_dialog/dialogs/confirmation_cast_cap_of_invisibility' , function () {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * "casting negative spells"
	 *
	 * @param props {Object}
	 *		@param onConfirm {Function}   confirmation button callback
	 *		@param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationCastCapOfInvisibility(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);
	}

	ConfirmationCastCapOfInvisibility.inherits(ConfirmationWindowData);

	ConfirmationCastCapOfInvisibility.prototype.getTitle = function () {
		return this.l10n.window_title;
	};

	ConfirmationCastCapOfInvisibility.prototype.getQuestion = function () {
		return this.l10n.question;
	};

	ConfirmationCastCapOfInvisibility.prototype.getType = function () {
		return 'confirmation_cast_cap_of_invisibility';
	};

	ConfirmationCastCapOfInvisibility.prototype.hasCheckbox = function () {
		return false;
	};

	return ConfirmationCastCapOfInvisibility;
});