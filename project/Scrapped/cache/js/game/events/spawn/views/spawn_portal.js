/* globals Promise */

(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;
    var BenefitHelper = require('helpers/benefit');
    var BenefitTypes = require('enums/benefit_types');
    var EventSkins = require('enums/event_skins');

	var SpawnPortalView = BaseView.extend({

		initialize: function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
		},

		render: function() {
			var skin = BenefitHelper.getBenefitSkin(BenefitTypes.SPAWN);
			var l10n = BenefitHelper.getl10nForSkin(
					this.controller.getl10n(),
                	'spawn',
					BenefitTypes.SPAWN
				),
				$portal_wrapper = $('<div class="spawn ' + skin + '">')
					.append('<div class="portal">')
					.append('<div class="destroy_glow">')
					.append('<div class="destroy_line">')
					.append('<div class="hades_unit_movement">'),
				onSpawnClick = this.controller.onSpawnClick.bind(this.controller);

			this.$el.append($portal_wrapper);

			this.showOrHideTroopIcon();

			$portal_wrapper.tooltip(l10n.portal_tooltip);
			$portal_wrapper.click(onSpawnClick);

			// TODO remove this debugging backdoor
			window.portalView = this;
		},

		showDestroyAnimation: function() {
			var skin = BenefitHelper.getBenefitSkin(BenefitTypes.SPAWN),
				$el = this.$el.find('.spawn');

			if (skin === EventSkins.HADES) {
				return this.showDestroyAnimationHades($el);
            }
            else {
				return this.showDestroyAnimationHydra($el);
			}
		},

        showDestroyAnimationHades: function ($el) {
			var $portal = $el.find('.portal'),
				$glow = $el.find('.destroy_glow'),
				$line = $el.find('.destroy_line');

            $glow.show();
            $line.show();

            return new Promise(function (resolve) {
                $glow.transition({
                    opacity: 1,
                    duration: 400,
                    easing: 'ease',
                    complete: function () {
                        $portal.hide();
                        $glow.transition({
                            opacity: 0,
                            duration: 200,
                            easing: 'ease',
                            complete: function () {
                                resolve();
                            }
                        });
                    }
                });
                // in parallel show a line flashing
                $line.transition({
                    opacity: 1,
                    duration: 350,
                    easing: 'ease',
                    complete: function () {
                        $line.transition({
                            opacity: 0,
                            duration: 100,
                            easing: 'ease'
                        });
                    }
                });
            });
		},

		showDestroyAnimationHydra: function ($el) {
			var $portal = $el.find('.portal');

            return new Promise(function (resolve) {
            	$portal.onceOnAnimationEnd(resolve).addClass('destroyed');
            });
		},

		showOrHideTroopIcon: function() {
			var unit_movement_icon = this.$el.find('.hades_unit_movement');
			var is_mission_running = this.controller.isMissionRunning();
			if(is_mission_running) {
				unit_movement_icon.show();
			} else {
				unit_movement_icon.hide();
			}
		},

		destroy: function() {

		}
	});

	window.GameViews.SpawnPortalView = SpawnPortalView;
}());
