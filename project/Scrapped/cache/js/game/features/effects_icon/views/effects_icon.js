/* globals GameData, DM, Game */

define('features/effects_icon/views/effects_icon', function (require) {
	'use strict';

	var Views = require_legacy('GameViews');
    var BenefitType = require('enums/benefit_types');
    var DateHelper = require('helpers/date');
    var SECONDS_PER_HOUR = 3600;

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
		},

		render: function () {
			var active_benefits = this.controller.getActiveEffects(),
                effects = '',
                tooltip = '';

			active_benefits.forEach(function (benefit) {
				switch (benefit.getBenefitType()) {
                    case BenefitType.AUGMENTATION:
                        effects += this.renderAugmentation(benefit);
                        break;
                    case BenefitType.AUGMENTATION_FAVOR:
                        effects += this.renderAugmentationFavor(benefit);
                        break;
                    case BenefitType.AUGMENTATION_RESOURCE:
                        effects += this.renderAugmentationResources(benefit);
                        break;
                    case BenefitType.PARTY:
                        effects += this.renderParty(benefit);
                        break;
                    default:
                        break;
				}
			}.bind(this));

			tooltip = us.template(DM.getTemplate('effects_icon', 'index'), {
			    l10n: this.l10n,
                effects: effects
            });

			this.$el.tooltip(tooltip);
		},

		getAugmentationTemplate: function (l10n, type, bonus_effects, end_date) {
		 	return us.template(DM.getTemplate('effects_icon', 'effect'), {
                l10n: l10n,
                type: type,
                bonus_effects: bonus_effects,
                active_until: this.l10n.active_until,
                end_date: DateHelper.formatDateTimeNice(end_date, false, false)
            });
		},

        renderAugmentation: function (benefit) {
		    var l10n = this.l10n.augmentation[benefit.getType()],
                value = benefit.getParam('percent'),
                bonus_effect = [l10n.bonus(value)];

            return this.getAugmentationTemplate(l10n, benefit.getType(), [bonus_effect], benefit.getEnd());
        },

		renderParty: function (benefit) {
			var duration = (benefit.getParam('hours') / Game.game_speed) * SECONDS_PER_HOUR,
				end_date = benefit.getStart() + duration;

            return us.template(DM.getTemplate('effects_icon', 'effect_party'), {
                l10n: this.l10n.party,
                type: BenefitType.PARTY,
				duration: DateHelper.readableSecondsWithLabels(duration),
                wood: benefit.getParam('wood'),
                stone: benefit.getParam('stone'),
                iron: benefit.getParam('iron'),
                min_academy_level: benefit.getParam('min_academy_level'),
                active_until: this.l10n.active_until,
                end_date: DateHelper.formatDateTimeNice(end_date, false, false)
            });
		},

		renderAugmentationFavor: function (benefit) {
			var l10n = this.l10n.augmentation_favor,
				bonus_effects = [];

            for (var god in GameData.gods) {
                if (!GameData.gods.hasOwnProperty(god)) {
                    continue;
                }

                var name = GameData.gods[god].name,
                    value = parseInt(benefit.getParam(god), 10);

                if (value !== 0) {
                    bonus_effects.push(l10n.bonus.description(name, value));
            	}
			}

			return this.getAugmentationTemplate(l10n, BenefitType.AUGMENTATION_FAVOR, bonus_effects, benefit.getEnd());
		},

		renderAugmentationResources: function (benefit) {
            var l10n = this.l10n.augmentation_resource,
                bonus_effects = [];

            for (var resource in GameData.resources) {
                if (!GameData.resources.hasOwnProperty(resource)) {
                    continue;
                }

                var name = GameData.resources[resource],
                    value = parseInt(benefit.getParam(resource), 10);

                if (value !== 0) {
                    bonus_effects.push(l10n.bonus.description(name, value));
                }
            }

            return this.getAugmentationTemplate(l10n, BenefitType.AUGMENTATION_RESOURCE, bonus_effects, benefit.getEnd());
		}
	});
});
