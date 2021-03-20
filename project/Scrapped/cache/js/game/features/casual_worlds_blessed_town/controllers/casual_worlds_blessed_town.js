define('features/casual_worlds_blessed_town/controllers/casual_worlds_blessed_town', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers'),
        DM = require_legacy('DM'),
        Game = require_legacy('Game'),
        Timestamp = require('misc/timestamp'),
        getHumanReadableTimeDate = require_legacy('getHumanReadableTimeDate'),
        CasualWorldsBlessedTownView = require('features/casual_worlds_blessed_town/views/casual_worlds_blessed_town'),
        WMap = require('map/wmap');

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
            this.casual_worlds_blessed_town = this.models.casual_worlds_blessed_town;
            this.towns = this.collections.towns;
            this.templates = us.extend({}, this.getTemplates(), DM.getTemplate('casual_worlds_blessed_town'));
            this.l10n = DM.getl10n('casual_worlds_blessed_town');
            this.selectedTownId = Game.townId;
            this.renderPage();
        },

        registerEventListeners: function () {
            this.stopListening();
            this.casual_worlds_blessed_town.onChange(this, this.view.render.bind(this.view));
        },

        renderPage: function () {
            this.initializeView();
        },

        getCurrentTownId: function() {
            return Game.townId;
        },

        getTownsDropdownOptions: function() {
            var options = [],
                towns = this.towns.getTowns();
            towns.forEach(function(town) {
                var town_data = {
                    value: town.getId(),
                    name: town.getName()
                };
                options.push(town_data);
            });
            return window.us.sortBy(options, 'name');
        },

        isCurrentTownBlessedTown: function() {
            return this.casual_worlds_blessed_town.getTownId() === this.getCurrentTownId();
        },

        isCooldownActive: function() {
            return this.getCooldownEndTime() > Timestamp.now();
        },

        setSelectedTown: function(town_id) {
            this.selectedTownId = town_id;
        },

        getSelectedTownId: function() {
            return this.selectedTownId;
        },

        changeBlessedTown: function() {
            this.casual_worlds_blessed_town.setBlessedTown(this.getSelectedTownId(), WMap.pollForMapChunksUpdate);
        },

        getTownLink: function() {
            return this.casual_worlds_blessed_town.getTownLink();
        },

        getCooldownEndTime: function() {
            return this.casual_worlds_blessed_town.getCooldownEndsAt();
        },

        getWaitingTime: function() {
            var waiting_time = Game.constants.casual_world.blessing_cooldown_days;
            if (this.isCooldownActive()) {
                var duration = this.getCooldownEndTime();
                var dateTime = Timestamp.toDate(duration - Timestamp.clientGMTOffset(duration));
                waiting_time = getHumanReadableTimeDate(dateTime);
            }
            return waiting_time;
        },

        initializeView: function () {
            this.view = new CasualWorldsBlessedTownView({
                controller: this,

                el: this.$el
            });
            this.registerEventListeners();
        }

    });
});