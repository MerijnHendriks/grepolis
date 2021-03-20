define('features/colonization/views/index', function (require) {
    'use strict';

    var BaseView = window.GameViews.BaseView,
        GameDataColonization = require('feature/colonization/data/colonization'),
        RuntimeFactory = require('features/runtime_info/factories/runtime_info'),
        DateHelper = require('helpers/date');

    return BaseView.extend({
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        render: function () {
            this.unregisterComponents();

            if (!this.controller.isFoundationRequirementFullfilled()) {
                this.renderTemplate(this.$el, 'requirements', {
                    l10n: this.l10n,
                    needed_academy_level : GameDataColonization.getRequiredAcademyLevel(),
                    needed_docks_level: GameDataColonization.getRequiredDocksLevel(),
                    req: this.controller.getFoundationRequirements()
                });
                this.registerFoundTownButton();
                this.registerRuntimeButton();
                return;
            }

            var duration = this.controller.getColonizationDuration();

            this.renderTemplate(this.$el, 'index', {
                l10n: this.l10n,
                colonization_duration: DateHelper.readableSecondsWithLabels(duration)
            });

            this.registerColonizationTooltip();
            this.registerIslandInfoTooltip();
            this.registerFoundTownButton();
            this.registerRuntimeButton();
        },

        registerColonizationTooltip: function () {
            var infos = this.controller.getColonizationTooltipInfos();

            var template = us.template(this.getTemplate('tooltip_colonizing_info', {
                l10n: this.l10n.tooltips.colonization,
                base_points: this.controller.getColonizationTownBasePoints(),
                buildings: infos.buildings,
                levels: infos.levels,
                sorted_buildings: infos.sort_order
            }));

            this.$el.find('.colonizing_info .info_icon').tooltip(template, {maxWidth: 400});
        },

        registerRuntimeButton : function() {
            this.registerComponent('btn_runtime', this.$el.find('.btn_runtime').button({
                caption : '',
                icon: true,
                icon_position: 'left',
                icon_type: 'runtime',
                tooltips: [
                    { title : this.l10n.tooltips.travel_time },
                    null
                ]
            }).on('btn:click', function() {
                var target_info = this.controller.getTargetInfo();
                RuntimeFactory.openWindow(target_info);
            }.bind(this)));
        },

        registerIslandInfoTooltip: function () {
            var island_info = this.controller.getIslandInfo(),
                target_info = this.controller.getTargetInfo(),
                resource_tag = island_info.resource.plenty[0].toUpperCase() + island_info.resource.rare[0].toLowerCase();

            var template = us.template(this.getTemplate('tooltip_island_info', {
                l10n: this.l10n.tooltips.island_info,
                island: island_info,
                resource_tag: resource_tag,
                has_farming_spots: island_info.farm_town_spots,
                island_x : target_info.target_x,
                island_y : target_info.target_y,
                bpv_enabled : require('data/features').battlepointVillagesEnabled()
            }));

            this.$el.find('.island_info .info_icon').tooltip(template, {maxWidth: 400});
        },

        registerFoundTownButton: function () {
            this.registerComponent('btn_found_town', this.$el.find('.btn_found_town').button({
                caption: this.l10n.found_city,
                disabled: !this.controller.isFoundationRequirementFullfilled()
            }).on('btn:click', function () {
                this.controller.onFoundTownButton();
            }.bind(this)));
        },

        getFoundTownButton: function () {
            return this.getComponent('btn_found_town');
        },

        destroy: function () {
        }
    });
});
