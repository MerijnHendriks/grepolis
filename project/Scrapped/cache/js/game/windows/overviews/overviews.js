(function() {
	var Overviews = {
		power_popup_data: [],

		initializePowerPopupForTownOverview: function(power_id, town_id, finished_at) {
			var tooltip = TooltipFactory.getPowerTooltipWithCountdown(power_id, finished_at);
			$('#casted_powers_town_' + town_id + ' span.' + power_id).tooltip(tooltip);
		},

		openOverview: function(overview_type, controller) {
			controller = controller || 'town_overviews';

			var w = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_TOWN_OVERVIEWS);
			if (!w) {
				GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN_OVERVIEWS, _('Overviews'), {
					overview_type: overview_type,
					controller: controller
				}, Game.townId);
			} else {
				w.requestContentGet(controller, overview_type);
				w.toTop();
			}

			return w;
		},

		openBuildingWnd: function(town_id, building) {
			HelperTown.townSwitch(town_id);
			BuildingWindowFactory.open(building);
		}
	};

	window.Overviews = Overviews;
}());