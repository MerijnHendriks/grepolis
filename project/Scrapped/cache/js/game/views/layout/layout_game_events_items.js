(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var LayoutGameEventsItemsView = BaseView.extend({

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('game_events_items'), {

			}));

			this.registerEventListeners();
			this.bindTooltips();
		},

		registerEventListeners : function() {
			this.$el.on('click', '.js-mermaid', this.controller.onMermaidClick.bind(this.controller));
		},

		bindTooltips : function() {
			var l10n = this.controller.getl10n();

			this.$el.find('.js-mermaid').tooltip(l10n.mermaid_tooltip);
		},

		changeMermaidVisibility : function(is_visible) {
			this.$el.find('.js-mermaid').toggle(is_visible);
		},

		destroy : function() {

		}
	});

	window.GameViews.LayoutGameEventsItemsView = LayoutGameEventsItemsView;
}());
