/* global HumanMessage, ConfirmationWindowFactory, w, TooltipFactory, GameDataUnits, DateHelper, DM, s, ngettext,
GPWindowMgr, GameDataConstructionQueue, GameData, LocalStore, GameEvents, Timestamp, us, ITowns, Slider,
ImageCountdown, Game */

(function () {
    'use strict';

    var TRANSPORT_SHIP_BULLET = 'transport_ship_bullet';

    var UnitOrder = {
        unit_id: '',
        slider: null,
        units: null,
        orders: null,
        barracks: false,
        firstOrderCompletedAt: null,
        unitTimeoutHandle: null,
        imageCountdown: null,
        selected_unit_id: null,

        finish_for_gold_dialog_text: null,
        text_finish_for_gold_popup: null,
        wnd: null,
        availableGold: 0,
        finishGoldOrderCost: 0,
        finish_for_gold_enabled: false,

        notEnoughGoldWindow: null,

        order_queue_template: null,

        init: function (units, orders, barracks, selected_unit_id, finishGoldOrderCost, availableGold, finish_for_gold_enabled) {
            var _self = this;

            this.$el = $('.js-barracks-docks');

            this.units = units;
            this.orders = orders;
            this.barracks = barracks;
            this.finishGoldOrderCost = finishGoldOrderCost;
            this.availableGold = availableGold || 0;
            this.finish_for_gold_enabled = finish_for_gold_enabled;
            this.initSlider();
            this.selected_unit_id = selected_unit_id;
            this.selectUnit(selected_unit_id);
            this.initializeOrderQueueTemplate();
            this.updateOrders();
            this.initializePopups();

            this.$el.find('#unit_order_info #unit_order_input').keydown(function (e) {
                if (e.keyCode === 13) {
                    var wnd_id = parseInt($(this).data('wnd_id'), 10),
                        wnd = GPWindowMgr.getWindowById(wnd_id);

                    _self.build(wnd);
                }
            });
        },

        initializePopups: function () {
            if (this.barracks) {
                this.finish_for_gold_dialog_text = s(ngettext('Are you sure you want to cut the recruitment time in half for %1 gold?', 'Are you sure you want to cut the recruitment time in half for %1 gold?', this.finishGoldOrderCost), this.finishGoldOrderCost);
            } else {
                this.finish_for_gold_dialog_text = s(ngettext('Are you sure you want to cut the construction time in half for %1 gold?', 'Are you sure you want to cut the construction time in half for %1 gold?', this.finishGoldOrderCost), this.finishGoldOrderCost);
            }

            this.text_finish_for_gold_popup = '<span class="bold">';
            if (this.barracks) {
                this.text_finish_for_gold_popup += s(ngettext('You can cut the recruitment time in half for %1 gold.', 'You can cut the recruitment time in half for %1 gold.', this.finishGoldOrderCost), this.finishGoldOrderCost);
            } else {
                this.text_finish_for_gold_popup += s(ngettext('You can cut the construction time in half for %1 gold.', 'You can cut the construction time in half for %1 gold.', this.finishGoldOrderCost), this.finishGoldOrderCost);
            }
            this.text_finish_for_gold_popup += '<br /><br />';
            this.text_finish_for_gold_popup += s(ngettext('Available gold: %1', 'Available gold: %1', this.availableGold), this.availableGold);

            if (this.orders !== null) {
                this.$el.find('#current_building_order_queue_count').text(this.orders.length);
                this.$el.find('#unit_orders_queue .js-order-queue-count').text(this.orders.length);
                this.$el.find('#unit_orders_queue .js-max-order-queue-count').text(GameDataConstructionQueue.getUnitOrdersQueueLength());
            }
            this.$el.find('img.wood').tooltip(_('Wood'));
            this.$el.find('img.stone').tooltip(_('Stone'));
            this.$el.find('img.iron').tooltip(_('Silver coins'));
            this.$el.find('img.favor').tooltip(_('Favor'));
            this.$el.find('img.population').tooltip(_('Population'));
            this.$el.find('img.buildtime').tooltip(this.barracks ? _('Recruitment time') : _('Construction time'));

            // Attach unit popups
            $.each(GameData.units, function (unit) {
                this.$el.find('.unit.' + unit).setPopup(unit + '_details');
            }.bind(this));

            this.$el.find('a.unit_order_tasks_finish').tooltip(this.text_finish_for_gold_popup);
        },

        initializeOrderQueueTemplate: function () {
            if (!this.order_queue_template) {
                if ($("#orders_tmpl").length > 0) {
                    this.order_queue_template = $("#orders_tmpl").html().replace(/<!\[CDATA\[/, "").replace(/\]\]>/, "");
                }
            }
        },

        /**
         * get the window id from a button, the button must be supercharged with the data(wnd_id)
         * by wndhandler_buildings
         * -> side effect : sets this.wnd
         */
        getWindowIdFromButton: function (button) {
            var $button = $(button),
                wnd_id = parseInt($button.data("wnd_id"), 10),
                wnd = GPWindowMgr.getWindowById(wnd_id);

            this.wnd = wnd;
            return wnd;
        },

        handleEvents: function (event) {
            var unit_id;

            if (event.type === GameEvents.town.units.change) {
                var units = ITowns.getTown(Game.townId).units();
                var unitsOuter = ITowns.getTown(Game.townId).unitsOuter();

                for (unit_id in units) {

                    if (!units.hasOwnProperty(unit_id)) {
                        continue;
                    }

                    this.$el.find('#unit_order_count_' + unit_id).html(units[unit_id]);
                    this.$el.find('#unit_order_count_shadow_' + unit_id).html(units[unit_id]);

                    this.$el.find('#unit_order_tab_' + unit_id + ' .unit_order_total').html(unitsOuter[unit_id] + units[unit_id]);
                }
            }
        },

        saveState: function () {
            var state = null;
            if (this.$el) {
                state = {
                    selected_unit: this.$el.find('.unit_active').parent().attr('id'),
                    selected_amount: parseInt(this.$el.find('#unit_order_input').val(), 10)
                };
            }
            LocalStore.set('barracks:saved_state', state);
        },

        loadState: function () {
            LocalStore.get('barracks:saved_state', function (success, state) {
                // only select units and restore values if we have them and the view has sliders and checkboxes
                // (e.g. avoid the 'no habor' view, which does not have it)
                if (success && state && UnitOrder.slider.length > 0) {
                    this.selectUnit(state.selected_unit);
                    UnitOrder.slider.setValue(state.selected_amount);
                }
            }.bind(this));
        },

        clearState: function () {
            LocalStore.del('barracks:saved_state');
        },

        selectUnit: function (unit_id) {
            if (unit_id && UnitOrder.units[unit_id]) {
                this.unit_id = unit_id;
                var unit = UnitOrder.units[unit_id];
                this.showUnit(unit);
                this.$el.find('.unit_active').removeClass('unit_active');
                this.$el.find('#unit_order_tab_' + unit_id).addClass('unit_active');
            }
        },

        changeCount: function (count) {
            count = parseInt(count, 10);
            if (isNaN(count)) {
                return;
            }
            var unit = UnitOrder.units[this.unit_id];
            this.showCosts(unit, count);

            this.$el.find('#unit_order_info #unit_order_confirm').css('visibility', count ? '' : 'hidden');
        },

        initSlider: function () {
            var element_slider = this.$el.find('#unit_order_info #unit_order_slider');
            this.slider = new Slider({
                elementMin: this.$el.find('#unit_order_info #unit_order_min'),
                elementMax: this.$el.find('#unit_order_info #unit_order_max'),
                elementDown: this.$el.find('#unit_order_info #unit_order_down'),
                elementUp: this.$el.find('#unit_order_info #unit_order_up'),
                elementInput: this.$el.find('#unit_order_info #unit_order_input'),
                elementSlider: element_slider
            });

            element_slider.bind('change', function () {
                UnitOrder.changeCount(UnitOrder.slider.getValue());
            });
        },

        showUnit: function (unit) {
            var $unit_order_info = this.$el.find('#unit_order_info');
            $unit_order_info.find('#unit_order_unit_name').get(0).className = unit.id;
            $unit_order_info.find('#unit_order_unit_name').text(unit.name);
            $unit_order_info.find('#unit_order_unit_hidden')[0].value = unit.id;

            try {
                // not good solution, but this seemed to produce errors in IE,
                // in case dependencies are not fullfilled
                this.slider.setMax(unit.max_build);
                this.slider.setValue(unit.max_build);
            } catch (e) {
            }
            var dependencies = $unit_order_info.find('#unit_order_dependencies');
            if ($(unit.missing_building_dependencies).length || $(unit.missing_research_dependencies).length) {
                dependencies.show();
                var research_text = '';
                var building_text = '';
                var separator_text = '';
                if (unit.missing_building_dependencies) {
                    var i = 0;
                    jQuery.each(unit.missing_building_dependencies, function (name, level) {
                        building_text += (i++ > 0 ? ', ' : '') + name + ': ' + level;
                    });
                }
                if (unit.missing_research_dependencies.length) {
                    research_text = _('Research:') + ' ' + unit.missing_research_dependencies.join(', ');
                }

                $unit_order_info.find('.btn_required_building').toggle(building_text.length > 0);
                $unit_order_info.find('.btn_required_research').toggle(research_text.length > 0);

                if (building_text.length > 0 && research_text.length > 0) {
                    separator_text = '; ';
                }
                $unit_order_info.find('#unit_order_dependencies .requirements_info').text(
                    _('Required:') + '\n' + building_text + separator_text + research_text
                );
            }
            else {
                dependencies.hide();
            }

            // Unit image
            $unit_order_info.find('#unit_order_unit_big_image').removeClass().addClass('thin_frame unit_icon90x90 ' + unit.id);
            $unit_order_info.find('#unit_order_unit_big_image').setPopup(unit.id + '_details');
            /*$('#unit_order_unit_big_image')[0].className = '';
             $('#unit_order_unit_big_image').addClass(unit.id +'_details');*/

            // Unit costs for one unit
            $unit_order_info.find('#unit_order_unit_wood').text(unit.resources.wood);
            $unit_order_info.find('#unit_order_unit_stone').text(unit.resources.stone);
            $unit_order_info.find('#unit_order_unit_iron').text(unit.resources.iron);
            $unit_order_info.find('#unit_order_unit_favor').text(unit.favor);
            $unit_order_info.find('#unit_order_unit_pop').text(unit.population);
            $unit_order_info.find('#unit_order_unit_build_time').text(DateHelper.readableSeconds(unit.build_time));

            // Unit info
            $unit_order_info.find('#unit_order_att').attr('class', 'unit_order_att_' + unit.attack_type);
            $unit_order_info.find('#unit_order_unit_attack').text(unit.attack);
            $unit_order_info.find('#unit_order_unit_speed').text(unit.speed);
            if (unit.attack_type !== undefined) {
                $unit_order_info.find('#unit_order_att').setPopup('unit_type_' + unit.attack_type);
            }

            // Naval
            $unit_order_info.find('#unit_order_unit_transport').text(unit.capacity);
            $unit_order_info.find('#unit_order_unit_defense').text(unit.defense);

            // Ground
            $unit_order_info.find('#unit_order_unit_booty').text(unit.booty);
            $unit_order_info.find('#unit_order_unit_def_hack').text(unit.def_hack);
            $unit_order_info.find('#unit_order_unit_def_pierce').text(unit.def_pierce);
            $unit_order_info.find('#unit_order_unit_def_distance').text(unit.def_distance);

            this.showUnitInfoIcons($unit_order_info.find('.unit_info_icons'), unit);
        },

        showCosts: function (unit, count) {
            var res_id;
            for (res_id in unit.resources) {
                if (unit.resources.hasOwnProperty(res_id)) {
                    var value = unit.resources[res_id] * count;
                    this.$el.find('#unit_order_info #unit_order_all_' + res_id).text(Math.ceil(value));
                }
            }
            this.$el.find('#unit_order_info #unit_order_all_pop').text(unit.population * count);
            this.$el.find('#unit_order_info #unit_order_all_favor').text(unit.favor * count);
            this.$el.find('#unit_order_info #unit_order_all_build_time').text(DateHelper.readableSeconds(unit.build_time * count));
        },

        showUnitInfoIcons: function ($el, unit) {
            var css_classes = GameDataUnits.getCombinedIconCssClasses(unit.id),
                l10n = DM.getl10n('unit_info');

            $el.empty();
            css_classes.forEach(function (css_class) {
                $el.append('<span class="unit_info22x22 ' + css_class + '">');

                var tt = l10n.tooltips[css_class];
                if (tt) {
                    var html = '<h4>' + tt.headline + '</h4><ul style="list-style: disc; margin: 0 20px;">';
                    tt.bullets.forEach(function(bullet){
                        html +=  '<li>' + bullet + '</li>';
                    });
                    if (!GameDataUnits.isFlyingUnit(unit.id) && tt.hasOwnProperty(TRANSPORT_SHIP_BULLET)) {
                        html +=  '<li>' + tt.transport_ship_bullet + '</li>';
                    }
                    html += '</ul>';
                    $el.find('.' + css_class).tooltip(html);
                }
            });
        },

        updateCounts: function (units) {
            var i;
            for (i in units) {
                if (units.hasOwnProperty(i)) {
                    var unit = units[i];
                    this.$el.find('#unit_order_max_build_' + unit.id).html('+' + unit.max_build);
                    this.$el.find('#unit_order_count_' + unit.id).html(unit.count);
                    this.$el.find('#unit_order_count_shadow_' + unit.id).html(unit.count);
                }
            }
        },

        updateOrders: function () {
            // Update orders
            if (UnitOrder.order_queue_template) {
                var rendered_template = us.template(UnitOrder.order_queue_template, {
                    orders: UnitOrder.orders,
                    barracks: UnitOrder.barracks,
                    finish_for_gold_enabled: UnitOrder.finish_for_gold_enabled
                });
                this.$el.find('#tasks').html(rendered_template);
            }
            var order, i, unit_orders = UnitOrder.orders;

            for (i in unit_orders) {
                if (unit_orders.hasOwnProperty(i)) {
                    order = unit_orders[i];

                    this.$el.find('#unit_order_' + i + ' .unit_icon50x50').tooltip(s(GameData.units[order.unit_id].name, order.completed_human));
                    this.$el.find('#unit_order_' + i + ' div.unit_order_task_time').tooltip(s(_('Completion %1'), order.completed_human));

                    // Display refund resources (TODO: maybe we should format resources on server or find more general solution? )
                    if (order.refund) {
                        var content = TooltipFactory.getRefundTooltip(order.refund);
                        this.$el.find('#unit_order_' + i + ' a.unit_order_cancel').tooltip(content);
                    }
                }
            }

            // Start countdown for first order
            var unit_order_current = this.$el.find('#unit_order_0 div.unit_order_task_time');
            if (unit_order_current.length > 0 && this.orders[0].units_left > 0) {

                this.startImageCountdown();

                // Start countdown for order and
                unit_order_current.countdown(this.orders[0].to_be_completed_at, {});
                // bind event so reload orders on finish is done
                unit_order_current.bind('finish', function () {
                    UnitOrder.finishHandler(w(this));
                });

                //set up interval timer for units left counter
                var build_time = Math.floor((this.orders[0].to_be_completed_at - this.orders[0].created_at) / this.orders[0].count);
                UnitOrder.finishedHandlerUnit(false, build_time);
            }

            if (this.orders !== null) {
                this.$el.find('#current_building_order_queue_count').text(this.orders.length);
                this.$el.find('#unit_orders_queue .js-order-queue-count').text(this.orders.length);
            }
        },

        /**
         * keep track of single units finished building for updating counters
         */
        finishedHandlerUnit: function (self_called, build_time) {
            var unit_order_current;
            var order;
            var end_time_unit;
            //var elem;

            if (self_called) {
                unit_order_current = $('#unit_order_0 div.unit_order_task_time');
                if (unit_order_current.length > 0 && this.orders[0].units_left > 0) {
                    order = this.orders[0];

                    order.units_left--;
                    order.seconds_left -= build_time;

                    $('#unit_order_0 div.unit_order_task_value').html(this.orders[0].units_left);

                    this.redrawCancelRefund(order, $('#unit_order_0 a.unit_order_cancel'));

                    if (order.units_left > 0) {
                        this.startImageCountdown();
                    } else {
                        this.orders.shift();
                        return;
                    }
                } else {
                    this.orders.shift();

                    if (this.unitTimeoutHandle !== null) {
                        window.clearTimeout(this.unitTimeoutHandle);
                    }
                }
            } else {
                if (this.unitTimeoutHandle !== null) {
                    window.clearTimeout(this.unitTimeoutHandle);
                }
            }

            if (this.orders[0]) {
                //set timeout according to seconds left for current unit to finish
                end_time_unit = this.orders[0].to_be_completed_at - ((this.orders[0].units_left - 1) * build_time) - Timestamp.now();
                this.unitTimeoutHandle = window.setTimeout(function () {
                    UnitOrder.finishedHandlerUnit(true, build_time);
                }, end_time_unit * 1000);
            }
        },

        startImageCountdown: function () {
            var unit_order_current;
            var completed_at;
            var units_left;
            var start_time_unit;
            var end_time_units;
            var build_time;
            var unit_order_spendable;

            unit_order_current = this.$el.find('#unit_order_0 div.unit_order_task_time');
            if (unit_order_current.length > 0 && this.orders[0].units_left > 0) {

                completed_at = this.orders[0].to_be_completed_at;
                units_left = this.orders[0].units_left;
                build_time = Math.round((completed_at - this.orders[0].created_at) / this.orders[0].count);

                start_time_unit = completed_at - (units_left * build_time);
                end_time_units = completed_at - ((units_left - 1) * build_time);

                unit_order_spendable = this.$el.find('#unit_order_0 div.unit_order_spendable').length > 0;

                this.imageCountdown = new ImageCountdown(unit_order_current, start_time_unit, end_time_units, {
                    'width': '50px',
                    'height': '50px',
                    'top': 22,
                    'left': (unit_order_spendable) ? 6 : 21
                }, {'width': '50px', 'height': '3200px'});
            }
        },

        /**
         * This handler is called when countdown for one unit order finishes
         */
        finishHandler: function (wnd) {
            wnd.requestContentGet(GameData.buildings[this.barracks ? 'barracks' : 'docks'].controller, 'load', {});
        },

        action: function (action, id, button) {
            var wnd = this.getWindowIdFromButton(button),
                callback = function () {
                    wnd.requestContentPost(GameData.buildings[this.barracks ? 'barracks' : 'docks'].controller, action, {id: id}, function () {
                        if (action === 'cancel') {
                            $.Observer(GameEvents.command.cancel).publish({unit_id: id});
                        }
                    });
                }.bind(this);

            if (action === 'cancel') {
                ConfirmationWindowFactory.openConfirmationUnitOrderCancel(callback);
            }
            else {
                //I don't know what else than 'cancel' is handled here...
                callback();
            }
        },

        build: function (wnd) {
            var unit_id = this.$el.find('#unit_order_info #unit_order_unit_hidden')[0].value,
                amount = parseInt(this.$el.find('#unit_order_info #unit_order_input')[0].value, 10),
                params = {unit_id: unit_id, amount: amount};

            //There were lots of errors in exception.log about invalid unit count
            //of 0. It should be outputted an error when a player is trying to build 0 units
            if (isNaN(amount) || amount <= 0) {
                HumanMessage.error(_('Invalid number of units'));
                return;
            }
            //TODO: Validate type of unit_id

            wnd.requestContentPost(GameData.buildings[this.barracks ? 'barracks' : 'docks'].controller, 'build', params, function () {
                $.Observer(GameEvents.command.build_unit).publish({unit_id: unit_id});
            });
        },

        /**
         * Toggle visisbility of units
         */
        toggleUnits: function () {
            var unit_order_show = this.$el.find('#unit_order_show');
            if (unit_order_show.hasClass('unit_order_hide')) {
                unit_order_show.tooltip('<h4>' + _('Show all units') + '</h4>');
                this.$el.find('div.unavailable').fadeOut();
            } else {
                unit_order_show.tooltip('<h4>' + _('Only show researched units.') + '</h4>');
                this.$el.find('div.unavailable').fadeIn();
            }
            unit_order_show.toggleClass('unit_order_hide');
        },

        redrawCancelRefund: function (order, jQTarget) {
            if (order.refund) {
                var r = $.extend(true, {}, GameData.units[order.unit_id]); // deep copy  ref: http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object

                order.refund.favor = Math.floor(r.favor * order.units_left * GameData.unit_order_refund_factor);
                order.refund.wood = Math.floor(r.resources.wood * order.units_left * GameData.unit_order_refund_factor);
                order.refund.stone = Math.floor(r.resources.stone * order.units_left * GameData.unit_order_refund_factor);
                order.refund.iron = Math.floor(r.resources.iron * order.units_left * GameData.unit_order_refund_factor);

                r = order.refund;

                var content = TooltipFactory.getRefundTooltip(r);
                jQTarget.tooltip(content);
            }
        },

        /**
         * @deprecated
         */
        confirm_finish_for_gold: function (order_id, button, unit_type) {
            var disabled = 'disabled',
                confirm, that = this;

            button = $(button);
            this.getWindowIdFromButton(button);

            var btn = {
                enable: function () {
                    button.removeClass(disabled);
                },
                disable: function () {
                    button.addClass(disabled);
                }
            };

            confirm = function () {
                that.finishForGold(order_id, unit_type);
            };

            window.BuyForGoldWindowFactory.openReductUnitBuildTimeForGoldWindow(
                btn,
                {
                    building_type: this.barracks ? 'barracks' : 'docks',
                    order: {
                        unit_id: unit_type,
                        order_id: order_id
                    }
                },
                confirm
            );

        },

        /**
         * @deprecated
         */
        showNotEnoughGoldWindow: function (button, order_id) {
            order_id = parseInt(order_id, 10);
            button = $(button);

            var orders = UnitOrder.orders,
                order,
                disabled = 'disabled';

            for (var i in orders) {
                if (orders[i].id === order_id) {
                    order = orders[i];
                }
            }

            var btn = {
                enable: function () {
                    button.removeClass(disabled);
                },
                disable: function () {
                    button.addClass(disabled);
                }
            };

            window.BuyForGoldWindowFactory.openReductUnitBuildTimeForGoldWindow(btn, order, function () {
                order.buildTimeReduct();
            });
        },

        /**
         * @deprecated
         */
        finishForGold: function (order_id, unit_type) {
            var place_name = this.barracks ? 'barracks' : 'docks';

            this.wnd.requestContentPost(GameData.buildings[place_name].controller, 'finish_for_gold', {order_id: order_id}, function () {
                $.Observer(GameEvents.premium.build_time_reduction).publish({
                    type: 'unit',
                    id: unit_type,
                    place_name: place_name
                });
            });
        },

        /**
         * @deprecated
         */
        goldChanged: function (new_gold) {
            UnitOrder.init(UnitOrder.units, UnitOrder.orders, UnitOrder.barracks, UnitOrder.selected_unit_id, UnitOrder.finishGoldOrderCost, new_gold, UnitOrder.finish_for_gold_enabled);
        }
    };

    window.UnitOrder = UnitOrder;

}());
