/* global GoToPageWindowFactory */
/**
 * This view class is used to create a generic ranking which can be used by more windows.
 * It creates a ranking table depending on the data it gets from the controller and
 * registered the needed components.
 */
define('features/ranking/views/ranking', function () {
    'use strict';

    var View = window.GameViews.BaseView;

    var MainRankingView = View.extend({

        initialize: function () {
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.settings = this.controller.getViewSettings();
            this.render();
        },

        render: function () {
            var options = {
                l10n: this.l10n
            };

            us.extend(options, this.settings);

            this.renderTemplate(this.$el, 'main_ranking', options);
            this.renderHeader();
            this.renderList();
            this.registerComponents();
        },

        renderHeader: function () {
            var header_columns = this.controller.getHeaderColumns(),
                data_headers = [],
                $table_header = this.$el.find('.main_ranking table thead');
            header_columns.forEach(function (column) {
                if (this.l10n.ranking[column]) {
                    data_headers.push(this.l10n.ranking[column]);
                } else {
                    throw 'Column name not defined in the translation file';
                }
            }.bind(this));
            this.renderTemplate($table_header, 'main_ranking_header_row', {
                data_headers: data_headers
            });
        },

        renderList: function () {
            var $list = this.$el.find('.main_ranking table tbody'),
                frag = document.createDocumentFragment(),
                column_rows = this.controller.getColumnRows();

            if (column_rows.length === 0) {
                var header_columns = this.controller.getHeaderColumns();
                var $row = this.getTemplate('main_ranking_no_result', {
                    header_columns_amount: header_columns.length,
                    no_result_l10n: this.l10n.ranking.no_result
                });
                frag.appendChild($($row)[0]);
                $list.html(frag);
                return;
            }

			column_rows.forEach(function (row_data) {
				var row = this.getTemplate('main_ranking_column', {
						column_data: row_data,
						column_css_class: this.controller.getStyleClasses(row_data)
					}),
					$row = $(row);

				if (row_data.highlight_row && row_data.last_stand_started_on) { //please move this to domination ranking
                    this.registerRowHighlightTooltip($row, row_data.last_stand_started_on);
                }
				frag.appendChild($row[0]);
			}.bind(this));
			$list.html(frag);
        },

        registerComponents: function () {
            this.registerPager();
            this.registerJumpToMyRankButton();
            this.registerSearchTextBox();
            this.registerSearchButton();
        },

        setActivePage: function(page_nr) {
            var pager = this.getComponent('main_ranking_pagination');
            if (page_nr === -1) {
                pager.unsetActivePagener();
                this.renderList();
            } else if (pager.getActivePage() !== page_nr) {
                pager.setActivePage(page_nr);
            } else {
                this.renderList();
            }
        },

        registerPager: function () {
            this.unregisterComponent('main_ranking_pagination');
            this.registerComponent('main_ranking_pagination', this.$el.find('.main_ranking_pgr').pager({
                activepagenr: this.controller.getActivePage(),
                per_page: this.controller.getRowsPerPage(),
                total_rows: this.controller.getTotalRows()
            }).on('pgr:page:switch', function (e, page_nr) {
                this.controller.switchPage(page_nr);
            }.bind(this)).on('pgr:page:select', function (e, _pager, activepagenr, number_of_pages) {
                this.controller.setActivePage(activepagenr + 1);
                GoToPageWindowFactory.openPagerGoToPageWindow(_pager, activepagenr + 1, number_of_pages);
            }.bind(this)));
        },

        registerJumpToMyRankButton: function () {
            var $jump_btn = this.$el.find('.jump_to_my_rank');
            this.unregisterComponent('main_ranking_jump_to_my_rank');
            this.registerComponent('main_ranking_jump_to_my_rank', $jump_btn.button(
                {
                    caption: this.l10n.ranking.jump_to_my_rank,
                    tooltips: [{title: this.l10n.ranking.jump_to_my_rank_tooltip}]
                }
            ).on('btn:click', function () {
                this.controller.myRankPage();
            }.bind(this)));

            if (this.settings.my_rank_page === null) {
                $jump_btn.hide();
            } else {
                $jump_btn.show();
            }
        },

        registerSearchTextBox: function() {
            var completation_type = this.controller.getSearchBoxCompletationType();
            this.unregisterComponent('main_ranking_search_textbox');
            this.registerComponent('main_ranking_search_textbox', this.$el.find('.main_ranking_search_textbox').textbox({
                autocompletion: completation_type !== false,
                autocompletion_type: completation_type,
                placeholder: this.l10n.ranking.search_placeholder
            }));
        },

        registerSearchButton : function() {
            this.unregisterComponent('main_ranking_search_btn');
            this.registerComponent('main_ranking_search_btn', this.$el.find('.main_ranking_search_btn').button(
                {
                    caption : this.l10n.ranking.search,
                    tooltips: [{title: this.l10n.ranking.search_tooltip}]
                }
            ).on('btn:click', function() {
                this.controller.searchPage(this.getComponent('main_ranking_search_textbox').getValue());
            }.bind(this)));
        },

        registerRowHighlightTooltip : function($row, last_stand_started_on) {
            $row.tooltip(this.l10n.ranking.row_highlight(last_stand_started_on));
        },

        addSearchHighlight : function(search_id) {
            this.$el.find('tr[data-row-id =' + search_id + ']').addClass('search_highlight');
        }
    });

    return MainRankingView;
});
