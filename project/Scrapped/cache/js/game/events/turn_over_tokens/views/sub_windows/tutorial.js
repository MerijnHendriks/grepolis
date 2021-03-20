define('events/turn_over_tokens/views/sub_windows/tutorial', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowTutorialView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'sub_window_tutorial', {
				text: this.controller.getText(),
				tutorial_id: this.controller.getTutorialId()
			});

			this.unregisterComponents();
			this.registerOkButton();
		},

		registerOkButton: function() {
			this.registerComponent('btn_ok', this.$el.find('.btn_ok').button({
				caption : this.l10n.btn_ok
			}).on('btn:click', function() {
				this.controller.closeTutorialStep();
			}.bind(this)));
		},

		destroy : function() {

		}
	});

	return SubWindowTutorialView;
});
