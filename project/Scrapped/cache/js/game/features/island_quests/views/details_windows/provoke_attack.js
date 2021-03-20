/*global us */

define('features/island_quests/views/details_windows/provoke_attack', function() {
	'use strict';

	var DetailsWindow = require('features/island_quests/views/details_windows/details_window');

	return DetailsWindow.extend({
		sub_context : 'provoke_attack',

		initialize : function() {
			DetailsWindow.prototype.initialize.apply(this, arguments);

			this.registerEventListeners();
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.$el.html(us.template(this.controller.getTemplate('wnd_provoke_attack'), {
				l10n : this.l10n,
				decision : this.decision,
				units_left : this.decision.getProvokeAttackUnitsLeft()
			}));

			this.registerViewComponents();

			return this;
		},

		registerViewComponents : function() {
			this.unregisterComponents(this.sub_context);

			this.registerComponent('btn_provoke_attack', this.$el.find('.btn_provoke_attack').button({
				disabled : this.decision.isAttackOnPlayerRunning(),
				caption : this.l10n.provoke_attack
			}).on('btn:click', function() {
				this.controller.challengeActiveDecision();
			}.bind(this)), this.sub_context);
		},

		destroy : function() {
			DetailsWindow.prototype.destroy.apply(this, arguments);

			this.unregisterComponents(this.sub_context);
			this.remove();
		}
	});
});