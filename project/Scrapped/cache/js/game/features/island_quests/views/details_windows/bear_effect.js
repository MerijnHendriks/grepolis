/*global define, us, Timestamp */

define('features/island_quests/views/details_windows/bear_effect', function() {
	'use strict';

	var DetailsWindow = require('features/island_quests/views/details_windows/details_window');

	return DetailsWindow.extend({
		sub_context : 'bear_effect',

		initialize : function() {
			DetailsWindow.prototype.initialize.apply(this, arguments);

			this.registerEventListeners();
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.$el.html(us.template(this.controller.getTemplate('wnd_bear_effect'), {
				l10n : this.l10n,
				decision : this.decision
			}));

			this.registerViewComponents();

			return this;
		},

		registerViewComponents : function() {
			var total_time = this.decision.getConfiguration().time_to_wait,
				current = this.decision.getProgress().wait_till - Timestamp.now();

			this.controller.registerComponent('pb_bear_effect_time', this.$el.find('.pb_bear_effect_time').singleProgressbar({
				value : current,
				max : total_time,
				real_max: total_time,
				liveprogress: true,
				reverse_progress: true,
				type: 'time',
				countdown: true,
				template : 'tpl_pb_single_nomax'
			}), this.sub_context);
		},

		destroy : function() {
			DetailsWindow.prototype.destroy.apply(this, arguments);

			this.controller.unregisterComponents(this.sub_context);
		}
	});
});