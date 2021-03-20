define('features/casual_worlds_blessed_town/views/casual_worlds_blessed_town', function () {
    'use strict';

    var BaseView = window.GameViews.BaseView,

        CasualWorldsBlessedTownView = BaseView.extend({
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.l10n = this.controller.getl10n();
                this.render();
            },

            render: function () {
                var blessed_town = this.controller.isCurrentTownBlessedTown() ? 'blessed' : 'normal';
                var waiting_time = this.controller.getWaitingTime();
                this.$el.removeAttr('style');
                this.renderTemplate(this.$el, 'index', {
                    l10n: this.l10n,
                    blessed_town: blessed_town,
                    header_description: this.l10n.header_description[blessed_town],
                    disabled: this.controller.isCurrentTownBlessedTown() ? '' : 'disabled',
                    town_link: this.controller.getTownLink(),
                    waiting_text: this.l10n.waiting_text(this.controller.isCooldownActive(), waiting_time)
                });

                this.registerComponents();
            },

            registerComponents: function() {
                var is_cooldown_active = this.controller.isCooldownActive();

                this.unregisterComponent('dropdown_towns');
                this.registerComponent('dropdown_towns', this.$el.find('#dd_towns').dropdown({
                    value: this.controller.getSelectedTownId(),
                    options: this.controller.getTownsDropdownOptions()
                }).on('dd:change:value', function (event, new_val) {
                    this.controller.setSelectedTown(new_val);
                }.bind(this)));

                this.unregisterComponent('change_blessed_town');
                this.registerComponent('change_blessed_town', this.$el.find('.change_blessed_town').button({
                    caption: this.l10n.change_blessed_town_btn,
                    disabled: is_cooldown_active,
                    state: is_cooldown_active
                }).on('btn:click', function () {
                    this.controller.changeBlessedTown();
                }.bind(this)));

                this.$el.find(".tyches_blessing_effect").tooltip(this.l10n.power_tooltip);
            }
        });

    window.GameViews.CasualWorldsBlessedTownView = CasualWorldsBlessedTownView;

    return CasualWorldsBlessedTownView;

});
