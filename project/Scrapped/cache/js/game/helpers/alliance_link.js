/* globals Layout */

define('helpers/alliance_link', function () {
	'use strict';

	return {
		getAllianceLink: function (alliance_id, alliance_name) {
			return '<span class="alliance_link" ' +
				'data-alliance_id="' + alliance_id + '"' +
				'data-alliance_name="' + alliance_name + '">' +
				alliance_name +
				'</span>';
		},

		registerOpenAllianceProfileClick: function ($el) {
			$el.off('click').on('click', function (event) {
				var $target = $(event.target);

				if ($target.hasClass('alliance_link')) {
					Layout.allianceProfile.open($target.data('alliance_name'), $target.data('alliance_id'));
				}

				event.preventDefault();
			});
		}
	};
});