define('events/black_friday/views/black_friday', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	return BaseView.extend({
		initialize: function () {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el, 'black_friday', {
				l10n: this.l10n
			});
		}
	});
});