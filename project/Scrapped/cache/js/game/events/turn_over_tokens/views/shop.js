define('events/turn_over_tokens/views/shop', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var AssassinsShopView = View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'shop', {
				l10n: this.l10n
			});

			this.renderBattleTokens();
			this.initializeShopItems();
			this.initializeBuyButtons();
		},

		renderBattleTokens: function() {
			this.$el.find('.battle_tokens').text(this.controller.getBattleTokens());
		},

		initializeShopItems : function() {
			var slots = this.controller.getShopItemsPerSlot(),
				$parent = this.$el.find('.rewards_container');

			slots.forEach(function(shop_items, slot_id) {
				shop_items.forEach(function(shop_item) {
					$parent.append(this.getTemplate('shop_item', {slot_id: slot_id}));
					this.registerComponent('reward_' + slot_id, $parent.find('.slot_'+slot_id+' .slot_item').reward({
						reward: shop_item.getRewardItem()
					}));
				}.bind(this));
			}.bind(this));
		},

		initializeBuyButtons : function() {
			var battle_tokens = this.controller.getBattleTokens(),
				controller = this.controller;

			this.$el.find('.slot').each(function(idx, el) {
				var $el = $(el),
					slot_id = $el.data('slot_id'),
					$btn = $el.find('.btn_buy'),
					name = 'buy_btn_' + slot_id,
					costs = controller.getCostsForSlot(slot_id),
					disabled = costs > battle_tokens;

				this.unregisterComponent(name);
				this.registerComponent(name, $btn.button({
					 caption: costs,
					 icon: true,
					 icon_type: 'battle_token',
					 disabled: disabled,
					 state: disabled,
					 tooltips: [
						 {title: ''},
						 {title: this.l10n.shop_not_enough_battle_token}
					 ]
				}).on('btn:click', function(event) {
					// Layout.contextMenu uses event.clientX/Y to position the context menu
					// the custom event btn:click does not have it, so we fake it
					var $btn = $(event.currentTarget);
					var offset = $btn.offset();
					event.clientX = offset.left;
					event.clientY = offset.top;
					controller.showRewardContextMenuForSlot(event, slot_id);
				}));
			}.bind(this));
		},

		/**
		 * enables / disables buy buttons without re-render
		 */
		updateBuyButtons : function() {
			var battle_tokens = this.controller.getBattleTokens(),
				controller = this.controller;

			this.$el.find('.slot').each(function(idx, el) {
				var $el = $(el),
					slot_id = $el.data('slot_id'),
					name = 'buy_btn_' + slot_id,
					costs = controller.getCostsForSlot(slot_id),
					disabled = costs > battle_tokens;

				var button = controller.getComponent(name);
				button.setState(disabled);
				if (disabled) {
					button.disable();
				} else {
					button.enable();
				}
			});
		},

        destroy : function() {
        }
    });

    return AssassinsShopView;
});
