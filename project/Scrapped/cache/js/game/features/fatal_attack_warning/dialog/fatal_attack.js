/*globals ConfirmationWindowData */

define('features/fatal_attack_warning/dialog/fatal_attack', function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * assassins_reset_targets
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}      confirmation button callback
	 *     @param onCancel {Function}       cancel button callback
	 *     @param cost {Number}             cost of the ingredient
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationData(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);
	}

	ConfirmationData.inherits(ConfirmationWindowData);

	ConfirmationData.prototype.hasCustomTemplate = function() {
		return true;
	};

	// custom templates must be added to data_frontend_bridge
	ConfirmationData.prototype.getCustomTemplateName = function() {
		return this.getType();
	};

	ConfirmationData.prototype.getCustomTemplateData = function() {
		return {
			l10n: this.l10n,
			display_checkbox: this.hasCheckbox()
		};
	};

	ConfirmationData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationData.prototype.getType = function() {
		return 'fatal_attack_warning';
	};

	ConfirmationData.prototype.hasCheckbox = function() {
		return false;
	};

	ConfirmationData.prototype.getConfirmCaption = function() {
		return this.l10n.attack;
	};

	ConfirmationData.prototype.getCancelCaption = function() {
		return this.l10n.abort;
	};

	return ConfirmationData;
});
