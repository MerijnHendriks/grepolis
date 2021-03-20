define('events/turn_over_tokens/views/sanctuary', function() {
    'use strict';

    var View = window.GameViews.BaseView;
	var toInventory = require('helpers/animate_to_inventory');
	var TooltipFactory = require('factories/tooltip_factory');

    var AssassinsSanctuaryView = View.extend({

        initialize: function () {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        render: function() {
            this.renderTemplate(this.$el, 'sanctuary', {
                l10n: this.l10n,
				trophies: this.controller.getTrophies(),
				rewards: this.controller.getRewards(),
				awards: this.controller.getAwards()
            });

			this.registerComponents();
        },

		reRender: function() {
			this.unregisterComponents();
			this.render();
		},

		registerComponents: function() {
			this.$el.find('.collection').each(function (index, el) {
				var $el = $(el),
					unit = $el.data('unit');

				this.registerCollectButton(unit, $el);
				this.registerProgressBar(unit, $el);
				this.registerRewardTooltip(unit, $el);
				this.registerAwardTooltip(unit, $el);

			}.bind(this));
		},

		registerProgressBar: function(unit, $collection) {
			var $pb = $collection.find('.pb_collection'),
				num_collected = this.controller.getTrophies()[unit],
				tt_incomplete = this.l10n.sanctuary[unit].main,
				tt_complete = this.l10n.sanctuary[unit].completed;

			if (num_collected < 10) {
				this.registerComponent('pb_collection_' + unit, $pb.singleProgressbar({
					value: num_collected,
					max: 10
				}));
				$pb.find('.caption').tooltip(tt_incomplete);
				$collection.find('.lbl_name').tooltip(tt_incomplete);
			} else {
				$collection.find('.completed_tooltip').tooltip(tt_complete);
				$collection.find('.lbl_name').tooltip(tt_complete);
			}
		},

		registerCollectButton: function(unit, $collection) {
			var $btn = $collection.find('.btn_collect'),
				reward_already_collected = this.controller.isRewardCollected(unit);

			if (reward_already_collected) {
				$btn.hide();
			} else {
				this.registerComponent('btn_collect' + unit, $btn.button({
					caption : this.l10n.sanctuary.btn_collect.label,
					disabled: !this.controller.isCollectionComplete(unit),
					state: !this.controller.isCollectionComplete(unit),
					tooltips : [
						{title : this.l10n.sanctuary.btn_collect.tooltip},
						{title : this.l10n.sanctuary[unit].main}
					]
				}).on('btn:click', this.controller.collectItems.bind(this.controller, unit)));
			}
		},

		registerRewardTooltip : function(unit, $collection) {
			var $reward = $collection.find('.reward'),
				reward = this.controller.getRewards()[unit].reward,
				tooltip = TooltipFactory.getRewardTooltip(reward);

			$reward.tooltip(tooltip);
		},

		registerAwardTooltip: function(unit, $collection) {
			var $award = $collection.find('.award'),
				award_id = this.controller.getAwards()[unit],
				tooltip = TooltipFactory.getAwardTooltip(award_id);

			$award.tooltip(tooltip);
		},

		animateRewardToInventory: function(collection_type) {
			var $reward = this.$el.find('[data-unit="'+collection_type+'"] .reward');
			toInventory($reward);
		},

        destroy : function() {
        }
    });

    return AssassinsSanctuaryView;
});
