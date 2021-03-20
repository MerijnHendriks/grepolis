/* global CM */
define('features/attack_spots/map/attack_spot_renderer', function() {
	'use strict';

	var TOWN_TYPES = require('enums/town_types');
	var Backbone = require_legacy('Backbone');
	var GamePlayerAttackSpotData = require('features/attack_spots/data/player_attack_spot');
	var GameEvents = require('data/events');
	var AttackSpotHelper = require('features/attack_spots/helpers/attack_spot_helper');

	var SPOT_STATE_ENUM = {
		READY: 'attack_possible',
		ATTACKING : 'attack_running',
		COLLECT: 'collect_reward',
		COOLDOWN: 'cooldown_running'
	};

	var PROGRESSBAR_COMPONENT_ID = 'attack_spot_progressbar';

	return us.extend({
		initialize:  function(data) {
			this.attack_spot_model  = data.models.player_attack_spot;

			// cache commands toward the attack spot to avoid aggressive rescan of the commands
			// (the player may have multiple thousand attacks incoming),
			// we use events to reduce the looping on every re-render
			this.movements_units = data.collections.movements_units;
			this.attack_spot_movements = this.movements_units.getAttackSpotMovements();

			this.registerEventListeners();
			this.$el = $('#map_attack_spots');

			this.l10n = data.l10n;
		},

		registerEventListeners : function() {
			var commandsUpdate = function() {
				this.getAttackSpotMovements();
				this.render();
			}.bind(this);
			this.stopListening();

			this.movements_units.onChange(this, commandsUpdate.bind(this));
			this.attack_spot_model.onChange(this, this.render.bind(this));
			this.attack_spot_model.onDestroy(this, this.destroy.bind(this));

			$.Observer(GameEvents.town.town_switch).unsubscribe('map_attack_spot');
			$.Observer(GameEvents.town.town_switch).subscribe('map_attack_spot', this.render.bind(this));
		},

		getAttackSpotMovements : function() {
			this.attack_spot_movements = this.movements_units.getAttackSpotMovements();
		},

		destroy: function() {
			CM.unregister(this._getContext(), PROGRESSBAR_COMPONENT_ID);
			this.stopListening();
			$.Observer(GameEvents.town.town_switch).unsubscribe('map_attack_spot');
			this.$el.remove();
		},

		/**
		 * returns the state of the attack spot, order of states:
		 * 1. collecting, if possible
		 * 2. cooldown, if cooldown is active
		 * 3. movements, if any
		 * 4. spot is attackable
		 */
		getState : function() {
			if (this.attack_spot_model.hasReward()) {
				return SPOT_STATE_ENUM.COLLECT;
			}

			if (this.attack_spot_model.hasCooldown()) {
				return SPOT_STATE_ENUM.COOLDOWN;
			}

			// if we have 10000 attacks in the model we filter them every time this gets called
			// maybe we should avoid calling this too often, not on every redraw
			if (this.attack_spot_movements.length > 0) {
				return SPOT_STATE_ENUM.ATTACKING;
			}

			return SPOT_STATE_ENUM.READY;
		},

		/**
		 * return extra node for the blinking animation of the spot
		 * @return {DOMNode}
		 */
		_getBlinkNode: function(state_name, abs_x, abs_y) {
			var blinkingSpot = document.createElement('a');

			blinkingSpot.className = state_name;
			blinkingSpot.style.left = abs_x + 'px';
			blinkingSpot.style.top = abs_y + 'px';
			return blinkingSpot;
		},

		/**
		 * return context for CM
		 */
		_getContext : function() {
			return {
				main: 'new_ui',
				sub: 'map'
			};
		},

		/**
		 * get nodes to render when the state 'COOLDOWN' is reached:
		 * @return {DOMNodes}
		 */
		_getCooldownStateExtraNodes: function(abs_x, abs_y) {
			var $spot = $('<div class="single-progressbar2 cooldown_progressbar type_building_queue"></div>'),
				max_time = this.attack_spot_model.getCooldownDuration();

			var $progressbar = CM.get(this._getContext(), PROGRESSBAR_COMPONENT_ID);
			if ($progressbar) {
				CM.unregister(this._getContext(), PROGRESSBAR_COMPONENT_ID);
				$progressbar.empty();
			}

			$spot.singleProgressbar({
				template: 'tpl_pb_single_nomax_bg',
				type: 'time',
				reverse_progress : true,
				liveprogress: true,
				liveprogress_interval : 1,
				value: max_time,
				max: max_time,
				countdown : true,
				countdown_settings : {
					timestamp_end : this.attack_spot_model.getCooldownAt()
				}
			}).on('pb:cd:finish', function() {
				this.render();
			}.bind(this));

			CM.register(this._getContext(), PROGRESSBAR_COMPONENT_ID, $spot);

			$spot.css('left', abs_x + 'px');
			$spot.css('top', abs_y + 'px');

			// add the type and id to 'curr', to allow clicks on the time to open the window
			// on the map - the map mouse handler looks for data-type="attack_spot"
			$spot.find('.curr').attr('data-type', TOWN_TYPES.ATTACK_SPOT);
			$spot.find('.curr').attr('data-id', this.attack_spot_model.id);

			return $spot[0];
		},

		/**
		 * render attack spot and bind tooltips
		 * safe to call on re-render
		 */
		render: function() {
			this.$el.empty();

			// remove the attack spot if max level is reached
			if (!this.canRenderAttackSpot()) {
				return;
			}

			var fragment = document.createDocumentFragment();
			fragment = this.addDOMNodesToFragment(fragment);
			this.$el[0].appendChild(fragment);
			if (AttackSpotHelper.isAttackSpotOnWrongIsland()) {
				this.bindWrongIslandTooltip();
			} else {
				this.bindTooltip();
			}
		},

		bindTooltip : function() {
			var tooltip_html = "<b>" + this.l10n.bandits_camp + "</b><br><br>" + this.l10n.map_tooltips[this.getState()];

			this.$el.find('div').tooltip(tooltip_html);
		},

		bindWrongIslandTooltip : function() {
			var tooltip_html = "<b>" + this.l10n.bandits_camp + "</b><br><br>" + this.l10n.map_tooltips.wrong_island;
			
			this.$el.find('div').tooltip(tooltip_html);
		},

		/**
		 * render Attack Spot Dom nodes into a given fragement
		 * (this is how the map does it)
		 *
		 * For "slow" operations use .render()
		 *
		 * Rendering an attack spot is not fast since we use jquery.progressbar and
		 * have to take unit movements into account
		 *
		 * @returns {DocumentFragment}
		 */
		addDOMNodesToFragment: function(fragment) {
			var state = this.getState(),
				abs_x = this.attack_spot_model.getAbsoluteCoordinates().abs_x,
				abs_y = this.attack_spot_model.getAbsoluteCoordinates().abs_y,
				spot = document.createElement('div');

			// special DOM nodes for READY state (blinking)
			if (state === SPOT_STATE_ENUM.READY) {
				// in this state we can safely unregister any progressbars
				CM.unregister(this._getContext(), PROGRESSBAR_COMPONENT_ID);
				fragment.appendChild(this._getBlinkNode('attack_spot_overlay', abs_x, abs_y));
			}

			if (state === SPOT_STATE_ENUM.COLLECT) {
				fragment.appendChild(this._getBlinkNode('collect_reward_overlay', abs_x, abs_y));
			}

			spot.className = 'attack_spot ' + state;
			spot.style.left = abs_x + 'px';
			spot.style.top = abs_y + 'px';
			spot.setAttribute('data-type', TOWN_TYPES.ATTACK_SPOT);
			spot.setAttribute('data-id', this.attack_spot_model.id);
			spot.id = this.attack_spot_model.id;
			fragment.appendChild(spot);

			// cooldown DOM nodes
			if (state === SPOT_STATE_ENUM.COOLDOWN) {
				fragment.appendChild(this._getCooldownStateExtraNodes(abs_x, abs_y));
			}

			return fragment;
		},

		/**
		 * returns true, if the attack spot model does exists and the level is below max_level
		 */
		canRenderAttackSpot : function() {
			if (this.attack_spot_model === undefined) {
				 return true;
			}

			return this.attack_spot_model.getLevel() <= GamePlayerAttackSpotData.getMaxLevel();
		}

	}, Backbone.Events);
});
