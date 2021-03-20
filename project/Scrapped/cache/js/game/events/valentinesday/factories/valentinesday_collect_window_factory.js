/*global WF */
window.ValentinesDayCollectWindowFactory = (function() {
	'use strict';

	return {
		openWindow : function(mermaid_model) {
			WF.open('valentinesday_collect', {
				preloaded_data : {
					models : {
						mermaid : mermaid_model
					}
				},
				window_settings : {
					minimizable : false,
					modal : false,
					width : 820,
					minheight: 466,
					skin: 'wnd_skin_column',
					closable : true
				}
			});
		}
	};
}());