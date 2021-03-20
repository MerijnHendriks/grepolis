/* global DM */

define('events/grepolympia/views/grepolympia_shop', function(require) {
	'use strict';

	var View = window.GameViews.BaseView,
		window_ids = require('game/windows/ids');

	var GrepolympiaShopView = View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = DM.getl10n(window_ids.GREPOLYMPIA);

			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'shop', {
				l10n: this.l10n
			});

			this.registerLaurelAmountBox();
			this.initializeShopItems();
			this.initializeBuyButtons();
		},

		registerLaurelAmountBox : function() {
			var laurel_box = this.$el.find('.laurels'),
				laurel_amount = this.controller.getLaurels();

			this.unregisterComponent('laurel_amount_shop');
			this.registerComponent('laurel_amount_shop', laurel_box.find('.amount').numberChangeIndicator({
				caption : laurel_amount
			}));
			laurel_box.tooltip(this.l10n.shop_laurel_icon);
		},

		setNewLaurelAmountToLaurel : function() {
			var laurel_box = this.getComponent('laurel_amount_shop');
			if (laurel_box) {
				laurel_box.setCaption(this.controller.getLaurels());
			}
		},

		initializeShopItems : function() {
			var slots = this.controller.getShopItemsPerSlot(),
				$parent = this.$el.find('.rewards_container');

			slots.forEach(function(shop_items, slot_id) {
				shop_items.forEach(function(shop_item) {
					$parent.append(this.getTemplate('shop_item', {slot_id: slot_id}));
					this.unregisterComponent('reward_' + slot_id);
					this.registerComponent('reward_' + slot_id, $parent.find('.slot_'+slot_id+' .slot_item').reward({
						reward: shop_item.getRewardItem()
					}));
				}.bind(this));
			}.bind(this));
		},

		initializeBuyButtons : function() {
			var laurels = this.controller.getLaurels(),
				controller = this.controller;

			this.$el.find('.slot').each(function(idx, el) {
				var $el = $(el),
					slot_id = $el.data('slot_id'),
					$btn = $el.find('.btn_buy'),
					name = 'buy_btn_' + slot_id,
					costs = controller.getCostsForSlot(slot_id),
					disabled = costs > laurels;

				this.unregisterComponent(name);
				this.registerComponent(name, $btn.button({
					 caption: costs,
					 icon: true,
					 icon_type: 'laurels',
					 disabled: disabled,
					 state: disabled,
					 tooltips: [
						 {title: ''},
						 {title: this.getTooltipDescriptionForDisabledBuyButton()}
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

		getTooltipDescriptionForDisabledBuyButton : function() {
			if (this.controller.getShopWindowType() === window_ids.GREPOLYMPIA) {
				return this.l10n.shop_not_enough_battle_token(true);
			}
			return this.l10n.shop_not_enough_battle_token();
		},

		/**
		 * enables / disables buy buttons without re-render
		 */
		updateBuyButtons : function() {
			var laurels = this.controller.getLaurels(),
				controller = this.controller;

			this.$el.find('.slot').each(function(idx, el) {
				var $el = $(el),
					slot_id = $el.data('slot_id'),
					name = 'buy_btn_' + slot_id,
					costs = controller.getCostsForSlot(slot_id),
					disabled = costs > laurels;

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

    return GrepolympiaShopView;
});
