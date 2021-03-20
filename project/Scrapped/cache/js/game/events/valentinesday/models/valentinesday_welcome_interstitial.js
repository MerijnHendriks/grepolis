/*globals MM, Game */
(function() {
	'use strict';

	var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;

	var InfopageValentineWelcome = function() {
	};

	InfopageValentineWelcome._bindCustomStartListener = function(callback, context) {
		this._bindCustomStartEndListener(callback, context);
	};

	InfopageValentineWelcome._bindCustomEndListener = function(callback, context) {
		this._bindCustomStartEndListener(callback, context);
	};

	InfopageValentineWelcome._bindCustomStartEndListener = function(callback, context) {
		var mermaid = this._getModel();

		if (mermaid) {
			mermaid.on('change:visible', callback, context);
		}
	};

	InfopageValentineWelcome._satisfiesPrerequisites = function() {
		var mermaid = this._getModel();
		return mermaid ? mermaid.isVisible() : false;
	};

	InfopageValentineWelcome._getModel = function() {
		return MM.getModels().Mermaid[Game.player_id];
	};

	window.GameModels.InfopageValentineWelcome = BenefitWithPreconditions.extend(InfopageValentineWelcome);
}());
