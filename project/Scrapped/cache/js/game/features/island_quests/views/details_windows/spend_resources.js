/*global us, $, ITowns, Game, GameEvents */

define('features/island_quests/views/details_windows/spend_resources', function() {
	'use strict';

	var DetailsWindow = require('features/island_quests/views/details_windows/details_window');

	return DetailsWindow.extend({
		sub_context : 'spend_resources',

		initialize : function() {
			DetailsWindow.prototype.initialize.apply(this, arguments);

			this.registerEventListeners();
		},

		registerEventListeners : function() {
			DetailsWindow.prototype.registerEventListeners.apply(this, arguments);

			$.Observer(GameEvents.town.resources.update).subscribe('IslandQuestsDetailsWindowSpendResources', this._update_resources.bind(this));
		},

		unregisterEventListeners: function () {
			$.Observer().unsubscribe('IslandQuestsDetailsWindowSpendResources');
			this.stopListening();
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.$el.html(us.template(this.controller.getTemplate('wnd_spend_resources'), {
				l10n : this.l10n,
				decision : this.decision
			}));

			this.registerViewComponents();

			return this;
		},

		unregisterViewComponents : function() {
			this.controller.unregisterComponents(this.sub_context);
		},

		_update_resources : function() {
			var sub_context = this.sub_context,
				town_resources = ITowns.getTown(Game.townId).resources(),
				res_types = ['wood', 'stone', 'iron'], l = res_types.length,
				res_left = this.decision.getResourcesLeftToSend(),
				res_id, i;

			for (i = 0; i < l; i++) {
				res_id = res_types[i];
				this.controller.getComponent('sp_' + res_id, sub_context).setMax(Math.min(town_resources[res_id], res_left[res_id]));
			}
		},

		 registerViewComponents : function() {
			this.unregisterViewComponents();

			var _self = this, sub_context = this.sub_context, $el = this.$el, l10n = this.l10n,
				res_id, res_types = ['wood', 'stone', 'iron'], i, l = res_types.length,
				res_sent = this.decision.getResourcesSent(), res_total = this.decision.getTotalResourcesToSend(),
				res_left = this.decision.getResourcesLeftToSend();

			var itown = ITowns.getTown(Game.townId),
				resources = itown.resources();

			for (i = 0; i < l; i++) {
				res_id = res_types[i];

				this.controller.registerComponent('pb_send_' + res_id, $el.find('.pb_send_' + res_id).singleProgressbar({
					value : res_sent[res_id],
					max : res_total[res_id],
					type: 'integer'
				}), sub_context);

				this.controller.registerComponent('sp_' + res_id, $el.find('.sp_' + res_id).spinner({
					value : 0,
					max : Math.min(resources[res_id], res_left[res_id])
				}), sub_context);
			}

			this.controller.registerComponent('btn_send' , $el.find('.btn_send').button({
				caption : l10n.send_resources
			}).off('btn:click').on('btn:click', function() {
				var wood = _self.controller.getComponent('sp_wood', sub_context).getValue(),
					stone = _self.controller.getComponent('sp_stone', sub_context).getValue(),
					iron = _self.controller.getComponent('sp_iron', sub_context).getValue();

				if (wood > 0 || stone > 0 || iron > 0) {
					_self.controller.challengeResources(wood, iron, stone);
				}
			}), sub_context);

			this.$el.off('click').on('click', '.res_icons .icon', function(e) {
				var $target = $(e.currentTarget),
					res_id = $target.attr('data-resid'),
					spinner = _self.controller.getComponent('sp_' + res_id, sub_context),
					value = spinner.getValue(),
					max = spinner.getMax();

				spinner.setValue(value === max ? 0 : max);
			});

		},

		updateResourcesSent : function() {
			var res_id, res_sent = this.decision.getResourcesSent(),
				res_left = this.decision.getResourcesLeftToSend(),
				sub_context = this.sub_context;

			var itown = ITowns.getTown(Game.townId),
				resources = itown.resources();

			var sp_wood = this.controller.getComponent('sp_wood', sub_context),
				sp_stone = this.controller.getComponent('sp_stone', sub_context),
				sp_iron = this.controller.getComponent('sp_iron', sub_context);

			if (sp_wood) {
				sp_wood.setValue(0);
			}

			if (sp_stone) {
				sp_stone.setValue(0);
			}

			if (sp_iron) {
				sp_iron.setValue(0);
			}

			for (res_id in res_sent) {
				if (res_sent.hasOwnProperty(res_id)) {
					var pb_send = this.controller.getComponent('pb_send_' + res_id, sub_context);
					var sp = this.controller.getComponent('sp_' + res_id, sub_context);

					if (pb_send) { // if quest if satisfied, the view is closed and the component is gone
						pb_send.setValue(res_sent[res_id]);
					}

					if (sp) { // if quest if satisfied, the view is closed and the component is gone
						sp.setMax(Math.min(resources[res_id], res_left[res_id]));
					}
				}
			}
		},

		destroy : function() {
			DetailsWindow.prototype.destroy.apply(this, arguments);

			this.unregisterViewComponents();
			this.unregisterEventListeners();
		}
	});
});