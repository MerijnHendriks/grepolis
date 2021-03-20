/*globals ConfirmationWindowData, DM */

define('features/god_selection/dialog/confirmation', function() {
	'use strict';

	var GameDataGods = require('data/gods');

	/**
	 * Class which represents data to create confirmation window for god selection
	 *
	 * @param props {Object}
	 *		@param new_god_id				id of the selected god
	 *		@param prev_god_id				id of the god that is worshipped
	 *		@param onConfirm {Function}		confirmation button callback
	 *		@param onCancel {Function}		cancel button callback
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationData(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);

		this.new_god = this.getGodName(props.new_god_id);
		this.prev_god = this.getGodName(props.prev_god_id);
		this.prev_god_id = props.prev_god_id;
		this.town_units = props.town_units;
		this.supporting_units = props.supporting_units;
		this.lose_all_fury = props.lose_all_fury;
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
		var passive_names = GameDataGods.getPassivePowerNamesForGod(this.prev_god_id);

		return {
			new_god: this.new_god,
			l10n: this.l10n,
			display_checkbox: this.hasCheckbox(),
			effects: this.l10n.effects(this.prev_god, this.prev_god_id, this.lose_all_fury),
			passive: passive_names.length > 0 ?
				this.l10n.passive(this.prev_god, passive_names.join(', '), passive_names.length) :
				null,
			town_units: this.town_units,
			supporting_units: this.supporting_units
		};
	};

	ConfirmationData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationData.prototype.getType = function() {
		return 'god_selection_confirmation';
	};

	ConfirmationData.prototype.hasCheckbox = function() {
		return true;
	};

	ConfirmationData.prototype.getConfirmCaption = function() {
		return this.l10n.confirm;
	};

	ConfirmationData.prototype.getCancelCaption = function() {
		return this.l10n.cancel;
	};

	ConfirmationData.prototype.getGodName = function(god_id) {
		return DM.getl10n('layout').powers_menu.gods[god_id];
	};

	return ConfirmationData;
});
