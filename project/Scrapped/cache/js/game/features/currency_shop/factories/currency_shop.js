define('features/currency_shop/factories/currency_shop', function() {
	'use strict';

	return {
		openWindow: function(window_controller, shop_items_collection) {
			var l10n = window_controller.getl10n().shop,
				SubWindowTutorialController = require('features/currency_shop/controllers/currency_shop'),
				controller = new SubWindowTutorialController({
					l10n : l10n,
					window_controller : window_controller,
					templates : {
						shop: window_controller.getTemplate('shop'),
						shop_item: window_controller.getTemplate('shop_item')
					},
					collections : {
						shop_items: shop_items_collection
					},
					cm_context : {
						main : window_controller.getMainContext(),
						sub: 'sub_window_shop'
					}
				});

			window_controller.openSubWindow({
				title: l10n.title,
				controller : controller,
				skin_class_names : 'classic_sub_window'
			});
		}
	};
});
