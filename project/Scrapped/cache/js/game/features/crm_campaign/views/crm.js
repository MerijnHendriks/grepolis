/* global us */
(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var CrmView = View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('crm_index'), {
				cdn_image : this.controller.getCdnImage(),
				cta_type : this.controller.getCtaType(),
				cta_value : this.controller.getCtaValue()
			}));

			this.registerEventListeners();
		},

		registerEventListeners : function() {
			this.$el.on('click', this.controller.onClickEvent.bind(this.controller));
		},

		registerViewComponents : function() {

		},

		destroy : function() {

		}
	});

	window.GameViews.CrmView = CrmView;
}());
