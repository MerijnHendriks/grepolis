/* global DM, Backbone */
define('features/crm_campaign/listeners/crm_icon_listener', function () {
    'use strict';

    var GameEvents = require_legacy('GameEvents');

    var Listener = us.extend({
        initialize: function (models, collections) {
            collections.crm_icons.onAdd(this, this.evaluateIconsOnAdd.bind(this));

            collections.crm_icons.onDelete(this, this.removeIcon.bind(this));

            collections.crm_icons.forEach(function(model) {
                this.evaluateIconsOnAdd(model);
            }.bind(this));
        },

        removeIcon : function(model) {
            $('.happening_large_icon_container .crm_icon[data-model_id="' + model.getId() + '"]').remove();
        },

        evaluateIconsOnAdd: function (model) {
            if (!model.isValid()) {
                this.removeIcon(model);
                return;
            }

            new window.GameControllers.CrmIconController({
                el : $('.happening_large_icon_container'),
                l10n : {
                    common: DM.getl10n('common')
                },
                models : {
                    interstitial_model : model
                },
                cm_context : { main: 'interstitial', sub: 'icon' }
            });

            $.Observer(GameEvents.happenings.icon.initialize).publish();
        },
        destroy: function () {

        }
    }, Backbone.Events);

    window.GameListeners.CrmIconListener = Listener;
    return Listener;
});
