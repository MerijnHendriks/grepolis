/*globals WF, InterstitialWindowData, InterstitialBaseWindowData */

window.InterstitialWindowFactory = (function() {
	'use strict';

	return {
		_openInterstitialWindow : function(data_object) {
			if (!(data_object instanceof InterstitialBaseWindowData)) {
				throw 'To run _openInterstitialWindow you need to pass object which is instance of InterstitialBaseWindowData';
			}

			//General interstitial settings
			var dialog_settings = {
				preloaded_data : {
					data_object : data_object
				},
				window_settings : {
					minimizable : false,
					modal : false,
					width : 820,
					minheight: 466,
					skin: 'wnd_skin_column',
					closable : true,
					css_class : data_object.getType(),
					interstitial_type : data_object.getType(),
					activepagenr : 'interstitial_default'
				}
			};

			//Specific interstiwial window settings
			var window_settings = WF.getSettings(data_object.getType());

			return WF.open('dialog', $.extend(true, {}, dialog_settings, window_settings));
		},

		openInterstitialWindow : function(benefit, player_hint) {
			return this._openInterstitialWindow(new InterstitialWindowData(benefit, player_hint));
		}
	};
}());
