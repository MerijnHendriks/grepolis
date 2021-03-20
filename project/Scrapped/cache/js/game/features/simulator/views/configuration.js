/* globals DM, isNumber */
define('features/simulator/views/configuration', function() {
    'use strict';
    
    var GameViews = require_legacy('GameViews'),
        GameData = require_legacy('GameData'),
        GameDataPowers = require_legacy('GameDataPowers'),
        TooltipFactory = require_legacy('TooltipFactory'),
        Categories = require('features/simulator/enums/categories'),
        GameDataConfig = require('data/game_config'),
        ATTACKER = 'attacker',
        DEFENDER= 'defender';

    return GameViews.BaseView.extend({
        initialize: function (options) {
            GameViews.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.l10n_extra = DM.getl10n('COMMON', 'simulator');
            this.configuration_options = {};
            this.render();
        },


        registerConfigurationWindowCloseButton: function() {
            var $button = $('<div class="btn_close"></div>');

            this.$el.append($button);

            this.unregisterComponent('close_button');
            this.registerComponent('close_button', $button.button({
                template: 'none'
            }).on('btn:click', this.controller.handleCloseButtonClick.bind(this.controller)));
        },

        registerScroll: function (name, $parent) {
            var $viewport = $parent.find('.js-scrollbar-viewport'),
                $content = $parent.find('.js-scrollbar-content');
    
            this.unregisterComponent(name);
            return this.registerComponent(name, $viewport.skinableScrollbar({
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                elements_to_scroll: $content,
                element_viewport: $viewport
            }));
        },

        replaceOption: function (side, option, $new_option) {
            var selector = '.' + side + ' tr[data-option="' + option.power_id + '"]';

            if (option.hasOwnProperty('permutation')) {
                selector += '[data-permutation="' + option.permutation + '"]';
            }

            this.$el.find(selector).replaceWith($new_option);
        },

        renderOptionToCategory: function (side, category, option, replace) {
            var option_template,
                $row;

            if (category === Categories.TEMPLES) {
                option_template = this.getOptionTemplateTempleIcon(option, true);
            } else {
                option_template = this.getOptionTemplate(category, option, {show_level: true});
            }

            $row = $(this.getTemplate('row_power', {
                side: side,
                category: category,
                option: option,
                option_template: option_template,
                description: this.getDescription(category, option),
                is_upgradeable: this.controller.isUpgradeable(category, option)
            }));

            if (category !== Categories.TEMPLES) {
                $row.find('.option').tooltip(this.getTooltip(category, option));
            }

            if (replace) {
                this.replaceOption(side, option, $row);
            } else {
                this.controller.addOptionToConfiguration(side, category, option);
                this.$el.find('.' + category + ' .' + side + ' tr:last-child').before($row);
            }

            $row.off().on('click', function (event) {
                var $target = $(event.target);

                if ($target.hasClass('btn_up') && option.level < option.max_level) {
                    this.controller.adjustOptionLevel(side, category, option, option.level + 1);
                } else if ($target.hasClass('btn_down') && option.level > 1) {
                    this.controller.adjustOptionLevel(side, category, option, option.level - 1);
                }
            }.bind(this));

            this.updateAddNewButton(side, category);
            this.scrollbar.update();
        },

        removeOptionFromCategory: function ($button) {
            var $row = $button.parents('tr'),
                side = $row.data('side'),
                power_id = $row.data('option'),
                category = $row.data('category'),
                permutation = $row.data('permutation'),
                option = this.controller.getOption(category, power_id, permutation);

            $row.remove();
            this.controller.removeOptionFromConfiguration(side, category, option);

            this.updateAddNewButton(side, category);
            this.scrollbar.update();
        },

        getTooltip: function (category, option) {
            var result;

            switch (category) {
                case Categories.POWERS:
                case Categories.SPELLS:
                    result = TooltipFactory.createPowerTooltip(option.power_id, {},
                        option.configuration);
                    break;
                case Categories.TECHNOLOGIES:
                    result = TooltipFactory.getResearchTooltip(option.power_id);
                    break;
                case Categories.BUILDINGS:
                    result = GameData.buildings[option.power_id].name;
                    break;
                case Categories.ADVISORS:
                    result = TooltipFactory.getAdvisorTooltip(option.power_id);
                    break;
                case Categories.GAME_BONUSES:
                    result = this.getDescription(category, option);
                    break;
                default:
                    break;
            }

            return result;
        },

        getTempleDescription: function (option) {
            var power_configuration = {};

            for (var id in option.configuration) {
                if (!option.configuration.hasOwnProperty(id)) {
                    continue;
                }

                if (isNumber(option.configuration[id])) {
                    power_configuration[id] = option.configuration[id] * option.level;
                } else {
                    power_configuration[id] = option.configuration[id];
                }
            }

            return GameDataPowers.getTooltipPowerData(
                GameData.powers[option.power_id],
                power_configuration
            ).i_effect;
        },

        getGameBonusDescription: function (power_id) {
            var result = '';

            switch (power_id) {
                case 'strategy_breach':
                    result = GameData.researches.breach.description;
                    break;
                case 'alliance_modifier':
                    result = this.l10n_extra.alliance_modifier(GameDataConfig.getKillpointMultiplierAllianceUnits());
                    break;
                case 'building_tower':
                    result = this.l10n_extra.tower;
                    break;
                case 'is_night':
                    result = this.l10n_extra.night_bonus;
                    break;
                default:
                    break;
            }

            return result;
        },

        getDescription: function (category, option) {
            var result = '';

            switch (category) {
                case Categories.POWERS:
                case Categories.SPELLS:
                    result = GameDataPowers.getTooltipPowerData(
                        GameData.powers[option.power_id],
                        option.configuration,
                        option.level
                    ).i_effect;
                    break;
                case Categories.TEMPLES:
                    result = this.getTempleDescription(option);
                    break;
                case Categories.TECHNOLOGIES:
                    result = GameData.researches[option.power_id].description;
                    break;
                case Categories.BUILDINGS:
                    result = GameData.buildings[option.power_id].description;
                    break;
                case Categories.ADVISORS:
                    if (option.power_id === 'priest') {
                        result = this.l10n_extra.priestess;
                    } else {
                        result = this.l10n_extra[option.power_id];
                    }
                    break;
                case Categories.GAME_BONUSES:
                    result = this.getGameBonusDescription(option.power_id);
                    break;
                default:
                    break;
            }

            return result;
        },

        getOptionTemplateTempleIcon: function (option, show_level) {
            var level = show_level ? '<div class="level">' + option.level + '</div>' : '';
            return '<div class="icon temple_' + option.size + '">' + level + '</div>';
        },

        getOptionTemplateTemple: function (option) {
            var result  = '<div class="option temple ' + option.power_id +
                '" data-id="' + option.power_id +
                '" data-permutation="' + option.permutation +
                '">' +
                this.getOptionTemplateTempleIcon(option) +
                '<div class="description">' + this.getDescription(Categories.TEMPLES, option) + '</div>' +
                '</div>';

            return result;
        },

        getOptionTemplatePower: function (option, settings) {
            var css_class = GameDataPowers.getCssPowerId(option),
                result;

            if (option.is_upgradeable && settings && settings.show_level) {
                result = '<div class="option power_icon45x45 ' + css_class + ' lvl lvl' + option.level + ' ' +
                    '" data-id="' + option.power_id + '"></div>';
            } else {
                result = '<div class="option power_icon45x45 ' + css_class +
                    '" data-id="' + option.power_id + '"></div>';
            }

            return result;
        },

        getOptionTemplate: function (category, option, settings) {
            var result;

            switch (category) {
                case Categories.POWERS:
                case Categories.SPELLS:
                    result = this.getOptionTemplatePower(option, settings);
                    break;
                case Categories.TECHNOLOGIES:
                    result = '<div class="option research_icon research ' + option.power_id + '" data-id="' + option.power_id + '"></div>';
                    break;
                case Categories.BUILDINGS:
                    result = '<div class="option building_icon50x50 ' + option.power_id + '" data-id="' + option.power_id + '"></div>';
                    break;
                case Categories.ADVISORS:
                    result = '<div class="option advisors40x40 ' + option.power_id + '" data-id="' + option.power_id + '"></div>';
                    break;
                case Categories.TEMPLES:
                    result = this.getOptionTemplateTemple(option);
                    break;
                case Categories.GAME_BONUSES:
                    result = '<div class="option place_image ' + option.power_id + '" data-id="' + option.power_id + '"></div>';
                    break;
                default:
                    break;
            }

            return result;
        },

        renderCategoryPopupOptions: function ($popup, side, category) {
            var $list = $popup.find('.options_list .js-scrollbar-content');

            this.controller.getAvailableCategoryOptionsBySide(side, category).forEach(function (option) {
                var $template = $(this.getOptionTemplate(category, option));

                if (category !== Categories.TEMPLES) {
                    $template.tooltip(this.getTooltip(category, option));
                }

                $list.append($template);
            }.bind(this));

            $popup.off().on('click', function (event) {
                var $target = $(event.target),
                    id, permutation, option;

                if ($target.hasClass('btn_close')) {
                    this.closeCategoryPopup();
                } else if ($target.hasClass('option')) {
                    id = $target.data('id');
                } else if ($target.parents('.option').length > 0) {
                    $target = $target.parents('.option');
                    id = $target.data('id');
                    permutation =  $target.data('permutation');
                }

                if (id) {
                    option = this.controller.getOption(category, id, permutation);
                    this.closeCategoryPopup();
                    this.renderOptionToCategory($popup.data('side'), category, option);
                }
            }.bind(this));

            if (category === Categories.TEMPLES) {
                this.registerScroll('popup_scroll', $popup);
            }
        },

        closeCategoryPopup: function () {
            this.$el.find('.configuration_option_popup').remove();
            this.scrollbar.enable();
        },

        openCategoryPopup: function ($button, category) {
            var button_top = $button.position().top,
                popup_top = 0,
                arrow_top, max_arrow_offset,
                side = $button.parents('.side').data('id'),
                $popup;

            this.closeCategoryPopup();
            this.scrollbar.disable();

            $popup = $(this.getTemplate('option_popup', {
                side: side,
                category: category,
                l10n: this.l10n,
                is_category_temples: category === Categories.TEMPLES
            }));

            $popup.appendTo(this.$el.find('.configuration_content'));

            this.renderCategoryPopupOptions($popup, side, category);

            button_top += $button.parents('.category').position().top + this.$content.position().top;
            max_arrow_offset = $popup.height() / 2;

            if (button_top > max_arrow_offset) {
                popup_top = button_top - max_arrow_offset;
            }

            arrow_top = (button_top + $button.outerWidth() / 2) - popup_top;

            $popup.css({
                top: popup_top
            });
            $popup.find('.speechbubble_arrow_l').css({
                top: arrow_top
            });
        },

        renderCategory: function ($el, category) {
            $el.append(this.getTemplate('configuration_category', {
                category: category,
                l10n: this.l10n
            }));

            this.updateAddNewButton(ATTACKER, category);
            this.updateAddNewButton(DEFENDER, category);

            $el.find('.category.' + category).off().on('click', function (event) {
                var $target = $(event.target);

                if ($target.hasClass('btn_add_new') && !$target.hasClass('disabled')) {
                    this.openCategoryPopup($target, category);
                } else if ($target.hasClass('btn_remove')) {
                    this.removeOptionFromCategory($target);
                }
            }.bind(this));
        },

        renderConfigurationSections: function () {
            var $content = this.$el.find('.js-scrollbar-content');

            this.controller.getCategories().forEach(function (category) {
                this.renderCategory($content, category);
            }.bind(this));
        },

        registerConfigurationContentClick: function () {
            this.$el.find('.configuration_content').off().on('click', function (event) {
                var $target = $(event.target);

                if ($target.hasClass('header')) {
                    $target.parents('.configuration_section').toggleClass('closed');
                    this.scrollbar.update();
                }
            }.bind(this));
        },

        updateAddNewButton: function (side, category) {
            this.$el.find('.' + category  + ' .' + side + ' .btn_add_new').toggleClass(
                'disabled',
                !this.controller.hasAvailableCategoryOptions(side, category)
            );
        },

        render: function () {
            var $configuration_content;

            this.renderTemplate(this.$el, 'configuration', {
                l10n: this.l10n
            });

            this.registerConfigurationWindowCloseButton();
            this.renderConfigurationSections();
            this.registerConfigurationContentClick();

            $configuration_content = this.$el.find('.configuration_content');

            this.scrollbar = this.registerScroll('configuration_scroll', $configuration_content);
            this.$content = $configuration_content.find('.js-scrollbar-content');
        }
    });
});