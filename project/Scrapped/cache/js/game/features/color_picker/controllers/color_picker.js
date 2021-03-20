/*globals Game*/
define('features/color_picker/controllers/color_picker', function() {
	'use strict';

	var View = require('features/color_picker/views/color_picker');
	var GameEvents = require('data/events');
	var FILTERS = require('enums/filters');
	var GameControllers = require_legacy('GameControllers');
	var MAX_TITLE_CHARACTER_COUNT = 28;

	return GameControllers.TabController.extend({

		initialize : function(options) {
			this.stopObservingEvent(GameEvents.window.open);
			this.observeEvent(GameEvents.window.open, function(){
				var args = this.getWindowModel().getArguments();

				this.stopObservingEvent(GameEvents.window.open);

				if (typeof args !== 'undefined' &&
					typeof args.window_position !== 'undefined' &&
					args.window_position !== null) {

					var position = args.window_position;

					this.$el.parent().css({
						top: position.top,
						left: position.left - this.$el.parent().outerWidth(true)
					});
				}
			}.bind(this));

			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		getType : function() {
			return this.getWindowModel().getArguments().type;
		},

		getTargetName : function() {
			return this.getWindowModel().getArguments().target_name;
		},

		getColorPickerType : function() {
			return (this.getType() === 'text') ? 'text' : 'image';
		},

		getId : function() {
			return this.getWindowModel().getArguments().id;
		},

		getAdditionalId : function() {
			return this.getWindowModel().getArguments().additional_id;
		},

		getCurrentColor : function() {
			return this.getWindowModel().getArguments().color;
		},

		getCallback : function() {
			return this.getWindowModel().getArguments().callback;
		},

		registerEventListeners : function() {
			this.stopObservingEvent(GameEvents.strategic_map_filter.close.color_picker);
			this.observeEvent(GameEvents.strategic_map_filter.close.color_picker, function() {
				this.closeWindow();
			}.bind(this));

			this.stopObservingEvent(GameEvents.window.minimize);
			this.observeEvent(GameEvents.window.minimize, function(e, target) {
				if (target.window_obj.getType() === 'strategic_map_filter') {
					this.closeWindow();
				}
			}.bind(this));
		},

		renderPage: function() {
			this.initializeView();
			this.initializeTitle();
		},

		initializeView : function() {
			this.view = new View({
				controller : this,

				el : this.$el
			});
			this.registerEventListeners();
		},

		initializeTitle : function() {
			var window_title;
			var color_picker_type = this.getType();

			switch(color_picker_type) {
				case FILTERS.FILTER_TYPES.ALLIANCE:
					if (this.getTargetName() !== undefined) {
						window_title = this.l10n.other_alliance_title(this.getTargetName());
					} else {
						// this case applies if the user has manually added their own alliance, rather than using the 'your alliance' special entry
						window_title = this.l10n.own_alliance_title;
					}
					break;
				case FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE:
					window_title = this.l10n.own_alliance_title;
					break;
				case FILTERS.FILTER_TYPES.PLAYER:
					if (this.getId() !== Game.player_id) {
						window_title = this.l10n.other_players_cities_title(this.getTargetName());
					} else {
						window_title = this.l10n.own_cities_title;
					}
					break;
				case FILTERS.ALLIANCE_TYPES.PACT:
					window_title = this.l10n.pacts_title;
					break;
				case FILTERS.ALLIANCE_TYPES.ENEMY:
					window_title = this.l10n.enemies_title;
					break;
			}
			// we automatically remove exceeding characters to ensure that the window title is displayed correctly
			if (window_title !== undefined) {
				this.getWindowModel().setTitle(window_title.truncate(MAX_TITLE_CHARACTER_COUNT));
			}
		}
	});
});