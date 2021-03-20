define('features/cash_shop/views/cash_shop', function() {
	'use strict';

	var Views = require_legacy('GameViews');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.iframe_url = options.iframe_url || '';
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
		    var $iframe;

			this.renderTemplate(this.$el, 'index', {
				iframe_url: this.iframe_url
			});

            //Workaround for chrome automation tests
			$iframe = this.$el.find('.cash_shop iframe');

			$iframe.off();
        	$iframe.on('load', function() {
                this.$el.addClass('cash_shop_loaded');
            }.bind(this));
		}
	});
});

