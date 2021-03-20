/* global us */
define('events/campaign/views/sub_windows/fight_animation', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowFightAnimation = View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('fight_animation'), {
				l10n : this.l10n
			}));
		},

		destroy : function() {

		}
	});

	return SubWindowFightAnimation;
});
