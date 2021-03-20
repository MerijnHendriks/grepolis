/* global Backbone, ITowns, HumanMessage */

/**
 * This module should include all global model/collection listeners.
 * Beware of the town switch!
 */
define('listeners/models', function () {
    'use strict';

    var GameEvents = require('data/events');

    var ModelsListener = {

        initialize: function (models, collections) {

            collections.trades.onTradeArrived(this, function (model) {
                $.Observer(GameEvents.town.trade.arrived).publish(model);
            });


            var hasNewIncomingAttack = function (model) {
                var previouse_attributes = model.previousAttributes();
                return (!previouse_attributes.incoming && model.getIncoming() > 0) ||
                    (previouse_attributes.incoming < model.getIncoming());
            };

            collections.attacks.onIncomingAttackCountChange(this, function (model, value) {
                /* The event should be triggered only when the attacks are incoming for the towns, which belong
                   to the player */
                if (ITowns.isMyTown(model.getTownId()) && hasNewIncomingAttack(model)) {
                    var count = value.length ? value.length : value;
                    $.Observer(GameEvents.attack.incoming).publish({count: count});
                }
            });

            collections.player_heroes.onHealed(this, function (model) {
                $.Observer(GameEvents.hero.healed).publish(model);
            });

            models.player_gods.onGodsFavorFull(this, function (god_ids) {
                $.Observer(GameEvents.town.favor.full).publish({god_ids: god_ids});
            });

            models.player_report_status.onNewAlliancePostsCountChange(function (prs_model) {
                var new_forum_entries = prs_model.getNewAlliancePostsCount();
                if (new_forum_entries) {
                    $.Observer(GameEvents.alliance.new_message).publish({count: new_forum_entries});
                }
            });

            collections.player_awards.onAwardObtained(this, function (award) {
                HumanMessage.award(award);
            });

        },

        destroy: function () {

        }
    };

    us.extend(ModelsListener, Backbone.Events);

    window.GameListeners.ModelsListener = ModelsListener;
    return ModelsListener;
});
