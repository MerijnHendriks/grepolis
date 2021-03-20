/* global GPWindowMgr, Game, Layout */
define('features/custom_colors/views/custom_colors', function() {
	'use strict';

	var Views = require_legacy('GameViews');
	var ColorPickerFactory = require('features/color_picker/factories/color_picker');
	var MapColorChangesHelper = require('helpers/map_color_changes');
	var HelperDefaultColors = require('helpers/default_colors');
	var FILTERS = require('enums/filters');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		renderPlayerItemsAndAssignTooltips: function() {
			this.controller.getListOfPlayerCustomColors().forEach(function(player_custom_color_entry){
				var player_data = {
					type: player_custom_color_entry.getType(),
					id: player_custom_color_entry.getOtherId(),
					player_alliance_id: player_custom_color_entry.getPlayerAllianceId(),
					changeable: true,
					linked: true,
					deletable: true,
					a_link: this.controller.getLinkData(player_custom_color_entry.getOtherId(), player_custom_color_entry.getOtherName()),
					gp_link: 'gp_player_link',
					name: player_custom_color_entry.getOtherName(),
					color: player_custom_color_entry.getColor(),
					classes: ''
				};
				var new_elem = $(this.getTemplateWithData(player_data));
				new_elem.find('.highlight_color_btn').tooltip(this.l10n.assign_color_player);
				new_elem.find('.remove_color_btn').tooltip(this.l10n.delete_entry);
				this.$el.find('#player_box ul').append(new_elem);
			}.bind(this));
		},

		renderAllianceItemsAndAssignTooltips: function() {
			this.controller.getListOfAllianceCustomColors().forEach(function(alliance_custom_color_entry){
				var alliance_data = {
					type: alliance_custom_color_entry.getType(),
					id: alliance_custom_color_entry.getOtherId(),
					player_alliance_id: alliance_custom_color_entry.getPlayerAllianceId(),
					changeable: true,
					linked: true,
					deletable: true,
					name: alliance_custom_color_entry.getOtherName(),
					color: alliance_custom_color_entry.getColor(),
					classes: ''
				};
				var new_elem = $(this.getTemplateWithData(alliance_data));
				new_elem.find('.highlight_color_btn').tooltip(this.l10n.assign_color_alliance);
				new_elem.find('.remove_color_btn').tooltip(this.l10n.delete_entry);
				this.$el.find('#alliance_box ul').append(new_elem);
			}.bind(this));
		},

		renderOwnAllianceItemAndAssignTooltips: function() {
			var linked = false;
			if (Game.alliance_id) {
				linked = true;
			}
			var own_alliance_data = {
				type: FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE,
				id: 0,
				player_alliance_id: Game.alliance_id,
				changeable: true,
				linked: linked,
				deletable: false,
				name: this.l10n.your_alliance,
				color: this.controller.getCustomColorForOwnAlliance(),
				classes: FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE
			};

			var new_elem = $(this.getTemplateWithData(own_alliance_data));
			new_elem.find('.highlight_color_btn').tooltip(this.l10n.assign_color_alliance);
			this.$el.find('#others_box ul').append(new_elem);
		},

		renderOwnCitiesItemAndAssignTooltips: function() {
			var own_cities_data = {
				type: FILTERS.FILTER_TYPES.PLAYER,
				id: Game.player_id,
				player_alliance_id: Game.alliance_id,
				changeable: true,
				linked: false,
				deletable: false,
				name: this.l10n.your_cities,
				color: this.controller.getCustomColorForOwnCities()
			};
			var new_elem = $(this.getTemplateWithData(own_cities_data));
			new_elem.find('.highlight_color_btn').tooltip(this.l10n.assign_color_player);
			this.$el.find('#others_box ul').append(new_elem);
		},

		renderOtherCitiesItem: function() {
			var other_cities_data = {
					changeable: false,
					linked: false,
					deletable: false,
					name: this.l10n.other_cities,
					color: HelperDefaultColors.getDefaultColorByIdFromGameData(FILTERS.DEFAULT_PLAYER)
			};

			this.$el.find('#others_box ul').append(this.getTemplateWithData(other_cities_data));
		},

		renderPactItemAndAssignTooltips: function() {
			var linked = true;
			if(!Game.alliance_id) {
				linked = false;
			}
			var pact_data = {
				type: FILTERS.ALLIANCE_TYPES.PACT,
				id: 0,
				player_alliance_id: false,
				changeable: true,
				linked: linked,
				deletable: false,
				name: this.l10n.pacts,
				color: this.controller.getCustomColorForPact(),
				classes: FILTERS.ALLIANCE_TYPES.PACT
			};
			var new_elem = $(this.getTemplateWithData(pact_data));
			new_elem.find('.highlight_color_btn').tooltip(this.l10n.assign_color_pact);
			this.$el.find('#others_box ul').append(new_elem);
		},

		renderEnemyItemAndAssignTooltips: function() {
			var linked = true;
			if(!Game.alliance_id) {
				linked = false;
			}
			var enemy_data = {
				type: FILTERS.ALLIANCE_TYPES.ENEMY,
				id: 0,
				player_alliance_id: false,
				changeable: true,
				deletable: false,
				linked: linked,
				name: this.l10n.enemies,
				color: this.controller.getCustomColorForEnemy(),
				classes: FILTERS.ALLIANCE_TYPES.ENEMY
			};
			var new_elem = $(this.getTemplateWithData(enemy_data));
			new_elem.find('.highlight_color_btn').tooltip(this.l10n.assign_color_enemy);
			this.$el.find('#others_box ul').append(new_elem);
		},

		renderOtherItemsAndAssignTooltips: function() {
			this.renderOwnAllianceItemAndAssignTooltips();
			this.renderOwnCitiesItemAndAssignTooltips();
			this.renderOtherCitiesItem();
			this.renderPactItemAndAssignTooltips();
			this.renderEnemyItemAndAssignTooltips();
		},

		getTemplateWithData: function(data) {
			return us.template(this.controller.getTemplate('item'), data);
		},

		registerAllianceLinks: function() {
			this.$el.find('#alliance_box ul').off().on('click', function(event) {
				event.preventDefault();
				var clicked_elem = $(event.target);
				if (clicked_elem.hasClass('custom_color_element')) {
					Layout.allianceProfile.open(clicked_elem.attr('data-name'), clicked_elem.attr('data-id'));
				}
			}.bind(this));
		},

		registerOtherLinks: function() {
			this.$el.find('#others_box ul').off().on('click', function(event) {
				event.preventDefault();
				var clicked_elem = $(event.target);
				if (!clicked_elem.is('a')) {
					return;
				}
				if (clicked_elem.hasClass(FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE)) {
					GPWindowMgr.Create(GPWindowMgr.TYPE_ALLIANCE, this.l10n.alliance_window_title,{ sub_content: 'index'});
				} else if (clicked_elem.hasClass(FILTERS.ALLIANCE_TYPES.PACT) || clicked_elem.hasClass(FILTERS.ALLIANCE_TYPES.ENEMY)) {
					GPWindowMgr.Create(GPWindowMgr.TYPE_ALLIANCE, this.l10n.alliance_window_title,{ sub_content: 'alliance_pact'});
				}
			}.bind(this));
		},

		registerEventListeners: function() {
			this.$el.find('.color_boxes').off().on('click', function(event) {
				var element;
				if ($(event.target).hasClass('not_changeable')) {
					return;
				}
				else if ($(event.target).hasClass('btn_color')) {
					element = $(event.target);
				} else if ($(event.target).hasClass('highlight_color_btn')) {
					element = $(event.target).find('btn_color')[0];
				}

				if (element) {
					var type = element.attr('data-type'),
						id = element.attr('data-id'),
						player_alliance_id = element.attr('data-player_alliance_id'),
						color = element.attr('data-color'),
						name = element.parent().siblings('.custom_color_element').text();

					ColorPickerFactory.openWindow(type, id, function(new_color, remove_custom_color) {
						if(remove_custom_color) {
							MapColorChangesHelper.removeColorAssignment(new_color, type, id, false, player_alliance_id );
						} else {
							MapColorChangesHelper.assignColor(new_color, type, id);
						}
					}, null, color, player_alliance_id, name);
				}
			}.bind(this));

			this.$el.find('.remove_color_btn').off('click').on('click', function(event) {
				var element = $(event.target);
				var type = element.attr('data-type'),
					id = element.attr('data-id'),
					player_alliance_id = element.attr('data-player_alliance_id'),
					new_color;
				MapColorChangesHelper.removeColorAssignment(new_color, type, id, false, player_alliance_id );
			}.bind(this));

			this.registerAllianceLinks();
			this.registerOtherLinks();
		},

		reRender: function() {
			this.render();
		},

		render: function() {
			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n
			});

			this.renderPlayerItemsAndAssignTooltips();
			this.renderAllianceItemsAndAssignTooltips();
			this.renderOtherItemsAndAssignTooltips();
			this.registerEventListeners();
		}
	});
});
