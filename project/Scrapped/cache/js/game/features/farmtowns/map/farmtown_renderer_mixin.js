/**
 * MIXIN class to MapTile renderer to render the BPV farmtowns
 */
define('farmtowns/map/mixin/farmtown_renderer', function(require) {
	'use strict';

	var MM = window.MM;
	var MapHelpers = require('map/helpers');
	var TOWN_TYPES = require('enums/town_types');
	var FARM_TOWN_STATES = require('enums/farm_town_states');
	var prefix_transform = 'transform';

	// flag pole offsets towards the farm towns - battlepoint village version
	// @TODO: maybe join with 'normal version' and move centrally
	var bpv_flagpole_offsets = [
		{top: -7, left: 23},
		{top: -12, left: 15},
		{top: -14, left: 14},
		{top: -14, left: 14},
		{top: -15, left: 15},
		{top: -15, left: 15}
	];

	var bpv_flagpole_offsets_locked = {top: -14, left: 12};

	var bpv_flag_colors = {
		locked : '#868686',
        owned : '#ffbb00'
	};

	var getBPVFarmTownFlagPoleOffsets = function(expansion_stage, is_locked) {
		return is_locked ? bpv_flagpole_offsets_locked : bpv_flagpole_offsets[expansion_stage - 1];
	};


	/**
	 * This class represents a farm town with all its properties to render it as a DOM node
	 * It is basically a view Model class.
	 * It acts as singleton to reduce new / delete calls during the render loop
	 *
	 * Basically all you want to do is to call .initialize and .getRenderedDomNodes
	 */
	var farm_town_dom_model_singleton = {
		state : FARM_TOWN_STATES.LOCKED,

		badges : {
			claim_possible : false
			// it is possible to add more badges here, also check _createBadgeNodes
		},

		town: null,

		town_type : '',

		expansion_stage : 0,

		relation_model : null,

		dom_node : null,

		badge_nodes : [],

		flag_node : null,

		css_classses : [],

		result : [],

		position: {
			left: 0,
			top: 0
		},

		/**
		 * update this farm town data from relation data
		 * if we have a relation model, we know
		 * a) that the player has a relation to this town and
		 * b) this info is more up-to-date than map data from 'town'
		 */
		_updateFromRelationData : function() {
			this.expansion_stage = this.relation_model.getExpansionStage();
			this.badges.claim_possible = false;
			if (this.relation_model.isLootable()) {
				this.badges.claim_possible = true;
			}
			this.state = FARM_TOWN_STATES.OWNED;
		},

		_updateDomNodeFromData : function() {
			this.dom_node.id = this.id;
			this.dom_node.style[prefix_transform] = 'translate('+ this.position.left + 'px, ' + this.position.top + 'px)';
            var farm_village_bg_number = this._setFarmVillageBgNumber();
            if(this.state === FARM_TOWN_STATES.LOCKED) {
                this.dom_node.className = [].concat(this.css_classes, [this.state, TOWN_TYPES.FARM_TOWN, 'tile', 'locked'+farm_village_bg_number, 'lvl' + this.expansion_stage]).join(' ');
            }
            else {
                this.dom_node.className = [].concat(this.css_classes, [this.state, TOWN_TYPES.FARM_TOWN, 'tile', 'lvl' + this.expansion_stage]).join(' ');
            }

			this.dom_node.href = '#';
			this.dom_node.setAttribute('data-id', this.town.id);
			this.dom_node.setAttribute('data-type', this.town_type);
			this.dom_node.setAttribute('data-same_island', this.farm_town_on_player_island);
		},

		_playerOwnsFarmTown : function() {
			return this.relation_model && this.relation_model.getRelationStatus() > 0;
		},

		/**
		 * create a clickable flagpole
		 * it is represented by two Elements nested
		 * @TODO: get the color data, position offsets from somewhere
		 */
		_createFlagNode : function() {
			this.flag_node = document.createElement('div');
			this.flag_node.id = this.town_type + '_flag_' + this.town.id;
			var flag_pole_offset;

			if (this._playerOwnsFarmTown()) {
                this.flag_node.className = 'flag ' + this.town_type;
				this.flag_node.style.backgroundColor = bpv_flag_colors.owned;
				flag_pole_offset = getBPVFarmTownFlagPoleOffsets(this.town.expansion_stage);
			}
            else {
				this.flag_node.className = 'flag ' + this.town_type;
				this.flag_node.style.backgroundColor = bpv_flag_colors.locked;
				flag_pole_offset = getBPVFarmTownFlagPoleOffsets(this.town.expansion_stage, true);
			}

			this.flag_node.style.left = this.position.left + flag_pole_offset.left + 'px';
			this.flag_node.style.top = this.position.top + flag_pole_offset.top + 'px';

			var flagpole_node = document.createElement('a');
			flagpole_node.href = '#';
			flagpole_node.className = 'flagpole town';
			flagpole_node.setAttribute('data-id', this.town.id);
			flagpole_node.setAttribute('data-type', this.town_type);

			this.flag_node.appendChild(flagpole_node);
		},

        /**
         * Returns number between 1 and 6, representing the image sprite indicator, from the farm town x, y position
         * @returns {Number} Return number between 1 and 6
         * @private
         */
        _setFarmVillageBgNumber : function() {
            return ((this.town.ox + this.town.oy) % 6) + 1;
        },

		/**
		 * create Badges on the farm town: indicator to claim your stuff or other badges
		 * currently on "claim_possible" is supported
		 * The original design had more badges, but this was dropped during development
		 */
		_createBadgeNodes : function() {
			if (!this._playerOwnsFarmTown()) {
				return;
			}

			// test if any badge is true
			if (!this.badges.claim_possible) {
				return;
			}

			for (var badge_name in this.badges) {
				if (this.badges.hasOwnProperty(badge_name)) {
					var badge = document.createElement('a');

					badge.style[prefix_transform] = 'translate('+ this.position.left + 'px, ' + this.position.top + 'px)';
					badge.setAttribute('data-id', this.town.id);
					badge.setAttribute('data-type', this.town_type);
					badge.href = '#';

					if (badge_name === 'claim_possible') {
						badge.id = this.id + '_claim';
						badge.className = 'badge claim';
					}

					this.badge_nodes.push(badge);
				}
			}
		},

		initialize : function(town, id, relation_model, position, farm_town_on_player_island) {
			this.id = id;
			this.town = town;
			this.town_type = MapHelpers.getTownType(town);
			this.expansion_stage = town.expansion_stage;
			this.relation_model = relation_model;
			this.position = position;
			this.badges = [];
			this.badge_nodes = [];
			this.farm_town_on_player_island = farm_town_on_player_island;

			this.dom_node = document.createElement('a');
			if (this.relation_model && this.relation_model.getRelationStatus() > 0) {
                this._updateFromRelationData();
			} else {
                this.state = FARM_TOWN_STATES.LOCKED;
			}
			this._updateDomNodeFromData();
			this._createBadgeNodes();
			this._createFlagNode();
		},

		getRenderedDomNodes : function() {
			return [this.dom_node, this.flag_node].concat(this.badge_nodes);
		}
	};

	return {

		/**
		 * return a unique identifier for a farm town (well, type + id)
		 */
		getFarmTownId : function(town) {
			return MapHelpers.getTownType(town) + '_' + town.id;
		},

		getFarmTownRelation : function(town) {
			var farm_town_relations = MM.getOnlyCollectionByName('FarmTownPlayerRelation');

			return farm_town_relations.getRelationForFarmTown(town.id);
		},

		getFarmTownModel : function(town) {
			var farm_towns_collection = MM.getOnlyCollectionByName('FarmTown');

			return farm_towns_collection.get(town.id);
		},

		/**
		 * this calculation is taken from createTownDiv and
		 * not changed because it deals with magic
		 */
		calculatePositionForFarmTown : function(town) {
			var islandOffset = MapHelpers.map2Pixel(town.x, town.y);
			// get the final pixel coords
			var offsetX = this.cssOffset.x + islandOffset.x;
			var offsetY = this.cssOffset.y + islandOffset.y;
			var tOffset = this.tOffset[town.dir] || this.ftOffset;
			var tl = offsetX + town.ox,
				tt = offsetY + town.oy;

			//offsets for new bg-images - whatever that means
			// i guess there where some "old" bgimages and the frontend
			// corrects these coords via fixed offsets to "new"
			if (tOffset) {
				tl += tOffset.x;
				tt += tOffset.y;
			}

			return {
				 left: tl,
				 top: tt
			};
		},
		/*
		 * only handle the case of the new farm town,
		 * all other cases are handled via createTownDiv
		 * @TODO enums for the town.types
		 *
		 * @param {MapTown} town
		 * @param {Town} a game town / the current town
		 * @return {Array} array of html elements
		 */
		createBattlepointVillageFarmTown : function(town, player_current_town) {

			var id = this.getFarmTownId(town);

			// if we already have the div in the DOM, bail
			// TODO: internal bookkeeping would avoid DOM access here
			if (document.getElementById(id)) {
				return [];
			}

			var farm_town_on_player_island = (town.x === player_current_town.getIslandCoordinateX() && town.y === player_current_town.getIslandCoordinateY());

			farm_town_dom_model_singleton.initialize(town, id, this.getFarmTownRelation(town), this.calculatePositionForFarmTown(town), farm_town_on_player_island);

			return farm_town_dom_model_singleton.getRenderedDomNodes();
		}

	};
});
