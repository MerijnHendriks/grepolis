/*global us, DM*/

(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var UpdateNotificationView = BaseView.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			BaseView.prototype.initialize.apply(this, arguments);

			this.render();
		},

		reRender : function() {
			this.render();
		},

		render : function() {
			// The template can not be loaded from data_frontend logic, because this request may already be blocked
			// by the update process. Instead we use 'old' layout.tpl.php templating here
			var template = DM.getTemplate('update_notifications');
			this.$el.html(us.template(template.index, {
				state: this.controller.getState(),
				l10n: this.controller.getl10n()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			this.controller.unregisterComponents();

			if (this.controller.isUpdateInFinished()) {
				this.controller.registerComponent('btn_refresh', this.$el.find('.btn_refresh').button({
					caption : this.controller.getl10n().refresh
				}).on('btn:click', this.controller.onRefreshClicked));
			}
		},

		destroy : function() {

		}
	});

	window.GameViews.UpdateNotificationView = UpdateNotificationView;
})();
