/* global PopupFactory, GameDataBuildings, DateHelper, Timestamp */

define('features/god_selection/views/god_selection', function(require) {
    'use strict';

    var View = window.GameViews.BaseView;

    return View.extend({
        initialize: function (options) {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.fade_in_time = 500;
            this.selected_god = '';

            if (this.controller.isTempleAvailable()) {
                this.render();
            }
            else {
                this.renderTempleNotAvailable();
            }
        },

        render: function () {
            var current_god = this.controller.getGodInTown();

            this.renderTemplate(this.$el, 'index', {
                l10n: this.l10n,
                current_god: current_god,
                gods: this.controller.getGods(),
                is_priest_activated: this.controller.isPriestActivated(),
                favor_production_boost: this.l10n.favor_production_boost(50),
                mythical_units_boost: this.l10n.mythical_units_boost(20)
            });

            this.registerGodThumbnails();
            this.registerChangedGodButton();
            this.registerBuyPriestButton();
            this.registerPriestImageClick();

            if (current_god) {
                this.registerFavorProgressBar();

                if (this.controller.showFuryResource()) {
                    this.registerFuryProgressBar();
                }

                this.selectGod(current_god);
            }

            this.registerListSlider();
        },

        registerListSlider: function () {
            var $slider = this.$el.find('#temple_gods'),
                component;

            this.unregisterComponent('gods_slider');
            component = this.registerComponent('gods_slider', $slider.listSlider({
                enable_wheel_scrolling: true,
                is_animated: true,
                is_horizontal: false,
                scroll_item_into_view: this.$el.find('#temple_gods .selected')
            }));

            $slider.addClass('animated');
        },

        renderTempleNotAvailable: function () {
            this.renderTemplate(this.$el, 'no_building', GameDataBuildings.getNoBuildingTemplateData('temple'));
        },

        renderGodDescription: function (god_id) {
            var god = this.controller.getGod(god_id),
                $god_gescription = this.$el.find('#temple_god_description');

            $god_gescription.empty().hide().append(
                this.getTemplate('description', {
                    l10n: this.l10n,
                    god: god_id,
                    name: god.name,
                    topic: god.topic,
                    description: god.description,
                    powers: god.powers,
                    units: god.units
                })
            ).fadeIn(this.fade_in_time, 'linear', this.registerGodDescriptionTooltips.bind(this));
        },

        registerGodDescriptionTooltips: function () {
            var $mythical_units = this.$el.find('.temple_unit');

            $mythical_units.each(function(key, unit) {
                var $unit = $(unit);
                $unit.tooltip(this.controller.getUnitTooltip($unit.data('unit_id')), {}, false);
            }.bind(this));

            this.registerGodPowerTooltips();
        },

        registerGodPowerTooltips: function () {
            var $powers = this.$el.find('.temple_god_power');
            $powers.each(function(key, power) {
                $(power).tooltip(this.controller.getPowerTooltip(power.dataset.power_id));
            }.bind(this));
        },

        registerGodThumbnails: function () {
            var $gods = this.$el.find('#temple_gods li');

            $gods.each(function (key, god) {
                $(god).tooltip(this.controller.getGod(god.dataset.god_id).name);
            }.bind(this));

            $gods.off().on('click', function (event) {
                var god_id = $(event.currentTarget).data('god_id');

                if (this.selected_god !== god_id) {
                    this.selectGod(god_id);
                }
            }.bind(this));
        },

        registerChangedGodButton: function () {
            var current_god_id = this.controller.getGodInTown(),
                caption = current_god_id && current_god_id !== '' ? this.l10n.change_god : this.l10n.worship;

            this.unregisterComponent('btn_change_god');
            this.registerComponent('btn_change_god', this.$el.find('.btn_change_god').button({
                caption: caption
            }).on('btn:click', function () {
                var god_id = this.$el.find('#temple_button').data('god_id');
                this.controller.openChangeGodConfirmationWindow(god_id);
            }.bind(this)));
        },

        registerFavorProgressBar: function () {
            var $progress = this.$el.find('#temple_favor_bar_progress'),
                remaining_time = this.controller.getTimeUntilMaxFavor(),
                tooltip = '<div>' + this.l10n.favor_replenished + '<%= time %></div>';
            this.unregisterComponent('favor_progressbar');
            this.registerComponent('favor_progressbar', $progress.singleProgressbar({
                caption: this.l10n.favor_caption,
                value: remaining_time,
                max: this.controller.getMaxFavorTime(),
                real_max: this.controller.getMaxFavor(),
                type: 'time',
                countdown: true,
                countdown_settings: {
                    display_days: true
                },
                liveprogress: true,
                liveprogress_interval: 1,
                reverse_progress: true,
                template: 'tpl_pb_time_and_value',
                clear_timer_if_zero: true,
                tooltips: {
                    in_progress : {
                        template: us.template(tooltip),
                        data: {
                            time : DateHelper.formatDateTimeNice(Timestamp.now() + remaining_time, false)
                        }
                    },
                    idle : {
                        template: us.template('<div>' + this.l10n.favor_max_capacity +'</div>')
                    }
                }
            }).on('pb:change:realvalue', function (event, progressbar) {
                progressbar.updateTooltipData('in_progress', {
                    time: progressbar.getEndDate()
                });
            }));
        },

        registerFuryProgressBar: function () {
            var $progress = this.$el.find('#temple_fury_bar_progress'),
                tooltip = '<div>' + this.l10n.fury_replenished + '</div>';

            this.unregisterComponent('fury_progressbar');
            this.registerComponent('fury_progressbar', $progress.singleProgressbar({
                caption: this.l10n.fury_caption,
                value: this.controller.getCurrentFury(),
                max: this.controller.getMaxFury(),
                type: 'integer',
                tooltips: {
                    idle : {
                        template: us.template(tooltip)
                    }
                }
            }).on('pb:change:realvalue', function (event, progressbar) {
                progressbar.updateTooltipData('in_progress', {});
            }));
        },

        registerPriestImageClick: function () {
            this.$el.find('.btn_show_priest_advantages').on('click', function () {
                this.controller.openPremiumAdvantagesWindow();
            }.bind(this));
        },

        registerBuyPriestButton: function () {
            this.unregisterComponent('btn_buy_priest');
            this.registerComponent('btn_buy_priest', this.$el.find('.btn_buy_priest').button({
                caption: this.l10n.activate,
                icon: true,
                icon_type: 'gold',
                tooltips: [{title: PopupFactory.texts.priest_hint}]
            }).on('btn:click', function (event, button) {
                this.controller.openBuyPriestConfirmationWindow(button);
            }.bind(this)));
        },

        selectGod: function (god_id) {
            var $fade = this.$el.find('#temple_god_fade'),
                $static = this.$el.find('#temple_god_static'),
                $temple_favor_bar = this.$el.find('#temple_favor_bar'),
                $temple_fury_bar = this.$el.find('#temple_fury_bar'),
                $temple_button = this.$el.find('#temple_button'),
                $select_god = this.$el.find('.select_god');

            $fade.removeClass().addClass(god_id).fadeIn(this.fade_in_time, function() {
                $static.removeClass().addClass(god_id).show();
                $fade.hide();
            });

            $select_god.hide();

            if (god_id === this.controller.getGodInTown()) {
                $temple_button.hide();
                $temple_favor_bar.fadeIn(this.fade_in_time);

                if (this.controller.showFuryResource()) {
                    $temple_fury_bar.fadeIn(this.fade_in_time);
                }
            }
            else {
                $temple_favor_bar.hide();
                $temple_fury_bar.hide();
                $temple_button.fadeIn(this.fade_in_time);
                $temple_button.data('god_id', god_id);
            }

            this.$el.find('#temple_gods .selected').removeClass('selected');
            this.$el.find('#temple_gods .' + god_id + '_small').addClass('selected');
            this.selected_god = god_id;
            this.renderGodDescription(god_id);
        },

        updateFuryProgress: function () {
            var component = this.getComponent('fury_progressbar');
            if (component) {
                component.setValue(this.controller.getCurrentFury());
            }
        },

        destroy: function () {

        }
    });
});
