/*globals jQuery, Layout, CM, us, gpAjax, Layout, addslashes */

(function($) {
	'use strict';

	var model, view, controller;
	var templates = {}, data = {}, l10n = {};
	var wnd, root, at_model;
	var cm_context;
	var $content, $rights_list;

	/**
	 * Model
	 */
	model = {
		getPlanId : function() {
			return data.plan_id;
		},

		getPlanName : function() {
			return data.plan_name;
		},

		getPlanRights : function() {
			return data.plan_rights;
		},

		setPlanRights : function(rights) {
			data.plan_rights = rights;
		},

		destroy : function() {

		}
	};

	/**
	 * View
	 */
	view = {
		initialize : function() {
			$content = root.find('.gpwindow_content');

			//Initialize main layout
			this.initializeMainLayout();
			this.initializeMainLayoutComponents();
			this.renderRightsList();
		},

		initializeMainLayout : function() {
			wnd.setTitle(l10n.attack_planner + ' - ' + model.getPlanName());

			//Load template
			$content.html(us.template(templates.rights, {
				l10n : l10n
			}));

			$rights_list = $content.find('.rights_list');
		},

		initializeMainLayoutComponents : function() {
			CM.unregisterGroup(cm_context);
			//Register alliance rights textbox
			CM.register(cm_context, 'txt_alliance_rights', $content.find('.txt_alliance_rights').textbox({
				clear_msg_button : true,
				hidden_zero: false,
				autocompletion : true, autocompletion_type : 'game_alliance',
				autocompletion_format_list : function(row) {
					return row[1];
				},
				autocompletion_format_output : function(row) {
					return row.data[1];
				}
			}));

			//Add alliance rights
			CM.register(cm_context, 'btn_add_alliance_rights', $content.find('.btn_add_alliance_rights').button({}).on('btn:click', function() {
				controller.addRightsToPlan(model.getPlanId(), 'alliance');
			}));

			//Register player rights textbox
			CM.register(cm_context, 'txt_player_rights', $content.find('.txt_player_rights').textbox({
				clear_msg_button : true,
				hidden_zero: false,
				autocompletion : true,
				autocompletion_type : 'game_player',
				autocompletion_format_list : function(row) {
					return row[0];
				},
				autocompletion_format_output : function(row) {
					return row.data[0];
				}
			}));

			//Add player rights
			CM.register(cm_context, 'btn_add_player_rights', $content.find('.btn_add_player_rights').button({}).on('btn:click', function() {
				controller.addRightsToPlan(model.getPlanId(), 'player');
			}));

			//Go back button
			CM.register(cm_context, 'btn_go_back', $content.find('.btn_go_back').button({
				caption : l10n.go_back
			}).on('btn:click', function() {
				controller.showPlan(model.getPlanId());
			}));

			//Open Alliance Profiles
			$content.on('click.openAllianceProfileLinks', '.icon.alliance', function(e) {
				var $el = $(e.currentTarget);

				Layout.allianceProfile.open(addslashes($el.html()), $el.attr('data-allianceid'));
			});

			//Remove Rights
			$content.on('click.removeRight', '.delete_right', function(e) {
				var $el = $(e.currentTarget),
					visibility_id = parseInt($el.attr('data-visibilityid'), 10),
					visibility_type = $el.attr('data-visibilitytype');

				controller.removeRightsFromPlan(model.getPlanId(), visibility_id, visibility_type);
			});
		},

		renderRightsList : function() {
			//Load template
			$rights_list.html(us.template(templates.rights_list, {
				l10n : l10n,
				rights_list : model.getPlanRights()
			}));
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

			wnd = obj.wnd;
			root = wnd.getJQElement();

			//Contexts
			cm_context = wnd.getContext();

			view.initialize();
		},

		addRightsToPlan : function(plan_id, type) {
			var $textbox = CM.get(cm_context, 'txt_' + type + '_rights'),
				name = $textbox.getValue();

			gpAjax.ajaxPost('attack_planer', 'add_rights_to_plan', {
				plan_id: plan_id,
				visibility_name : name,
				visibility_type : type
			}, true, function (data) {
				$textbox.clear();

				model.setPlanRights(data.plan_rights);
				view.renderRightsList();
			});
		},

		removeRightsFromPlan : function(plan_id, visibility_id, visibility_type) {
			gpAjax.ajaxPost('attack_planer', 'delete_rights_from_plan', {
				plan_id : plan_id,
				visibility_id : visibility_id,
				visibility_type : visibility_type
			}, true, function (data) {
				model.setPlanRights(data.plan_rights);
				view.renderRightsList();
			});
		},

		showPlan : function(plan_id) {
			//var _self = this;

			//Save plan id
			//at_model.setCurrentPlanId(plan_id);

			//Reset target Id, to select the first on from the list
			//at_model.setSelectedTargetId(0);

			//Open plan window
			wnd.requestContentGet('attack_planer', 'show_plan', {plan_id : plan_id});
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
	window.AttackPlanner.controllers.rights = controller;
}(jQuery));
