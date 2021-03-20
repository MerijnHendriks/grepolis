/*globals gpAjax, TooltipFactory, PremiumWindowFactory, BuyForGoldWindowFactory, ConfirmationWindowFactory, MM, GameEvents */

define('features/god_selection/controllers/god_selection', function (require) {
    var GodSelectionController,
        GodSelectionView = require('features/god_selection/views/god_selection'),
        TabController = window.GameControllers.TabController,
        GameData = window.GameData,
        GroundUnits = require('enums/ground_units'),
        HelperTown = require_legacy('HelperTown');

    GodSelectionController = TabController.extend({
        view: null,

        initialize: function (options) {
            TabController.prototype.initialize.apply(this, arguments);
        },

        renderPage: function () {
            this.god_id = this.getGodInTown();
            this.premium_features_model = this.getModel('premium_features');

            this.view = new GodSelectionView({
                el: this.$el,
                controller: this
            });

            this.registerEventListeners();

            return this;
        },

        registerEventListeners: function () {
            this.stopObservingEvents();
            this.observeEvent(GameEvents.town.town_switch, function () {
                this.god_id = this.getGodInTown();
                this.view.render();
            }.bind(this));
            this.observeEvent(GameEvents.favor.change, this.view.registerFavorProgressBar.bind(this.view));

            this.stopListening();
            this.getPlayerGodsModel().onFuryChange(this, this.handleFuryChange.bind(this));
        },

        handleFuryChange: function () {
            if (!this.showFuryResource()) {
                return;
            }

            this.view.registerGodPowerTooltips();
            this.view.updateFuryProgress();
        },

        getPlayerGodsModel: function () {
            return this.getModel('player_gods');
        },

        getGods: function () {
            return this.getPlayerGodsModel().getWorldAvailableGods();
        },

        getGod: function (god_id) {
            return GameData.gods[god_id];
        },

        getCurrentTown: function () {
            return this.getCollection('towns').getCurrentTown();
        },

        getCurrentTownId: function () {
            return this.getCurrentTown().getId();
        },

        getGodInTown: function () {
            return this.getCurrentTown().getGod();
        },

        isPriestActivated: function () {
            return this.premium_features_model.isActivated(this.premium_features_model.PRIEST);
        },

        getTimeUntilMaxFavor: function () {
            return Math.floor((this.getMaxFavor() - this.getCurrentFavorForGod(this.god_id)) / this.getFavorForGodPerSecond(this.god_id));
        },

        getMaxFavorTime: function () {
            return Math.floor(this.getMaxFavor() / this.getFavorForGodPerSecond());
        },

        getMaxFavor: function () {
            return this.getPlayerGodsModel().getMaxFavor();
        },

        getMaxFury: function () {
            return this.getPlayerGodsModel().getMaxFury();
        },

        getCurrentFury: function () {
            return this.getPlayerGodsModel().getFury();
        },

        getCurrentFavorForGod: function () {
            return this.getPlayerGodsModel().getCurrentFavorForGod(this.god_id);
        },

        getFavorForGodPerSecond: function () {
            return this.getPlayerGodsModel().getProductionForGodPerSecond(this.god_id);
        },

        isTempleAvailable: function () {
            return this.getCurrentTown().getBuildings().getBuildingLevel('temple') > 0;
        },

        openPremiumAdvantagesWindow: function () {
            PremiumWindowFactory.openAdvantagesTab(this.premium_features_model.PRIEST);
        },

        openBuyPriestConfirmationWindow: function (button) {
            BuyForGoldWindowFactory.openBuyAdvisorWindow(button, this.premium_features_model.PRIEST, function() {
                this.premium_features_model.extendPriest();
            }.bind(this));
        },

        openChangeGodConfirmationWindow: function (new_god_id) {
            var town_units = {},
                supporting_units = {},
                units_models = MM.getModelsForClass('Units'),
                town_id = this.getCurrentTownId(),
                lose_all_fury = false,
                additional_units;

            if (this.god_id && this.god_id !== '') {
                for (var model in units_models) {
                    if (units_models.hasOwnProperty(model) && units_models[model].getOriginTownId() === town_id) {
                        additional_units = units_models[model].getMythicalUnits();

                        if (units_models[model].getCurrentTownId() === town_id && this.hasUnits(additional_units)) {
                            town_units = this.addUnits(town_units, additional_units);
                        } else if (this.hasUnits(additional_units)) {
                            supporting_units = this.addUnits(supporting_units, additional_units);
                        }
                    }
                }

                if (GameData.gods.ares && this.god_id === GameData.gods.ares.id) {
                    var allTowns = this.getCollection('towns').getTowns();

                    townsWithAres = allTowns.filter(function (town) {
                        return town.getGod() === GameData.gods.ares.id;
                    });

                    if (townsWithAres.length <= 1) {
                        lose_all_fury = true;
                    }
                }

                delete town_units[GroundUnits.GODSENT];
                delete supporting_units[GroundUnits.GODSENT];

                ConfirmationWindowFactory.openConfirmationGodSelectionWindow(
                    new_god_id,
                    this.god_id,
                    town_units,
                    supporting_units,
                    lose_all_fury,
                    function() {
                        this.changeGod(new_god_id);
                    }.bind(this)
                );
            }
            else {
                this.changeGod(new_god_id);
            }
        },

        hasUnits: function (units) {
            for (var unit in units) {
                if (units.hasOwnProperty(unit) && units[unit] !== 0 && unit !== GroundUnits.GODSENT) {
                    return true;
                }
            }

            return false;
        },

        addUnits: function (units, additional_units) {
            if (Object.keys(units).length === 0) {
                return additional_units;
            }

            for (var unit in units) {
                if (units.hasOwnProperty(unit)) {
                    units[unit] += additional_units[unit];
                }
            }

            return units;
        },

        getPowerTooltip: function (power_id) {
            return TooltipFactory.createPowerTooltip(power_id, {show_costs : true});
        },

        getUnitTooltip: function (unit_id) {
            return TooltipFactory.getUnitCard(unit_id);
        },

        changeGod: function (god_id) {
            gpAjax.ajaxPost('building_temple', 'change_god', {'god_id': god_id}, true, function() {
                $.Observer(GameEvents.god.change).publish({god_id: god_id});
                this.renderPage();
            }.bind(this));
        },

        showFuryResource: function () {
            return HelperTown.showFuryResourceForCurrentTown();
        }
    });

    return GodSelectionController;
});
