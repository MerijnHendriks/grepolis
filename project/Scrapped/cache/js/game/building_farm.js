/*globals ConfirmationWindowFactory, GameEvents, Timestamp*/
(function() {
	'use strict';

	var BuildingFarm = {
		wnd: null,
		next_militia_available: null,
		timer: null,
		militia_time: null,

		init: function(wnd, next_mil, militia_time){
			this.wnd = wnd;
			this.militia_time = militia_time;
			this.next_militia_available = next_mil;

			//clear interval handle if not undefined
			if (BuildingFarm.timer !== undefined) {
				window.clearInterval(BuildingFarm.timer = null);
			}

			var that = this;
			if(this.next_militia_available > 0){
				var militia_to_go = $('#militia_to_go');
				militia_to_go.countdown(this.next_militia_available);
				militia_to_go.unbind().bind('finish', function(){
					that.wnd.requestContentGet('building_farm', 'index', {bar: 'bar'});
				});

				//update the bar
				BuildingFarm.setupBarUpdateTimer();
			}
		},

		confirm_request_militia: function() {
			ConfirmationWindowFactory.openConfirmationEnlistMilitia(function() {
				BuildingFarm.action_request_militia();
			});
		},

		action_request_militia: function() {
			this.wnd.requestContentPost('building_farm', 'request_militia', {}, function() {
				$.Observer(GameEvents.building.farm.request_militia).publish();
			});
		},

		setupBarUpdateTimer: function(){
			//create new interval timer
			BuildingFarm.timer = window.setInterval(BuildingFarm.update, 1E4);
		},

		update: function(){
			var width = Math.round((1 - ((BuildingFarm.next_militia_available - Timestamp.now()) / BuildingFarm.militia_time)) * 280);
			$('#farm_militia div.storage_res').width(width);
		}
	};

	window.BuildingFarm = BuildingFarm;
}());