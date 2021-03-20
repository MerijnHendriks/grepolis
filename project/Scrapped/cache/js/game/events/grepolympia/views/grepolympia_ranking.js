/* global DM, GoToPageWindowFactory */
define('events/grepolympia/views/grepolympia_ranking', function() {
	'use strict';

	var View = window.GameViews.BaseView,
		window_ids = require('game/windows/ids'),
		new_pager_registration = false,
		GrepolympiaHelper = require('events/grepolympia/helpers/grepolympia'),
		EventSkins = require('enums/event_skins');

	var GrepolympiaRankingView = View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

            var active_discipline = this.controller.getDiscipline();

			this.l10n = DM.getl10n(window_ids.GREPOLYMPIA);
			this.selected_discipline = GrepolympiaHelper.getActiveOrLastDiscipline(active_discipline);

			this.render();
		},

		render : function() {
			var controller = this.controller;
			this.renderTemplate(this.$el, 'page_ranking', {
				l10n: this.l10n,
				discipline: this.selected_discipline,
				source: controller.getSource()
			});

			this.registerComponents();
			this.fetchList();
		},

		renderList : function() {
			this.$list = this.$el.find('#ranking_list');

			var rows = this.controller.getRows(),
				source = this.controller.getSource(),
				score_unit = this.controller.getScoreUnit();

			score_unit = score_unit === 'm' ? this.l10n.page_ranking.meters : score_unit;

			this.renderTemplate(this.$list, 'ranking_list', {
				l10n : this.l10n,
				model_ranking : this.controller.model_ranking,
				rows : rows,
				source: source,
				score_unit: score_unit
			});
		},

		fetchList : function() {
			var source = this.getComponent('rbtn_player_alliance').getValue(),
				filter = this.getComponent('rbtn_select_discipline').getValue();
			//the fetch will get the data from the backend and refresh the full list view
			this.controller.fetchPage(source, filter, undefined, false, function() {
				this.registerPager();
				this.renderList();
			}.bind(this));
		},

		registerComponents : function() {
			var disciplines = GrepolympiaHelper.getDisciplinesDependingOnSkin();

			this.current_discipline_index = us.indexOf(disciplines, this.controller.getDiscipline());

			this.registerDisciplineRadioButton();
			this.registerSourceRadioButton();
			this.registerSearchTextBox();
			this.registerSearchButton();

		},

		registerDisciplineRadioButton : function() { //GP-23785  move to generic view
			var controller = this.controller,
				disciplines = GrepolympiaHelper.getDisciplinesDependingOnSkin(),
				cloned_disciplines = disciplines.slice(),
				l10n = this.l10n,
				exclusions = this.current_discipline_index > -1 ? cloned_disciplines.splice(this.current_discipline_index + 1, cloned_disciplines.length - 1 - this.current_discipline_index) : [];

			this.unregisterComponent('rbtn_select_discipline');
			//Initialize Discipline radiobutton (future disciplines have to be disabled)
			this.registerComponent('rbtn_select_discipline', this.$el.find('.rbtn_select_discipline').radiobutton({
				value : this.selected_discipline, template : 'tpl_radiobutton_nocaption', options : [
					{value : disciplines[0], tooltip : l10n.page_ranking.rbtn_filter.discipline_1},
					{value : disciplines[1], tooltip : l10n.page_ranking.rbtn_filter.discipline_2},
					{value : disciplines[2], tooltip : l10n.page_ranking.rbtn_filter.discipline_3},
					{value : disciplines[3], tooltip : l10n.page_ranking.rbtn_filter.discipline_4}
				],
				exclusions : exclusions
			}).on('rb:change:value', function(e, value) {
				controller.fetchPage(this.getComponent('rbtn_player_alliance').getValue(), value);
			}.bind(this)));
		},

		registerSourceRadioButton : function() {
			var controller = this.controller,
				disciplines = GrepolympiaHelper.getDisciplinesDependingOnSkin(),
				l10n = this.l10n,
				exclusions = disciplines.splice(this.current_discipline_index + 1, disciplines.length - 1 - this.current_discipline_index);
			this.unregisterComponent('rbtn_player_alliance');
			//Initialize Source radiobutton (Player or Alliance)
			this.registerComponent('rbtn_player_alliance', this.$el.find('.rbtn_player_alliance').radiobutton({
				value : controller.getSource(), template : 'tpl_radiobutton_nocaption', options : [
					{value : 'player', tooltip : l10n.page_ranking.rbtn_source.player},
					{value : 'alliance', tooltip : l10n.page_ranking.rbtn_source.alliance, tooltip_styles : {width : 350}}
				],
				exclusions : exclusions
			}).on('rb:change:value', function(e, value) {
				controller.fetchPage(value, this.getComponent('rbtn_select_discipline').getValue(), undefined, false, function() {
					this.registerPager();
				}.bind(this));
			}.bind(this)));
		},

		registerPager : function() {
			var controller = this.controller;
			new_pager_registration = false;
			this.unregisterComponent('pgr_go_ranking');
			//Initialize pager
			this.registerComponent('pgr_go_ranking', this.$el.find('.pgr_go_ranking').pager({
				activepagenr : controller.getActivePage(), per_page : controller.getPerPage(), total_rows : controller.getTotalRows()
			}).on('pgr:page:switch', function(e, page_nr) {
				if (!new_pager_registration) {
					controller.fetchPage(this.getComponent('rbtn_player_alliance').getValue(), this.getComponent('rbtn_select_discipline').getValue(), page_nr * controller.getPerPage(), this.getComponent('txt_go_source').getValue());
				}
			}.bind(this)).on('pgr:page:select', function(e, _pager, activepagenr, number_of_pages) {
				GoToPageWindowFactory.openPagerGoToPageWindow(_pager, activepagenr + 1, number_of_pages);
			}));
		},

		// Search textbox
		registerSearchTextBox : function() {
			var completation_type = this.controller.getSource() === 'player' ? 'game_player' : 'game_alliance';

			this.unregisterComponent('txt_go_source');
			this.registerComponent('txt_go_source', this.$el.find('.txt_go_source').textbox({
				autocompletion : true,
				autocompletion_type: completation_type
			}));
		},

		registerSearchButton : function() {
			var controller = this.controller,
				l10n = this.l10n;
			this.unregisterComponent('btn_go_source');
			//Search button
			this.registerComponent('btn_go_source', this.$el.find('.btn_go_source').button({caption : l10n.page_ranking.search}).on('btn:click', function() {
				controller.searchRankings(this.getComponent('rbtn_player_alliance').getValue(), this.getComponent('rbtn_select_discipline').getValue(), this.getComponent('txt_go_source').getValue());
			}.bind(this)));
		},

		_handleTotalRowsChange : function(model) {
			if (model.previousAttributes().source !== model.getSource()) {
				new_pager_registration = true;
			}
			if (this.getComponent('pgr_go_ranking')) {
				this.getComponent('pgr_go_ranking').setTotalRows(model.getTotalRows()).setActivePage(model.getActivePage(), {silent : true});
			}
		},

		_handleSourceChange : function(model) {
			var source = model.getSource(),
				text = this.l10n.page_ranking[source],
				txt_go_source = this.getComponent('txt_go_source');

			//Update table title
			this.$el.find('.source_type').html(text);

			//Update text near the search textbox
			this.$el.find('.lbl_go_source').html(text + ':');

			//Update autocompletion
			txt_go_source.setValue('').changeAutocompletion(source === 'player' ? 'game_player' : 'game_alliance');
		},

		_handleFilterChange : function(model) {
			var discipline_title = this.l10n.disciplines[model.getFilter()];

			if (this.controller.getWindowSkin() === EventSkins.GREPOLYMPIA_WORLDCUP) {
                this.$el.find('.title').html(discipline_title);
			} else {
                this.$el.find('.title').html(this.l10n.page_ranking.discipline + ' ' + discipline_title);
			}
		}

	});

	return GrepolympiaRankingView;
});
