/*globals jQuery, Layout, CM, us, TooltipFactory, GoToPageWindowFactory */

(function($) {
	"use strict";

	var model, view, controller;
	var templates = {}, data = {}, l10n = {};
	var wnd, root, at_model, at_controller;
	var cm_context;
	var $content, $attacks_list;

	/**
	 * Model
	 */
	model = {
		getAttacks : function() {
			return data.attacks;
		},

		getAttack : function(attack_id) {
			var attacks = this.getAttacks(), item_id;

			for (item_id in attacks) {
				if (attacks.hasOwnProperty(item_id) && attacks[item_id].id === attack_id) {
					return attacks[item_id];
				}
			}

			return false;
		},

		getClonedAttacks : function() {
			return data.attacks.clone();
		},

		getFilteredAttacks : function(sort_by, state, attack_id) {
			var filtered = this.getClonedAttacks(),
				prop_name = sort_by === "town_name"
					? 'origin_town_name'
					: (sort_by === "send_at"
						? "send_at"
						: (sort_by === "arrival_at"
							? "arrival_at"
							: null)),
				order_by = state ? 'desc' : 'asc';

			//Sort towns by name
			filtered.sort(function(a, b) {
				var a_u = a[prop_name],
					b_u = b[prop_name];

				return a_u === b_u ? 0 : (a_u < b_u	? -1 : 1);
			});

			//ASC DESC
			if (order_by === "desc") {
				filtered.reverse();
			}

			return filtered;
		},

		getAttacksCount : function() {
			return data.attacks.length;
		},

		calculateStartPage : function(default_page_nr, order_by, state, per_page, attack_id) {
			if (!attack_id) {
				return default_page_nr;
			}

			var list = this.getFilteredAttacks(order_by, state), i, l = list.length;

			for (i = 0; i < l; i++) {
				if (attack_id === list[i].id) {
					return Math.floor(i / per_page);
				}
			}

			//Just a fallback if the ID has not been found (theoreticaly impossible)
			return default_page_nr;
		},

		destroy : function() {

		}
	};

	/**
	 * View
	 */
	view = {
		start_page : 0,
		per_page : 6,
		sort_by : 'send_at',
		state : false,

		initialize : function(attack_id) {
			$content = root.find('.gpwindow_content');

			//When attack_id is specified, we have to determinate which page we want to display to user
			this.start_page = model.calculateStartPage(this.start_page, this.sort_by, this.state, this.per_page, attack_id);

			//Initialize main layout
			this.initializeMainLayout(attack_id);

			this.initializeAttacksList(this.start_page, this.sort_by, this.state, attack_id);
		},

		initializeMainLayout : function() {
			var _self = this,
				radiobutton, pager;

			//Load template
			$content.html(us.template(templates.index, {
				l10n : l10n
			}));

			$attacks_list = $content.find('.attacks_list');

			CM.unregisterGroup(cm_context);

			//Sort radiobutton
			radiobutton = CM.register(cm_context, 'rbtn_sort_attack_list', $content.find(".rbtn_sort_attack_list").toggleStateRadiobutton({
				value : this.sort_by, template : 'tpl_rb_sort_by', state : this.state, options : [
					{value : 'town_name', tooltip : l10n.order_by_town_name},
					{value : 'send_at', tooltip : l10n.order_by_sent_at},
					{value : 'arrival_at', tooltip : l10n.order_by_arrival_at}
				]
			}).on("tsrb:change:value", function(e, _tsrb, new_val, old_val) {
				_self.initializeAttacksList(pager.getActivePage(), new_val, _tsrb.getState());
			}).on("tsrb:change:state", function(e, _tsrb, state) {
				_self.initializeAttacksList(pager.getActivePage(), _tsrb.getValue(), state);
			}));

			//Initialize pager
			pager = CM.register(cm_context, 'pgr_attacks_list', $content.find(".pgr_attacks_list").pager({
				activepagenr : this.start_page, per_page : this.per_page, total_rows : model.getAttacksCount()
			}).on("pgr:page:switch", function(e, page_nr) {
				_self.initializeAttacksList(page_nr, radiobutton.getValue(), radiobutton.getState());
			}).on("pgr:page:select", function(e, _pager, activepagenr, number_of_pages) {
				GoToPageWindowFactory.openPagerGoToPageWindow(_pager, activepagenr + 1, number_of_pages);
			}));
		},

		initializeAttacksList : function(page_nr, order_by, state, attack_id) {
			var _self = this,
				attacks = model.getFilteredAttacks(order_by, state);

			//Load template
			$attacks_list.html(us.template(templates.attacks_list, {
				l10n : l10n,
				attacks : attacks,
				activepagenr : page_nr,
				per_page : this.per_page,
				attack_id : attack_id
			}));

			$attacks_list.off('click').on('click.open_alliance_link', '.attacks_row', function(e) {
				var $row = $(e.currentTarget),
					$target = $(e.target),
					attack_id = parseInt($row.attr('data-attackid'), 10),
					plan_id;

				if ($target.hasClass('gp_alliance_link')) {
					Layout.allianceProfile.open(addslashes($target.attr('data-allyname')), $target.attr('data-allyid'));
				}
				else if ($target.hasClass('show_units')) {
					_self.toggleAllUnits(attack_id);
				}
				else if ($target.hasClass('edit_icon')) {
					at_controller.openEditAttackPage(attack_id, 'attacks');
				}
				else if ($target.hasClass('attack_icon')) {
					controller.switchTownForAttack(attack_id);
				}
				else if ($target.hasClass('plan_name')) {
					plan_id = parseInt($row.attr('data-planid'), 10);
					at_controller.showPlan(plan_id);
				}
			});

			$attacks_list.find('.show_units').tooltip(l10n.show_all_units);

			_self.setUnitListTooltips(attacks);
		},

		setUnitListTooltips: function (attacks_list) {
			attacks_list.forEach(function (attack) {
				$attacks_list.find('.attacks_row[data-attackid="' + attack.id + '"] .origin_town_units')
					.tooltip(TooltipFactory.getUnitListTooltip(attack.units));
			}.bind(this));
		},

		toggleAllUnits : function(attack_id) {
			var $el_to_open = $attacks_list.find('.attacks_row_' + attack_id);

			if ($el_to_open.hasClass('active_row')) {
				$el_to_open.removeClass('active_row');
			}
			else {
				//$attacks_list.find('.attacks_row').removeClass('active_row');
				$el_to_open.addClass('active_row');
			}
		},

		destroy : function() {
			$content.off();
		}
	};

	/**
	 * Controller
	 */
	controller = {
		initialize : function(obj) {
			templates = obj.ret_data.templates;
			data = obj.ret_data.data;
			l10n = obj.ret_data.l10n;
			at_model = obj.at_model;
			at_controller = obj.at_controller;

			wnd = obj.wnd;
			root = wnd.getJQElement();

			//Contexts
			cm_context = wnd.getContext();

			view.initialize(data.attack_id);
		},

		switchTownForAttack : function(attack_id) {
			var attack = model.getAttack(attack_id);

			at_controller.switchTownForAttack(attack.type, attack.target_id, attack.target_town_name, attack.origin_town_id, attack.units);
		},

		destroy : function() {
			templates = data = l10n = null;
			wnd = root = null;
			cm_context = null;

			model.destroy();
			view.destroy();
		}
	};

	//Make it globally visible
	window.AttackPlanner.controllers.attacks = controller;
}(jQuery));