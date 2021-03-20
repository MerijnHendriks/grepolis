/*globals ConfirmationWindowData */

(function() {
	'use strict';

	/**
	 * Class which represents data to create confirmation window for
	 * finish_research_order
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

	ConfirmationData.prototype.getTitle = function() {
		return this.l10n.window_title;
	};

	ConfirmationData.prototype.getQuestion = function() {
		return this.l10n.question(this.props.cost);
	};

	ConfirmationData.prototype.getType = function() {
		return 'finish_research_order';
	};

	ConfirmationData.prototype.hasCheckbox = function() {
		return true;
	};

	window.ConfirmationFinishResearchOrderWindowData = ConfirmationData;
}());
