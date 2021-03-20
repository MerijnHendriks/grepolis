define('events/grid_event/dialogs/reset_grid', function (require) {
	'use strict';

	var ConfirmationWindowData = require_legacy('ConfirmationWindowData');
	var BenefitHelper = require('helpers/benefit');

	/**
	 * Class which represents data to create confirmation window for
	 * "confirmation reset grid"
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *     @param resource {Number}      resource amount
	 *     @param resource_type {String} name of the resource
	 *     @param cost {Number}          gold cost
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationResetGrid(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);
		this.l10n = BenefitHelper.getl10nPremiumForSkin(this.l10n, this.getType());
	}

	ConfirmationResetGrid.inherits(ConfirmationWindowData);

	ConfirmationResetGrid.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationResetGrid.prototype.getQuestion = function() {
		return this.l10n.question;
	};

	ConfirmationResetGrid.prototype.getType = function() {
		return 'grid_event_reset_grid';
	};

	return ConfirmationResetGrid;
});