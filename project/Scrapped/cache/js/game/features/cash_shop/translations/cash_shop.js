/* globals DM */

define("features/cash_shop/translations/cash_shop", function () {
	'use strict';

	DM.loadData({
		l10n: {
			cash_shop : {
				window_title: _('Buy gold'),
				tabs: [],
				buying_disabled : _("Unfortunately you can't buy gold at the moment."),
				activate_email : _('Activate email')
			}
		}
	});
});