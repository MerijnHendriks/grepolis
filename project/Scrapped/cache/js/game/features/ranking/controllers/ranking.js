/* global DM */
/**
 * This controller class is used to manipulate a generic ranking which can be used in more
 * places. The settings should be set by the parent controller, since they can be
 * different for every ranking (ranking headers, rows, number of rows per page).
 */
define('features/ranking/controllers/ranking', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var View = require('features/ranking/views/ranking');
    var GameEvents = require('data/events');

    return GameControllers.BaseController.extend({

        initialize: function (options) {
            GameControllers.BaseController.prototype.initialize.apply(this, arguments);
            var settings = {
                el_selector: null, // html node element
                should_have_game_border: true, // boolean
                main_css_class: 'brown_header_light', // string
                ranking_data: null, // object
                ranking_header_row: null, // array
                column_rows: null, // array
                rows_per_page: 10, // int
                page_number: 0, // int
                total_rows: 0, // int
                my_rank_page: null, // function
                switch_page: null, // function
                search_page: null, // function
                completation_type: false // String/default stays boolean
            };
            this.settings = us.extend({}, settings, options.settings);
            this.cm_context = {
                main: this.cm_context.main,
                sub: 'ranking'
            };
            this.templates = us.extend({}, this.getTemplates(), DM.getTemplate('ranking'));
            this.setActivePage(this.settings.page_number);
            this.renderPage();
        },

        renderPage: function () {
            this.initializeView();
        },

        initializeView: function () {
            if (this.settings.el_selector === null) {
                throw 'Please set an element selector in the parent controller';
            }
            this.$el = this.parent_controller.$el.find(this.settings.el_selector);

            this.view = new View({
                controller: this,
                el: this.$el
            });

            this.registerEventListeners();
        },

        registerEventListeners: function () {
            this.stopObservingEvent(GameEvents.town.town_switch);
            this.observeEvent(GameEvents.town.town_switch, function () {
                this.renderPage();
            }.bind(this));
        },

        getViewSettings: function () {
            return this.settings;
        },

        getHeaderColumns: function () {
            if (this.settings.ranking_header_row === null) {
                throw 'Please set the ranking_header_row setting';
            }
            return this.settings.ranking_header_row;
        },

        getColumnRows: function () {
            if (this.settings.column_rows === null) {
                throw 'Please set the column_rows setting';
            }
            return this.settings.column_rows;
        },

        setColumnRows: function (value) {
            this.settings.column_rows = value;
        },

        getActivePage: function () {
            return this.active_page_nr;
        },

        setActivePage: function (value) {
            this.active_page_nr = value;
            if (this.view) {
                this.view.setActivePage(value);
            }
        },

        getRowsPerPage: function () {
            return this.settings.rows_per_page;
        },

        getTotalRows: function () {
            return this.settings.total_rows;
        },

        getHighlightId: function () {
            return this.settings.highlight_id;
        },

        getSearchBoxCompletationType: function () {
            if (this.settings.completation_type === null) {
                throw 'Please set completation_type setting';
            }
            return this.settings.completation_type;
        },

        getStyleClasses: function(data) {
            var classes = ' ';
            classes += (this.getHighlightId() === data.row_id) ? 'highlight' : '';
            classes += (data.highlight_row) ? ' row_highlight' : '';
            return classes;
        },

        renderNewPage: function (page_nr, column_rows) {
            this.setColumnRows(column_rows);
            this.setActivePage(page_nr);
        },

        myRankPage: function () {
            if (typeof this.settings.my_rank_page === 'function') {
                this.settings.my_rank_page(this.renderNewPage.bind(this));
            }
        },

        searchPage: function (value) {
            if (typeof this.settings.search_page === 'function') {
                this.settings.search_page(value,  function(page_nr, column_rows, search_id) {
                    this.renderNewPage(page_nr, column_rows);
                    this.view.addSearchHighlight(search_id);
                }.bind(this));
            }
        },

        switchPage: function (page_nr) {
            if (typeof this.settings.switch_page === 'function') {
                var start_point = page_nr * this.getRowsPerPage(),
                    end_point = start_point + this.getRowsPerPage();
                this.settings.switch_page(page_nr, start_point, end_point, null, this.renderNewPage.bind(this));
            }
        }
    });
});