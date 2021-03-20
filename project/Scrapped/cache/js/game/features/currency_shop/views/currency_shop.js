define('features/currency_shop/views/currency_shop', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el, 'shop', {});
			this.renderShopItems();
		},

		renderShopItems: function () {
			var $shop_items_wrapper = this.$el.find('.shop_items_wrapper'),
				shop_items = this.controller.getShopItems(),
				base_ratio = 0, bonus;

			for (var i = 0; i < shop_items.length; i++) {
				var amount = shop_items[i].getAmount(),
					cost = shop_items[i].getGoldCost(),
					show_bonus_ribbon = false;

				if (base_ratio === 0) {
					base_ratio = amount / cost;
				} else {
					bonus = Math.round((1 - (base_ratio / (amount / cost))) * 100);
					show_bonus_ribbon = true;
				}

				$shop_items_wrapper.append(us.template(this.getTemplate('shop_item', {
					l10n: this.l10n ,
					item_id: shop_items[i].getId(),
					amount: shop_items[i].getAmount(),
					show_bonus_ribbon: show_bonus_ribbon,
					bonus: bonus
				})));

				this.registerBuyButton(shop_items[i]);
			}
		},

		registerBuyButton: function (shop_item) {
			var $button = this.$el.find('.btn_buy_item[data-item_id="' + shop_item.getId() + '"]'),
				amount = shop_item.getAmount(),
				cost = shop_item.getGoldCost();

			this.unregisterComponent('btn_buy_item_' + shop_item.getId());
			this.registerComponent('btn_buy_item_' + shop_item.getId(), $button.button({
				caption: cost,
				icon: true,
				icon_type: 'gold',
				tooltips: [
					{title: this.l10n.tooltip(amount, cost)}
				]
			}).on('btn:click', function (event, btn) {
				var $btn = $(btn);
				this.controller.buyItem(btn, $btn.data('item_id'));
			}.bind(this)));
		}
	});
});