/*global us, BuyForGoldWindowFactory */

define('events/turn_over_tokens/views/sub_windows/quiver_empty', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowQuiverEmptyView = View.extend({

		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
			this.initializeBuyArrowsButtons();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('sub_window_quiver_empty'), {
				l10n : this.l10n
			}));
		},

		initializeBuyArrowsButtons : function() {
			var controller = this.controller, l10n = this.l10n;

			var onClick = function(cost, num, name, e, _btn) {
				BuyForGoldWindowFactory.openBuyAssassinsArrowsWindow(_btn, cost, num, name, controller);
			};

			var $el = this.$el.find('.btn_buy_arrow'),
				cost = controller.getArrowCost(),
				num = controller.getArrowNum(),
				basic_price = controller.getArrowBasicPrice(),
				name = l10n.btn_buy_arrow.arrows_name;

			controller.registerComponent('btn_buy_arrow_quiver', $el.button({
				template : 'tpl_simplebutton_borders',
				caption : cost,
				disabled: controller.getArrowCount() > 5,
				state: controller.getArrowCount() > 5,
				icon: true,
				icon_type: 'gold',
				icon_position: 'right',
				tooltips : [
					{
						title : l10n.btn_buy_arrow.active(cost, basic_price)
					},
					{
						title : l10n.btn_buy_arrow.inactive
					}
				]
			}).on('btn:click', onClick.bind(null, cost, num, name)));
		},

		destroy : function() {

		}
	});

	return SubWindowQuiverEmptyView;
});
