/* globals us, Game */
define('features/strategic_map_filter/controllers/strategic_map_filter', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/strategic_map_filter/views/strategic_map_filter');
	var FILTERS = require('enums/filters');
	var main_search_filter = FILTERS.FILTER_TYPES.ALLIANCE;
	var GameEvents = require('data/events');
	var DefaultColors = require('helpers/default_colors');
	var HelperWindowInfos = require('helpers/window_infos');
	var windows = require('game/windows/ids');
	var HIGHLIGHT_WINDOW_STATE = 'strategic_map_highlight_window_state';

	return GameControllers.TabController.extend({

		main_filter_options: [
			{value: FILTERS.FILTER_TYPES.ALLIANCE, name: null},
			{value: FILTERS.FILTER_TYPES.PLAYER, name: null}
			// {value: FILTERS.FILTER_TYPES.CITYGROUP, name : null }
		],
		alliance_filter_option: [
			{value: FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE, name: null, checked: false},
			{value: FILTERS.ALLIANCE_TYPES.PACT, name: null, checked: false},
			{value: FILTERS.ALLIANCE_TYPES.ENEMY, name: null, checked: false}
		],
		player_filter_option: [
			{value: FILTERS.PLAYER_TYPES.OWN_CITIES, name: null, checked: false}
		],
		filter_window_position: {},


		filter_options: {},

		initialize: function (options) {
			this.stopObservingEvent(GameEvents.window.open);
			this.observeEvent(GameEvents.window.open, function (e, win) {
				// old windows send a different object in this event
				if (win.wnd) {
					win = win.wnd;
				}
				if (win.getType() === windows.STRATEGIC_MAP_FILTER) {
					this.stopObservingEvent(GameEvents.window.open);
					this.$el.parent().css(this.getPosition());

					if (!window.HelperPlayerHints.isHintEnabled(HIGHLIGHT_WINDOW_STATE)) {
						win.minimize();
					}
				}
			}.bind(this));

			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		assignFilterFunctions: function () {
			this.filter_options.alliance = {
				getFilterOption: this.getAllianceFilterOptions.bind(this),
				setFilterOptions: this.setAllianceFilterOptions.bind(this),
				setCheckedStateOptions: this.setAllianceCheckedStateToFilterOption.bind(this),
				removeFilterOptions: this.removeAllianceFilterOptions.bind(this),
				getSpecificFilterOption: this.getSpecificAllianceFilterOption.bind(this),
				setColorToFilterOption: this.setAllianceColorToFilterOption.bind(this),
				setCustomColor: this.setCustomColorForAlliance.bind(this),
				getTooltipText: this.getAllianceTooltipText.bind(this)
			};
			this.filter_options.player = {
				getFilterOption: this.getPlayerFilterOptions.bind(this),
				setFilterOptions: this.setPlayerFilterOptions.bind(this),
				setCheckedStateOptions: this.setPlayerCheckedStateToFilterOption.bind(this),
				removeFilterOptions: this.removePlayerFilterOptions.bind(this),
				getSpecificFilterOption: this.getSpecificPlayerFilterOption.bind(this),
				setColorToFilterOption: this.setPlayerColorToFilterOption.bind(this),
				setCustomColor: this.setCustomColorForPlayer.bind(this),
				getTooltipText: this.getPlayerTooltipText.bind(this)
			};
		},

		registerEventListeners: function () {
			this.stopObservingEvent(GameEvents.map.zoom_in);
			this.observeEvent(GameEvents.map.zoom_in, function () {
				this.stopObservingEvent(GameEvents.map.zoom_in);
				this.publishCloseColorPickerEvent();
				this.filter_window_position.top = this.$el.parent().offset().top;
				this.filter_window_position.left = this.$el.parent().offset().left;
				this.closeWindow();
			}.bind(this));

			this.window_model.onMinimizedChange(this, this.saveWindowOpenStateToBackend);

			this.stopObservingEvent(GameEvents.minimap.mouse_events.mouse_up);
			this.observeEvent(GameEvents.minimap.mouse_events.mouse_up, function () {
				this.view.filterItemsOnMiniMap();
			}.bind(this));

			this.stopObservingEvent(GameEvents.minimap.load_chunks);
			this.observeEvent(GameEvents.minimap.load_chunks, function () {
				this.view.filterItemsOnMiniMap();
			}.bind(this));

			this.stopObservingEvent(GameEvents.minimap.refresh);
			this.observeEvent(GameEvents.minimap.refresh, function () {
				this.view.filterItemsOnMiniMap();
			}.bind(this));

			this.stopObservingEvent(GameEvents.color_picker.change_color);
			this.observeEvent(GameEvents.color_picker.change_color, function (e, data) {
				if (data.type !== 'text') {
					this.updateColors(data);
					if (data.type === 'enemy' || data.type === 'pact') {
						this.updateAlliancePeaceOrEnemyColors(data);
					}
				}
			}.bind(this));

			this.stopObservingEvent(GameEvents.document.window.resize);
			this.observeEvent(GameEvents.document.window.resize, function () {
				if ($('body').innerWidth() < HelperWindowInfos.getMinSupportedWindowWidth()) {
					return;
				}
				this.filter_window_position.top = null;
				this.filter_window_position.left = null;
				this.$el.parent().css(this.getPosition());
			}.bind(this));
			this.getModel('player').onChangeAllianceMembership(this, function () {
				var alliance_id = this.getAllianceId();
				if (alliance_id !== null) {
					this.setCustomColorForAlliance(alliance_id, FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE);
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE, true);
					this.adjustFilterStatesAccordingToAlliancePactsStates();
				} else {
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE, false);
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.PACT, false);
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.ENEMY, false);
				}
			});

			this.getCollection('alliance_pacts').onAlliancePactChange(this, function (model) {
				this.adjustFilterStatesAccordingToAlliancePactsStates();
				if (model.getRelation() === FILTERS.PACT.WAR) {
					this.updateWarPactAlliancesColor(model);
				} else if (model.getRelation() === FILTERS.PACT.PEACE) {
					this.updatePeacePactAlliancesColor(model);
				}
			});
		},

		adjustFilterStatesAccordingToAlliancePactsStates: function () {
			if (this.getCollection('alliance_pacts').length > 0) {
				if (this.getCollection('alliance_pacts').isInPeacePact(this.getAllianceId())) {
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.PACT, true);
				}
				if (this.getCollection('alliance_pacts').isInWarPact(this.getAllianceId())) {
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.ENEMY, true);
				}
			} else if (this.getCollection('alliance_pacts').length === 0) {
				if (!this.getCollection('alliance_pacts').isInPeacePact(this.getAllianceId())) {
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.PACT, false);
				}
				if (!this.getCollection('alliance_pacts').isInWarPact(this.getAllianceId())) {
					this.view.changeAllianceHighlightFilterState(FILTERS.ALLIANCE_TYPES.ENEMY, false);
				}
			}
		},

		publishCloseColorPickerEvent: function () {
			$.Observer(GameEvents.strategic_map_filter.close.color_picker).publish({});
		},

		updateColors: function (data) {
			var elem_id,
				elem_type;

			if (data.type === FILTERS.FILTER_TYPES.PLAYER && parseInt(data.id, 10) === this.getPlayerId()) {
				elem_id = FILTERS.PLAYER_TYPES.OWN_CITIES;
				elem_type = data.type;
			} else if (data.type === FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE || data.type === FILTERS.ALLIANCE_TYPES.PACT || data.type === FILTERS.ALLIANCE_TYPES.ENEMY) {
				elem_id = data.type;
				elem_type = FILTERS.FILTER_TYPES.ALLIANCE;
			} else {
				elem_id = data.id;
				elem_type = data.type;
			}

			this.view.updateColorOfColorBtn(data.color, elem_type, elem_id);
			this.filter_options[main_search_filter].setColorToFilterOption(elem_id, data.color);
		},

		updateAlliancePeaceOrEnemyColors: function (data) {
			var alliance_list = this.getAllianceIdsFromPeaceOrWarPact(data.type);
			alliance_list.forEach(function (alliance_id) {
				data.type = FILTERS.FILTER_TYPES.ALLIANCE;
				data.id = alliance_id;
				this.updateColors(data);
			}.bind(this));
		},

		updateWarPactAlliancesColor: function (model) {
			var data = {};
			data.type = FILTERS.FILTER_TYPES.ALLIANCE;
			data.id = model.getAlliance2Id();
			var alliance_custom_color = this.getCollection('custom_colors').getCustomColorByIdAndType(data.type, data.id);
			data.color = alliance_custom_color ? alliance_custom_color.getColor() : DefaultColors.getDefaultColor(data.type, data.id);
			this.updateColors(data);
		},

		updatePeacePactAlliancesColor: function (model) {
			var data = {},
				alliance_1_id = model.getAlliance1Id(),
				alliance_2_id = model.getAlliance2Id();
			data.type = FILTERS.FILTER_TYPES.ALLIANCE;
			if (alliance_1_id === Game.alliance_id) {
				data.id = alliance_2_id;
			} else {
				data.id = alliance_1_id;
			}
			var alliance_custom_color = this.getCollection('custom_colors').getCustomColorByIdAndType(data.type, data.id);
			data.color = alliance_custom_color ? alliance_custom_color.getColor() : DefaultColors.getDefaultColor(data.type, data.id);
			this.updateColors(data);
		},

		getAllianceIdsFromPeaceOrWarPact: function (type) {
			var alliances;
			if (type === FILTERS.ALLIANCE_TYPES.ENEMY) {
				alliances = this.getCollection('alliance_pacts').getListOfAllianceIdsByRelation(FILTERS.PACT.WAR);
			} else if (type === FILTERS.ALLIANCE_TYPES.PACT) {
				alliances = this.getCollection('alliance_pacts').getListOfAllianceIdsByRelation(FILTERS.PACT.PEACE);
			}
			return alliances;
		},

		/**
		 * gets the position the window should have depending on the width of the main window and on the saved position
		 * @returns Object with the top and left properties
		 */
		getPosition: function () {
			if (!this.filter_window_position.top || this.filter_window_position.top === null || this.isWindowPositionOutsideOfMinSupportedWidth()) {
				return {top: 65, left: $('body').innerWidth() - this.$el.outerWidth(true) - 230};
			} else {
				return {top: this.filter_window_position.top, left: this.filter_window_position.left};
			}
		},

		isWindowPositionOutsideOfMinSupportedWidth: function () {
			return (this.filter_window_position.left + this.$el.innerWidth()) >= $('body').innerWidth();
		},

		getMainFilterOptions: function () {
			// TODO citygroups will be added soon!
			/*if(this.hasCurator()) {
			 main_filter_options.push({value : 'citygroups', name: this.l10n.citygroups});
			 }*/
			return this.main_filter_options;
		},

		getMainSearchFilter: function () {
			return main_search_filter;
		},

		setMainSearchFilter: function (new_search_filter) {
			main_search_filter = new_search_filter;
		},

		getAllianceFilterOptions: function () {
			return this.alliance_filter_option;
		},

		setAllianceFilterOptions: function (alliance_id, alliance_name) {
			this.alliance_filter_option.push({
				value: alliance_id,
				name: alliance_name,
				color: DefaultColors.getDefaultColor(this.getFilterType(), alliance_id),
				checked: false
			});
		},

		getPlayerFilterOptions: function () {
			return this.player_filter_option;
		},

		getSpecificAllianceFilterOption: function (id) {
			return us.find(this.alliance_filter_option, function (filter) {
				return filter.value === id.toString();
			});
		},

		getSpecificPlayerFilterOption: function (id) {
			return us.find(this.player_filter_option, function (filter) {
				return filter.value === id.toString();
			});
		},

		getSpecificFilterOption: function (id) {
			return this.filter_options[main_search_filter].getSpecificFilterOption(id);
		},

		getSpecificFilterOptionColorById: function (id) {
			return this.getSpecificFilterOption(id).color;
		},

		getCheckedStateById: function (id) {
			return this.getSpecificFilterOption(id).checked;
		},

		getSpecificFilterOptionAdditionalId: function (id) {
			return (this.getSpecificFilterOption(id) && this.getSpecificFilterOption(id).additional_id) ? this.getSpecificFilterOption(id).additional_id : false;
		},

		setPlayerFilterOptions: function (player_id, player_name, alliance_id) {
			this.player_filter_option.push({
				value: player_id,
				name: player_name,
				additional_id: alliance_id,
				color: DefaultColors.getDefaultColor(this.getFilterType(), player_id, alliance_id),
				checked: false
			});
		},

		removeAllianceFilterOptions: function (alliance_id) {
			var highlight_position = this.alliance_filter_option.map(function (obj) {
				return obj.value;
			}).indexOf(alliance_id.toString());

			this.alliance_filter_option.splice(highlight_position, 1);
		},

		getPactAllianceIdsByRelation: function (relation) {
			return this.getCollection('alliance_pacts').getAllianceIdsByRelation(relation);
		},

		getPlayerId: function () {
			return parseInt(this.getModel('player').getId(), 10);
		},

		getAllianceId: function () {
			var alliance_id = this.getModel('player').getAllianceId();
			return alliance_id !== null ? parseInt(alliance_id, 10) : null;
		},

		isPlayerInAlliance: function () {
			return this.getModel('player').getAllianceId() !== null;
		},

		getIdsForHighlights: function (value) {
			var id = 0;
			switch (value) {
				case FILTERS.PLAYER_TYPES.OWN_CITIES:
					id = this.getPlayerId();
					break;
				case FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE:
				case FILTERS.ALLIANCE_TYPES.PACT:
				case FILTERS.ALLIANCE_TYPES.ENEMY:
					id = 0;
					break;
				default:
					id = parseInt(value, 10);
					break;
			}
			return id;
		},

		constructColorPickerSetup: function (id, value) {
			var color_picker_setup = {};
			if (id !== 0) {
				color_picker_setup.type = this.getFilterType();
				color_picker_setup.id = id;
			} else {
				if (value === FILTERS.ALLIANCE_TYPES.PACT || value === FILTERS.ALLIANCE_TYPES.ENEMY || value === FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE) {
					color_picker_setup.type = value;
					color_picker_setup.id = 0;
				}
			}

			if (color_picker_setup.type === FILTERS.FILTER_TYPES.ALLIANCE && color_picker_setup.id !== this.getAllianceId()) {
				color_picker_setup.target_name = this.getSpecificAllianceFilterOption(id) ? this.getSpecificAllianceFilterOption(id).name : this.l10n.own_alliance;
			}
			if (color_picker_setup.type === FILTERS.FILTER_TYPES.PLAYER && color_picker_setup.id !== this.getPlayerId()) {
				color_picker_setup.target_name = this.getSpecificPlayerFilterOption(id).name;
			}

			color_picker_setup.additional_id = this.getSpecificFilterOptionAdditionalId(color_picker_setup.id);
			return color_picker_setup;
		},

		getNumberOfDefaultFilter: function () {
			var filter_num;

			if (main_search_filter === FILTERS.FILTER_TYPES.ALLIANCE) {
				filter_num = 3;
			} else if (main_search_filter === FILTERS.FILTER_TYPES.PLAYER) {
				filter_num = 1;
			}

			return filter_num;
		},

		getPlayerTooltipText: function () {
			return this.l10n.assign_color_player;
		},

		getAllianceTooltipText: function (highlight_type) {
			var texts = {};
			texts[FILTERS.ALLIANCE_TYPES.PACT] = this.l10n.assign_color_pact;
			texts[FILTERS.ALLIANCE_TYPES.ENEMY] = this.l10n.assign_color_enemy;

			return texts[highlight_type] || this.l10n.assign_color_alliance;
		},

		getAllianceDisabledCheckboxTooltipText: function (type) {
			var texts = {};
			texts[FILTERS.ALLIANCE_TYPES.PACT] = this.l10n.disabled_checkbox_pacts;
			texts[FILTERS.ALLIANCE_TYPES.ENEMY] = this.l10n.disabled_checkbox_enemies;
			texts[FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE] = this.l10n.disabled_checkbox_alliance;

			return texts[type];
		},

		getTooltipTextForHighlightOption: function (highlight_type, disabled) {
			return this.filter_options[main_search_filter].getTooltipText(highlight_type, disabled);
		},

		getDisabledCheckboxTooltipText: function (highlight_type) {
			return this.filter_options[main_search_filter].getDisabledCheckboxTooltipText(highlight_type);
		},

		getAutocompleteType: function () {
			var autocomplete_type;
			if (main_search_filter === FILTERS.FILTER_TYPES.ALLIANCE) {
				autocomplete_type = FILTERS.AUTOCOMPLETE_TYPES.ALLIANCE;
			} else if (main_search_filter === FILTERS.FILTER_TYPES.PLAYER) {
				autocomplete_type = FILTERS.AUTOCOMPLETE_TYPES.PLAYER;
			}
			return autocomplete_type;
		},

		getPlaceHolder: function () {
			var placeholder;
			if (main_search_filter === FILTERS.FILTER_TYPES.ALLIANCE) {
				placeholder = this.l10n.placeholder_text_alliance;
			} else if (main_search_filter === FILTERS.FILTER_TYPES.PLAYER) {
				placeholder = this.l10n.placeholder_text_player;
			}
			return placeholder;
		},

		getFilterType: function () {
			var filter_type;

			if (main_search_filter === FILTERS.FILTER_TYPES.ALLIANCE) {
				filter_type = FILTERS.FILTER_TYPES.ALLIANCE;
			} else if (main_search_filter === FILTERS.FILTER_TYPES.PLAYER) {
				filter_type = FILTERS.FILTER_TYPES.PLAYER;
			}

			return filter_type;
		},

		setCustomColorForAlliance: function (type, id) {
			var custom_color;

			// Distinguish between own_alliance, pacts and enemies and the rest
			if (id === FILTERS.ALLIANCE_TYPES.PACT || id === FILTERS.ALLIANCE_TYPES.ENEMY || id === FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE) {
				custom_color = this.getCollection('custom_colors').getCustomColorByIdAndType(id);
			} else {
				custom_color = this.getCollection('custom_colors').getCustomColorByIdAndType(type, id);
			}

			if (custom_color) {
				this.setAllianceColorToFilterOption(id, custom_color.getColor());
			}
		},

		setCustomColorForPlayer: function (type, id) {
			var custom_color;

			if (id === FILTERS.PLAYER_TYPES.OWN_CITIES) {
				custom_color = this.getCollection('custom_colors').getCustomColorByIdAndType(type, this.getPlayerId());
			} else {
				custom_color = this.getCollection('custom_colors').getCustomColorByIdAndType(type, id);
			}

			if (custom_color) {
				this.setPlayerColorToFilterOption(id, custom_color.getColor());
			}
		},

		setCustomColor: function (type, id) {
			this.filter_options[main_search_filter].setCustomColor(type, id);
		},

		setAllianceColorToFilterOption: function (alliance_id, color_value) {
			var highlight_position = this.alliance_filter_option.map(function (obj) {
				return obj.value;
			}).indexOf(alliance_id.toString());

			if (highlight_position !== -1) {
				this.alliance_filter_option[highlight_position].color = color_value;
			}
		},

		setPlayerColorToFilterOption: function (player_id, color_value) {
			var highlight_position = this.player_filter_option.map(function (obj) {
				return obj.value;
			}).indexOf(player_id.toString());

			if (highlight_position !== -1) {
				this.player_filter_option[highlight_position].color = color_value;
			}
		},

		setAllianceCheckedStateToFilterOption: function (alliance_id, checked) {
			var highlight_position = this.alliance_filter_option.map(function (obj) {
				return obj.value;
			}).indexOf(alliance_id.toString());

			this.alliance_filter_option[highlight_position].checked = checked;
		},

		setPlayerCheckedStateToFilterOption: function (player_id, checked) {
			var highlight_position = this.player_filter_option.map(function (obj) {
				return obj.value;
			}).indexOf(player_id.toString());

			this.player_filter_option[highlight_position].checked = checked;
		},

		removePlayerFilterOptions: function (player_id) {
			var highlight_position = this.player_filter_option.map(function (obj) {
				return obj.value;
			}).indexOf(player_id.toString());

			this.player_filter_option.splice(highlight_position, 1);
		},

		getFilterOptions: function () {
			return this.filter_options[main_search_filter].getFilterOption();
		},

		getCssClassForItemsOnMiniMap: function (value) {
			var css_cls = [];
			switch (value) {
				case FILTERS.PLAYER_TYPES.OWN_CITIES:
					css_cls.push(main_search_filter + '_' + this.getPlayerId());
					break;
				case FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE:
					css_cls.push(main_search_filter + '_' + this.getAllianceId());
					break;
				case FILTERS.ALLIANCE_TYPES.PACT:
					this.setCssClassForPactOrEnemyForItems(FILTERS.ALLIANCE_TYPES.PACT, css_cls);
					break;
				case FILTERS.ALLIANCE_TYPES.ENEMY:
					this.setCssClassForPactOrEnemyForItems(FILTERS.ALLIANCE_TYPES.ENEMY, css_cls);
					break;
				default:
					css_cls.push(main_search_filter + '_' + value);
					break;
			}
			return css_cls;
		},

		setCssClassForPactOrEnemyForItems: function (type, css_cls) {
			var relations = (type === FILTERS.ALLIANCE_TYPES.PACT) ? this.getPactAllianceIdsByRelation(FILTERS.PACT.PEACE) : this.getPactAllianceIdsByRelation(FILTERS.PACT.WAR);
			if (relations.length > 0) {
				relations.forEach(function (relation) {
					if (relation.getAlliance1Id() !== this.getAllianceId()) {
						if (css_cls.indexOf(main_search_filter + '_' + relation.getAlliance1Id()) === -1) {
							css_cls.push(main_search_filter + '_' + relation.getAlliance1Id());
						}
					} else {
						if (css_cls.indexOf(main_search_filter + '_' + relation.getAlliance2Id()) === -1) {
							css_cls.push(main_search_filter + '_' + relation.getAlliance2Id());
						}
					}
				}.bind(this));
			}
		},

		setFilterOptions: function (value, name, additional_value) {
			this.filter_options[main_search_filter].setFilterOptions(value, name, additional_value);
		},

		setCheckedStateOptions: function (id, checked) {
			this.filter_options[main_search_filter].setCheckedStateOptions(id, checked);
		},

		/**
		 * Check if the filter type is alliance and if the player belongs to an alliance.
		 * Also check if the current highligh is one of the default (for alliance there are three default highlights:
		 * own alliance, pacts and enemies)
		 *
		 * This check is needed because if the player is not a memeber of an alliance the default highlights should be disabled
		 * @param {int} index
		 * @returns {boolean}
		 */
		checkIfPlayerIsInAlliAndIfDefaultHighlight: function (index) {
			return this.getFilterType() === FILTERS.FILTER_TYPES.ALLIANCE && !this.isPlayerInAlliance() && index < 3;
		},

		checkIfDefaultHighlightShouldBeDisabled: function (type, index) {
			var state;
			if (type === FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE) {
				state = this.checkIfPlayerIsInAlliAndIfDefaultHighlight(index);
			} else if (type === FILTERS.ALLIANCE_TYPES.PACT) {
				state = !(this.getCollection('alliance_pacts').isInPeacePact(this.getAllianceId()));
			} else if (type === FILTERS.ALLIANCE_TYPES.ENEMY) {
				state = !(this.getCollection('alliance_pacts').isInWarPact(this.getAllianceId()));
			}
			return state;
		},

		removeFilterOptions: function (highlight_id) {
			this.filter_options[main_search_filter].removeFilterOptions(highlight_id);
		},

		reRender: function () {
			this.initializeView();
		},

		renderPage: function () {
			this.replaceNamesWithTranslations();
			this.setDefaultColorsOnStart();
			this.assignFilterFunctions();
			this.initializeView();
		},

		hasCurator: function () {
			return this.getModel('premium_features').hasCurator();
		},

		setDefaultColorsOnStart: function () {
			this.player_filter_option[0].color = DefaultColors.getDefaultColorByIdFromGameData(FILTERS.OWN_PLAYER); //own cities
			this.alliance_filter_option[0].color = DefaultColors.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE); //own alliance
			this.alliance_filter_option[1].color = DefaultColors.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.PACT); //pact memebers
			this.alliance_filter_option[2].color = DefaultColors.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.ENEMY); //enemies

		},

		replaceNamesWithTranslations: function () {
			this.main_filter_options.forEach(function (filter_val) {
				if (filter_val.name === null) {
					filter_val.name = this.l10n[filter_val.value];
				}
			}.bind(this));

			this.alliance_filter_option.forEach(function (filter_val) {
				if (filter_val.name === null) {
					filter_val.name = this.l10n[filter_val.value];
				}
			}.bind(this));

			if (this.player_filter_option[0].name === null) {
				this.player_filter_option[0].name = this.l10n[this.player_filter_option[0].value];
			}
		},

		saveWindowOpenStateToBackend: function () {
			var hint = this.getCollection('player_hints').getForType(HIGHLIGHT_WINDOW_STATE);
			if (this.window_model.isMinimized()) {
				if (!hint.isHidden()) {
					hint.disable();
				}
			} else {
				if (hint.isHidden()) {
					hint.enable();
				}
			}
		},

		initializeView: function () {
			this.view = new View({
				controller: this,

				el: this.$el
			});
			this.registerEventListeners();
		}
	});
});

