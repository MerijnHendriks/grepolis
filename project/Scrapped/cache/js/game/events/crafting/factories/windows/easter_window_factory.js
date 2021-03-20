/*globals WF */
define('events/crafting/factories/window/easter_window_factory', function(require) {
	'use strict';

	var BenefitHelper = require('helpers/benefit'),
		windows = require('game/windows/ids');

	var EasterWindowFactory = {
		/**
		 * Opens 'Easter' window
		 */
		openEasterWindow : function() {
			return WF.open(windows.EASTER,
				{
					args : {
						window_skin: BenefitHelper.getBenefitSkin()
					}
				}
			);
		},

		openEasterRecipesWindow : function() {
			return WF.open(windows.EASTER,
				{
					args : {
						activepagenr : 1,
						window_skin: BenefitHelper.getBenefitSkin()
					}
				}
			);
		},

		openEasterAlchemyWindow : function(ingredients) {
			return WF.open(windows.EASTER,
				{
					args : {
						activepagenr : 0,
						window_skin: BenefitHelper.getBenefitSkin(),
						data : {
							ingredients : ingredients
						}
					}
				}
			);
		},

		openEasterCollectWindow : function() {
			WF.open(windows.EASTER_COLLECT,
				{
					args : {
						window_skin: BenefitHelper.getBenefitSkin()
					}
				}
			);
		}
	};

	window.EasterWindowFactory = EasterWindowFactory;

	return EasterWindowFactory;
});