/* globals GameDataUnits, TM */

define('features/olympus/helpers/temple_info', function () {
	'use strict';

	var TooltipFactory = require('factories/tooltip_factory');

	return  {
		getUnitsFragment: function (units, add_tooltip) {
			var fragment = document.createDocumentFragment();

			GameDataUnits.allUnitIds().forEach(function (unit_id) {
				var slot = document.createElement('div'),
					value = document.createElement('div');

				if (units[unit_id] > 0) {
					slot.className = 'unit unit_icon40x40 ' + unit_id;
					slot.setAttribute('data-unit_id', unit_id);
					value.className = 'value';
					value.innerText = units[unit_id];

					slot.appendChild(value);
					fragment.appendChild(slot);

					$(slot).tooltip(TooltipFactory.getUnitCard(unit_id), {}, false);
				}
			});

			return fragment;
		},

		unregisterTempleInfoRefetchTimer: function () {
			TM.unregister('temple_info_refetch');
		},

		registerTempleInfoRefetchTimer: function (temple_info, callback) {
			this.unregisterTempleInfoRefetchTimer();
			TM.register('temple_info_refetch', 10000, function () {
				temple_info.reFetch(callback, {
					target_id: temple_info.getId()
				});
			});
		}
	};
});