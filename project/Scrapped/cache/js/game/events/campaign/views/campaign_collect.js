/*global HelperBrowserEvents, HelperHercules2014, DM, GameDataHercules2014 */

(function () {
	"use strict";

	var View = window.GameViews.BaseView;

	var Hercules2014CollectView = View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('hercules2014_index'), {
				l10n : this.controller.getl10n(),
				dropped_units : this.controller.getCombinedDroppedUnits(),
				market_id : this.controller.getMarketId()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n(),
				l10n_common = DM.getl10n("COMMON");

			this.unregisterComponents();

			this.registerComponent("btn_close_window", this.$el.find('.btn_close_window').button({
				caption : l10n.btn_close_window,
				tooltips : [
				]
			}).on('btn:click', this.controller.handleOnButtonClick.bind(this.controller)));

			this.registerComponent("cbx_show_window", this.$el.find('.cbx_show_window').checkbox({
				checked : false,
				caption : l10n_common.dont_show_this_window_again
			}).on("cbx:check", this.controller.toggleCollectHint.bind(this.controller)));

			//Tooltips
			var unit_id, units = GameDataHercules2014.getAllUnits();

			for(var i = 0, l = units.length; i < l; i++) {
				unit_id = units[i].type;

				this.$el.find(".tooltip_area." + unit_id).tooltip(units[i].name);
			}

			// Register Movie URL
			var clickEvent = HelperBrowserEvents.getOnClickEventName();
			this.$el.find(".hercules2014_movie_logo").on(clickEvent, function() {
				HelperHercules2014.openMovieUrl();
			});
		},

		destroy : function() {

		}
	});

	window.GameViews.Hercules2014CollectView = Hercules2014CollectView;

	return Hercules2014CollectView;
}());
