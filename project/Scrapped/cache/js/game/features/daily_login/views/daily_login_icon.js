define('features/daily_login/views/daily_login_icon', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.registerComponent('btn_open', this.$el.button({
				tooltips: [
					{ title : this.l10n.daily_login.tooltips.icon }
				]
			}).on('btn:click', function() {
				this.controller.openWindow();
			}.bind(this)));
		}
	});
});
