/* globals GameData, GameDataBuildings*/

define('market/views/premium_exchange', function () {
    'use strict';

    var View = window.GameViews.BaseView;
    var OrderType = require('market/enums/order_type');

    return View.extend({
        initialize: function () {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);

            this.l10n = this.controller.l10n;
            this.sub_context_spinner = 'sp_resource_context';
            this.render();
        },

        render: function () {
            if (this.controller.hasMarket()) {
                this.renderTemplate(this.$el, 'premium_exchange', {
                    l10n: this.l10n,
                    sea_id: this.controller.getSeaId()
                });

                this.registerTabs();
                this.renderActiveTab();
                this.renderRules();
            } else {
                this.renderNoBuilding();
            }
        },

        reRender: function () {
            this.render();
        },

        renderActiveTab: function () {
            var $page = this.$el.find('.gp_tab_page.active'),
                pagenr = this.getActiveTabNr(),
                order_type = this.active_tab.getPageElement(pagenr).data('type');

            this.renderTemplate($page, 'tab_buy_sell', {
                l10n: this.l10n,
                pagenr: pagenr
            });

            this.controller.setCurrentOrderType(order_type);

            this.renderResources($page);

            this.registerCapacityProgress($page);
            this.updateEstimatedPrice();

            this.unregisterComponent('btn_find_rates');
            this.registerComponent('btn_find_rates', $page.find('.btn_find_rates').button({
                caption: this.l10n.find_best_rates,
                disabled: true,
                state: true,
                toggle: true,
                tooltips: [
                    { title: this.l10n.tooltips.find_best_rates_button.enabled },
                    { title: this.l10n.tooltips.find_best_rates_button.disabled }
                ]
            }).on('btn:click', this.controller.onBtnFindBestRatesClick.bind(this.controller)));

            $page.find('.icon.info').tooltip(this.l10n.tooltips.info);
        },

        renderResources: function ($page) {
            var $wrapper = $page.find('.resources_wrapper');

            this.unregisterComponents(this.sub_context_spinner);
            for (var resource in GameData.resources) {
                if (GameData.resources.hasOwnProperty(resource)) {
                    $wrapper.append(this.getTemplate('resource', {
                        resource: resource
                    }));

                    var $el = $wrapper.find('.resource[data-type="' + resource + '"]');

                    this.registerResourceProgress($el, resource);
                    this.registerResourceSpinner($el, resource);
                }
            }

            $page.find('.icon.info').tooltip(this.l10n.tooltips.info);
        },

        renderRules: function () {
            this.renderTemplate(this.$el.find('.footer .js-scrollbar-content'), 'rules', {
                l10n: this.l10n,
                duration: this.controller.getTradeDuration()
            });

            this.toggleRules();
            this.registerRuleClick();
        },

        renderNoBuilding: function () {
            this.renderTemplate(this.$el, 'no_building', GameDataBuildings.getNoBuildingTemplateData('market'));
        },

        registerTabs: function () {
            this.unregisterComponent('tab_premium_exchange');
            this.active_tab = this.registerComponent('tab_premium_exchange', this.$el.find('.tab_premium_exchange').tab({
                activepagenr: this.getActiveTabNr()
            }).on('tab:change:activepagenr', function () {
                this.renderActiveTab();
            }.bind(this)));
        },

        registerCapacityProgress: function ($el) {
            this.capacity_bar = null;
            this.unregisterComponent('pg_capacity');
            this.capacity_bar = this.registerComponent('pg_capacity', $el.find('.pg_capacity').singleProgressbar({
                max: this.controller.getMaxCapacity(),
                value: this.controller.getAvailableCapacity(),
                caption: this.l10n.capacity
            }));
        },

        getCircularProgressbarColor: function() {
            var colors = {
                start_color: 'rgb(194,208,124)',
                end_color: 'rgb(106,129,64)'
            };

            if (this.getActiveTabNr() === 1) {
                colors.start_color = 'rgb(226,188,38)';
                colors.end_color = 'rgb(210,142,50)';
            }

            return colors;
        },

        registerResourceProgress: function ($el, resource) {
            var name = 'pg_' + resource,
                value = this.controller.getAvailableResourcesForTrade(resource),
                max = this.controller.getMaxResourcesForTrade(resource),
                circular_progressbar_colors = this.getCircularProgressbarColor();

            this.unregisterComponent(name);
            this.registerComponent(name, $el.singleProgressbar({
                template: 'internal',
                type: 'circular',
                value: value,
                max: max,
                draw_settings: {
                    start_angle: 0.43,
                    end_angle: 5.85,
                    start_color: circular_progressbar_colors.start_color,
                    end_color: circular_progressbar_colors.end_color,
                    line_thick: 6
                }
            }));

            $el.find('.caption .current').text(value).tooltip(this.l10n.tooltips.current_stock);
            $el.find('.caption .max').text(max).tooltip(this.l10n.tooltips.max_capacity);
        },

        registerResourceSpinner: function ($el, resource) {
            var name = 'input_' + resource,
            spinner_threshold_max = this.controller.getCurrentOrderType() === OrderType.BUY ?
                    this.getResourceSpinnerMaxBuy(resource) :
                    this.getResourceSpinnerMaxSell(resource);

            var spinner = this.registerComponent(name, $el.find('.sp_resource').spinner({
                max: spinner_threshold_max.value,
                details: { threshold_max_type: spinner_threshold_max.type }
            }), this.sub_context_spinner);
            
            spinner.on('sp:adjust_to_max', function (event, spinner) {
                var details = spinner.getDetails();
                this.updateFindBestRatesButtonTooltip(details.threshold_max_type);
            }.bind(this));
            
            spinner.on('sp:change:value', function (event, new_val, old_val, spinner) {
                if (old_val !== 0 && new_val !== 0) {
                    this.updateEstimatedPrice(spinner);

                    if (old_val === spinner.getMax() && new_val !== old_val) {
                        this.updateFindBestRatesButtonTooltip();
                    }

                    return;
                }

                if (new_val === 0) {
                    this.enableSpinners();
                    this.updateEstimatedPrice();
                    this.toggleFindRatesButton(false);
                } else {
                    this.disableSpinners(spinner);
                    this.updateEstimatedPrice(spinner);
                    this.toggleFindRatesButton(true);
                }
            }.bind(this));
        },

        toggleRules: function () {
            var $rules = this.$el.find('.premium_exchange_rules');
            if ($rules.hasClass('close')) {
                $rules.removeClass('close');
                $rules.addClass('open');
            } else {
                $rules.removeClass('open');
                $rules.addClass('close');
            }
            this.registerScrollbar();
        },

        registerRuleClick: function () {
            var $rules_header = this.$el.find('.premium_exchange_rules .game_border_header');
            $rules_header.on('click', this.toggleRules.bind(this));
        },

        registerScrollbar: function () {
            this.unregisterComponent('info_scrollbar');
            this.registerComponent('info_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                elements_to_scroll: this.$el.find('.js-scrollbar-content'),
                elements_to_scroll_position: 'relative',
                element_viewport: this.$el.find('.js-scrollbar-viewport'),
                prepend: true
            }));
        },

        updateAvailableCapacity: function () {
            if (this.capacity_bar) {
                this.capacity_bar.setValue(this.controller.getAvailableCapacity());
            }
        },

        getFindRatesButton: function () {
            return this.getComponent('btn_find_rates');
        },

        toggleFindRatesButton: function (enabled) {
            var btn_find_rates = this.getFindRatesButton();

            btn_find_rates.setState(!enabled);
            btn_find_rates.disable(!enabled);
        },

        updateEstimatedPrice: function (spinner) {
            var $text = this.$el.find('.active .estimated_price .text'),
				$gold_icon = this.$el.find('.active .estimated_price .icon.gold'),
                pagenr = this.getActiveTabNr(),
                price = 0,
                resource = '';

            if (spinner) {
                resource = spinner.data('type');
                price = this.controller.getEstimatedPrice(spinner.getValue(), resource);

                this.controller.setCurrentOrderResource(resource, spinner.getValue());
                this.controller.setCurrentOrderGold(price);
            }

            if (price === 0) {
				$text.text(this.l10n.enter_desired_amount);
				$gold_icon.hide();
            } else {
				$text.text(this.l10n.estimated_price(price, pagenr));
				$gold_icon.show();
			}
        },

        updateMaxCapacity: function () {
            if (this.capacity_bar) {
                this.capacity_bar.setMax(this.controller.getMaxCapacity());
            }
        },

        enableSpinners: function () {
            var components = this.controller.getComponents(this.sub_context_spinner);
            for (var component in components) {
                if (components.hasOwnProperty(component)) {
                    components[component].enable();
                }
            }
        },

        disableSpinners: function (spinner) {
            var components = this.controller.getComponents(this.sub_context_spinner);
            for (var component in components) {
                if (!components.hasOwnProperty(component)) {
                    continue;
                }

                if (components[component] !== spinner) {
                    components[component].disable();
                }
            }
        },

        getResourceSpinnerMaxBuy: function (resource) {
            var thresholds = {
                    trade: this.controller.getAvailableCapacity(),
                    stock: this.controller.getAvailableResourcesForTrade(resource),
                    storage: this.controller.getStorageCapacity()
                };

            return this.getMinimumThreshold(thresholds);
        },

        getResourceSpinnerMaxSell: function (resource) {
            var trade_resources = this.controller.getAvailableResourcesForTrade(resource),
                free_trade_resources = this.controller.getMaxResourcesForTrade(resource) - trade_resources,
                thresholds = {
                    trade: this.controller.getAvailableCapacity(),
                    resources: this.controller.getAvailableResourcesInTown(resource),
                    capacity: free_trade_resources
                };

            return this.getMinimumThreshold(thresholds);
        },

        getMinimumThreshold: function (thresholds) {
            var minimum = '';

            for (var item in thresholds) {
                if (!thresholds.hasOwnProperty(item)) {
                    continue;
                }

                if (!minimum || thresholds[minimum] > thresholds[item]) {
                    minimum = item;
                }
            }

            return {
                type: minimum, 
                value: thresholds[minimum]
            };
        },
        
        getActiveTabNr: function () {
            return this.active_tab ? this.active_tab.getActiveTabNr() : 0;
        },

        updateFindBestRatesButtonTooltip: function (threshold_type) {
            var btn_find_rates = this.getFindRatesButton(),
                order_type = this.controller.getCurrentOrderType(),
                l10n = this.l10n.tooltips.find_best_rates_button;
            
            if (threshold_type) {
                btn_find_rates.setTooltip(l10n[order_type][threshold_type]);
            } else {
                btn_find_rates.setTooltip(l10n.enabled);
            }
        }
    });
});
