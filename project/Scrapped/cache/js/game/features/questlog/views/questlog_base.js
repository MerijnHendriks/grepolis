define('features/questlog/views/questlog_base', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');

	return Views.BaseView.extend({

		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.unregisterComponents();

			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n
			});
		}
	});
});
