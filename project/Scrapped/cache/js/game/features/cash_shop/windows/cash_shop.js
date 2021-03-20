define('features/cash_shop/windows/cash_shop', function() {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var CashShopController = require('features/cash_shop/controllers/cash_shop');
	var WindowFactorySettings = require_legacy('WindowFactorySettings');
	var DM = require_legacy('DM');
	var window_type = windows.CASH_SHOP;

	WindowFactorySettings[window_type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(window_type);

		return us.extend({
			skin: 'wnd_skin_empty',
			modal: false,
			window_type: window_type,
			height: 620,
			width: 950,
			tabs: [
				{type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: CashShopController, hidden: true}
			],
			max_instances: 1,
			closable: true,
			minimizable: false,
			title: l10n.window_title
		}, props);
	};

	return WindowFactorySettings[window_type];
});