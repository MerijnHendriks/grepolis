define('events/missions/views/sub_windows/send_units', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'send_units', {
				l10n: this.l10n,
				skin: this.controller.getMissionsSkin()
			});

            this.controller.renderUnitPicker();
			this.registerCapacityBar();
            this.registerSendUnitsButton();
			this.registerUnitPickerEvents();
		},

		registerSendUnitsButton: function() {
		    var min_capacity = this.controller.getMinCapacity(),
                max_capacity = this.controller.getMaxCapacity(),
                bar = this.getComponent('pb_capacity'),
                value = this.controller.getCapacityValue();

			this.unregisterComponent('btn_send_units');
			this.registerComponent('btn_send_units', this.$el.find('.btn_send_units').button({
                caption: this.l10n.button,
                toggle: true,
                disabled: bar.getMin() > value,
                state: bar.getMin() > value,
                tooltips: [
                    {title: this.l10n.tooltips.send_button},
                    {title: this.l10n.tooltips.capacity(min_capacity, max_capacity)}
                ]
            }).on('btn:click', function() {
            	this.controller.startMission();
            }.bind(this)));
		},

        registerUnitPickerEvents: function() {
            this.$el.find('.unit_picker_container').on('txt:change:value', function() {
                this.updateCapacityBar();
            }.bind(this));
        },

		registerCapacityBar: function() {
			var min_capacity = this.controller.getMinCapacity(),
                max_capacity = this.controller.getMaxCapacity();

            this.unregisterComponent('pb_capacity');
            this.registerComponent('pb_capacity', this.$el.find('.js-capacity').singleProgressbar({
                extra : 0,
                min: min_capacity,
                max: max_capacity,
                value: 0,
                animate: false,
                caption: this.l10n.capacity,
                tooltips : {
                    idle : {template : this.l10n.tooltips.capacity(min_capacity, max_capacity)}
                }
            }));
		},

        updateCapacityBar : function() {
            var bar = this.getComponent('pb_capacity'),
                value = this.controller.getCapacityValue(),
                button = this.getSendUnitsButton();

            if (!bar) {
                return;
            }

            bar.setValue(value);

            if ((bar.getMin() > value || bar.getMax() < value) && !button.isDisabled()) {
                button.setState(true);
                button.disable();
            }
            else if (bar.getMin() <= value && bar.getMax() >= value && button.isDisabled()) {
                button.setState(false);
                button.enable();
            }
        },

		getSendUnitsButton: function() {
            return this.getComponent('btn_send_units');
        }
	});
});
