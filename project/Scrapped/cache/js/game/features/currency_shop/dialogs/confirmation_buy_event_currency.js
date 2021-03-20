/* globals ConfirmationWindowData */

define('features/currency_shop/dialogs/confirmation_buy_event_currency', function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * "grid_event_buy_currency"
	 *
	 * @param props {Object}
	 * 		@param amount {Number}
	 * 		@param cost {Number}
	 * 		@param onConfirm {Function}   confirmation button callback
	 * 		@param onCancel {Function}    cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationBuyCurrency(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);

		var BenefitHelper = require('helpers/benefit');
		this.l10n = BenefitHelper.getl10nPremiumForSkin(this.l10n, this.getType());
	}

	ConfirmationBuyCurrency.inherits(ConfirmationWindowData);

	ConfirmationBuyCurrency.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationBuyCurrency.prototype.getQuestion = function() {
		return this.l10n.question(this._getAmount(), this._getCost());
	};

	ConfirmationBuyCurrency.prototype._getAmount = function () {
		return this.props.amount;
	};

	ConfirmationBuyCurrency.prototype._getCost = function() {
		return this.props.cost;
	};

	ConfirmationBuyCurrency.prototype.getType = function() {
		return 'buy_event_currency';
	};

	ConfirmationBuyCurrency.prototype.hasCheckbox = function() {
		return true;
	};

	return ConfirmationBuyCurrency;
});
