/* globals Timestamp */

define('features/surveys/views/survey_icon', function(require) {
    'use strict';

    var BaseView = window.GameViews.BaseView;

    var SurveyIcon = BaseView.extend({
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
        },

        render : function() {
            var $tpl = $('#tpl_survey_icon').html();

            this.$el.append(us.template($tpl, us.extend({
                l10n : this.l10n,
                icon_type : this.controller.getIconType(),
                model_id : this.controller.getModelId()
            })));

            this.$icon_el = this.$el.find('[data-model_id="' + this.controller.getModelId() + '"]');

            this.registerViewComponents();
        },

        reRender : function() {
            this.removeIcon();
            this.render();
        },

        registerViewComponents : function() {
            this.unregisterComponents();

            this.registerTimer();

            this.$icon_el.on('click', function (e) {
                this.controller.iconClicked(e);
            }.bind(this));
        },

        registerTimer : function() {
            var $timer =  this.$icon_el.find('.timer_box'),
                $countdown = this.$icon_el.find('.cd_offer_timer'),
                remaining_time = this.controller.getTimerEndTime() - Timestamp.now(),
                countdown_component = $countdown.countdown2({
                    value : remaining_time,
                    display : 'day_hr_min_sec',
                    only_non_zero : true
                }).on('cd:finish', function() {
                        this.$icon_el.hide();
                        $timer.hide();
                }.bind(this));

            this.controller.registerComponent('crm_icon_countdown', countdown_component);
            $timer.show();
        },

        removeIcon : function() {
            if (this.$icon_el) {
	            this.$icon_el.remove();
            }
        }
    });

    window.GameViews.SurveyIcon = SurveyIcon;

    return SurveyIcon;

});
