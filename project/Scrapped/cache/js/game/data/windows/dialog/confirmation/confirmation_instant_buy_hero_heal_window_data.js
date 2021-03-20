/*globals ConfirmationWindowData, DM */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * instant_buy_hero_heal
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}      confirmation button callback
	 *     @param onCancel {Function}       cancel button callback
	 *     @param cost {Number}             cost of the ingredient
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationData(props) {
		this.props = props;

		if (typeof props.onConfirm !== 'function') {
			throw 'onConfirm callback has to be function';
		}

		if (typeof props.cost !== 'number') {
			throw 'cost has to be number';
		}

		this.l10n = DM.getl10n('premium').instant_buy_hero_heal.confirmation;
	}

	ConfirmationData.inherits(ConfirmationWindowData);

	ConfirmationData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationData.prototype.getQuestion = function() {
		return this.l10n.question(this.props.cost);
	};

	ConfirmationData.prototype.getConfirmCallback = function() {
		return this.props.onConfirm;
	};

	ConfirmationData.prototype.getCancelCallback = function() {
		return this.props.onCancel;
	};

	ConfirmationData.prototype.getType = function() {
		return 'instant_buy_hero_heal';
	};

	ConfirmationData.prototype.hasCheckbox = function() {
		return true;
	};

	window.ConfirmationInstantBuyHeroHealWindowData = ConfirmationData;
}());
