/*globals ConfirmationWindowData, GameData */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * 'waste resources'
	 *
	 * @param props {Object}
	 *     @param onConfirm {Function}   confirmation button callback
	 *     @param onCancel {Function}    cancel button callback
	 *     @param wasted_resources {Object} hash of resource / number key values
	 *
	 * @see ConfirmationWindowData class for details about all methods
	 */
	function ConfirmationWasteResourcesData(props) {
		ConfirmationWindowData.prototype.constructor.apply(this, arguments);
	}

	ConfirmationWasteResourcesData.inherits(ConfirmationWindowData);

	ConfirmationWasteResourcesData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationWasteResourcesData.prototype.getQuestion = function() {
		return this.props.has_multiple_targets ?
			this.l10n.question :
			this.l10n.question(this.props.town_name);
	};

	ConfirmationWasteResourcesData.prototype.getSecondQuestion = function() {
		return this.l10n.additional_question || '';
	};

	ConfirmationWasteResourcesData.prototype.hasResources = function() {
		return true;
	};

	ConfirmationWasteResourcesData.prototype.getResources = function() {
		return this.props.wasted_resources;
	};

	ConfirmationWasteResourcesData.prototype.getType = function() {
		return this.props.has_multiple_targets ? 'waste_resources_multiple' : 'waste_resources';
	};

	ConfirmationWasteResourcesData.prototype.hasCheckbox = function() {
		return true;
	};

	ConfirmationWasteResourcesData.prototype.getResourcesNames = function() {
		return Object.assign(GameData.resource_names, this.l10n.god_resources);
	};

	window.ConfirmationWasteResourcesData = ConfirmationWasteResourcesData;
}());
