/* global us, GameEvents */

define('features/world_wonder_donations/controllers/world_wonder_donations', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/world_wonder_donations/views/world_wonder_donations');
	var WonderParticipations = require('features/world_wonder_donations/collections/wonder_participations');
	var playerFilterName = '';
	var isReRenderPending;

	return GameControllers.TabController.extend({
		ALL: 'all',
		playerFilterName: playerFilterName,

		initialize: function(options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);

			// Initialize re-render flag (see reRenderIfMaximized function below).
			// May already be true here, in case the user opens the donations for a different world wonder while having previously minimized the window.
			isReRenderPending = this.window_model.isMinimized();

			this.observeEvent(GameEvents.window.maximize, function() {
				if (isReRenderPending) {
					isReRenderPending = false;
					this.view.reRender();
				}
			}.bind(this));
		},

		renderPage: function() {
			this.wonder_participations = this.getCollection('wonder_participations');
			this.initializeView();
		},

		initializeView: function() {
			// see if the factory passed a specific wonder_type to open
			var args = this.getWindowModel().getArguments();
			var passed_wonder_type = (args && args.wonder_type);
			var wonder_type = us.contains(this.getWonderTypes(), passed_wonder_type) ? passed_wonder_type : this.ALL;

			this.view = new View({
				controller : this,
				el : this.$el,
				wonder_type: wonder_type
			});

			this.wonder_participations.onChange(this, this.reRenderIfMaximized);
		},

		// If the window is maximized, reRender the content.
		// If minimized, postpone re-render until view gets maximized to prevent scrollbar display bugs.
		reRenderIfMaximized: function() {
			if (this.window_model.isMinimized()) {
				isReRenderPending = true;
			} else {
				this.view.reRender();
			}
		},

		filterByPlayerName: function(player_filter_name) {
			this.playerFilterName = (player_filter_name || '');
			this.view.reRender();
		},

		getInAllianceDonationsForWonderType: function(wonder_type) {
			var entries = [];

			if (!wonder_type || wonder_type ===  this.ALL) {
				var active_players = this.wonder_participations
					.where({still_in_alliance: true});

				// group by player_id so different wonders a player has donated to will be combined
				var grouped = us.chain(active_players)
					.groupBy(function(x){ return x.getPlayerId(); })
					.values()
					.reduce( function(mem, group )  {
						var item = group[0].clone();
						item.set('wonder_type', 'all');
						for (var i=1; i<group.length; i++) {
							var curr = group[i];
							item.set('wood', item.getWood() + curr.getWood());
							item.set('stone', item.getStone() + curr.getStone());
							item.set('iron', item.getIron() + curr.getIron());
						}
						mem.push(item);
						return mem;
					}, [])
					.value();

				// put into a collection so sorting works
				entries = new WonderParticipations(grouped).sort().models;
			} else {
				entries = this.wonder_participations.where({still_in_alliance: true, wonder_type: wonder_type});
			}

			var excluded_players = Object.keys(us.groupBy(entries, function(model) { return model.getPlayerId(); }));
			var members_with_no_donation = this.wonder_participations.createEmptyModels(excluded_players);

			// alliance members who have not yet donated are mixed in with 0 values
			Array.prototype.push.apply(entries, members_with_no_donation);

			// Set "isDisplayed" flag depending on active name filter (it gets evaluated in the template)
			entries.forEach(function(model) {
				model.showInResults();
			}.bind(this));

			if (this.playerFilterName.length > 0) {
				entries.forEach(function (model) {
					if (model.getName().indexOf(this.playerFilterName) === -1) {
						model.hideFromResults();
					}
				}.bind(this));
			}

			return entries;
		},

		containsPlayerFilter: function(data) {
			return data.getName().indexOf(this.playerFilterName) >= 0;
		},

		/**
		 * @return [String] - wonder_types that have participation entries
		 */
		getWonderTypes: function() {
			return us.uniq(this.wonder_participations.pluck('wonder_type'));
		}

	});
});

