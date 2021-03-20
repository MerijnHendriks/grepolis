/* global GrepoNotificationStack, WndHandlerDefault, DM, Game, GameDataPremium, CM, Reports, TooltipFactory, PlaceWindowFactory, GPEndlessScroll, NotificationType, gpAjax, GPWindowMgr, MM */

(function() {
	'use strict';

	function WndHandlerReport(wndhandle) {
		this.wnd = wndhandle;
		this.current_folder_id = 0;
		this.last_folder_id = 0;
		this.last_reports_ids = null;
		this.data = null;
		this.es_data = null;

		this.drag_and_drop_for_ios = false;
	}

	WndHandlerReport.inherits(WndHandlerDefault);

	WndHandlerReport.prototype.getDefaultWindowOptions = function() {
		// JQuery UI Dialog Optiosn Object.
		var ret = {
			position: ['center', 'center'],
			minHeight: 500,
			width: 800,
			resizable: false,
			autoresize: true,
			title : _('Reports')
		};

		return ret;
	};

	/**
	 * Window Initialitation
	 *
	 * Parameters:
	 *  title   => window title
	 *  UIopts  => Jquery UI Options for the windowy
	 *  variant => the window parameters passed to the GPWindowMgr.new() function
	 *
	 * Returns:
	 *  boolean, false would abort window creation.
	 **/
	WndHandlerReport.prototype.onInit = function(title, UIopts, id, open_action) {
		var params = {};
		if (id !== undefined) {
			params.id = id;
		}

		open_action = open_action || 'index';

		if (open_action === 'view') {
			this.wnd.requestContentPost('report', open_action, params);
		} else {
			this.wnd.requestContentGet('report', open_action, params);
		}

		return true;
	};

	WndHandlerReport.prototype.getData = function() {
		return this.data;
	};

	WndHandlerReport.prototype.setData = function(data) {
		this.data = data;
	};

	WndHandlerReport.prototype.getFilterTypes = function() {
		return this.getData().filter_types;
	};

	WndHandlerReport.prototype.getFilterType = function() {
		if (this.getData()) {
			return this.getData().filter_type;
		}
	};

	WndHandlerReport.prototype.getFilterTypesDropwdownOptions = function() {
		var filter_type,
			filter_types = this.getFilterTypes(),
			i,
			l = filter_types.length,
			dropdown_options = [],
			l10n = DM.getl10n('report', 'inbox').filter_types;

		for (i = 0; i < l; i++) {
			filter_type = filter_types[i];

			dropdown_options.push({
				value : filter_type,
				name : l10n[filter_type]
			});
		}

		return dropdown_options;
	};

	WndHandlerReport.prototype.initializeDragDropList = function(action) {
		var that = this, wnd = this.wnd,
			root = wnd.getJQElement(),
			isiOS = Game.isiOs(),
			isDragDropEnabled = function() {
				return !isiOS || (isiOS && that.drag_and_drop_for_ios);
			},
			cm_context = wnd.getContext();

		if (!GameDataPremium.hasCurator()) {
			return;
		}

		if ((action === 'index' || action === 'delete' || action === 'move' || action === 'delete_many' || action === 'mark_as_read_many')) {
			root.off('.report_index, .draggable');

			CM.unregister(this.wnd.getContext(), 'btn_toggle_drag_drop');
			CM.register(cm_context, 'btn_toggle_drag_drop', root.find('.btn_toggle_drag_drop').button({
				toggle : true, tooltips : [
					{title : _('Activate drag & drop')}
				]
			}).on('btn:click:odd', function() {
				that.drag_and_drop_for_ios = true;
			}).on('btn:click:even', function() {
				that.drag_and_drop_for_ios = false;
			}));

			if (action === 'move') {
				Reports.toggleMenu();
			}

			// drag
			$('#report_list li.report_item').draggable({
				appendTo: 'body',
				classes: {
					'ui-draggable': 'dragging'
				},
				distance: 20,
				helper: function() {
					var $el = $(this);
					$el.find('input').prop('checked', true);
					var selected = Reports.getSelectedReports(), length = selected[0];

					return length > 1 ?
						$('<div class="multidragging"><div class="header">' + length + ' ' + _('Reports') + '</div></div>').append(selected[1]).css({width : $el.width()}) :
							$el.clone().css({width : $el.width()});
				},
				scope: 'report',
				start: function(event, ui) {
					if (!isDragDropEnabled()) {
						event.preventDefault();
					}
				}
			});

			// drop
			$('#folder_menu_reports span.folder').droppable({
				drop: function(event, ui) {
					if (!isDragDropEnabled()) {
						return;
					}

					var folder_id = $(this).attr('name');
					folder_id = folder_id.split('_')[1];
					var reports_ids = Reports.getReportsIds();

					//Drop event is fired multiple times
					if ((that.last_folder_id !== folder_id || that.reports_ids !== reports_ids) && reports_ids.length) {
						that.wnd.sendMessage('reportMove', 'report_form', folder_id, that.last_folder_id);

						that.last_reports_ids = reports_ids;
						Reports.removeSelectedReports();
					}
				},
				scope: 'report',
				tolerance: 'pointer'
			});
		}
	};

	WndHandlerReport.prototype.onRcvData = function(data, controller, action) {
		var that = this, wnd = this.wnd,
			root = wnd.getJQElement(),
			cm_context = wnd.getContext();

		this.setData(data.data);

		if (data && data.html) {
			this.wnd.setContent(data.html);
		}

		this.initializeDragDropList(action);

		if (action === 'view') {
			if ($('a#cultural_points_link').length) {
				$('a#cultural_points_link').unbind('click').bind('click', function() {
					PlaceWindowFactory.openPlaceWindow();
				});
			}

			var canceled_powers = $('div#right_side a.power_icon');
			canceled_powers.each(function (_idx, _element) {
				var $el = $(_element),
					power_id = $el.attr('name'),
					tooltip = TooltipFactory.getBasicPowerTooltip(power_id);

				$el.tooltip(tooltip);
			});
		}

		//open report
		root.off('.report_index').on('click.report_index touchstart.report_index', '.open_report_link', function(e) {
			var $link = $(e.currentTarget),
				report_id = $link.attr('data-reportid');

			that.reportView(report_id);
		});

		var valid_actions = ['index', 'delete_many', 'delete_all_from_folder', 'delete','mark_as_read_many', 'move'];

		if ((valid_actions.indexOf(action) !== -1)) {
			CM.register(cm_context, 'dd_filter_type', root.find('.dd_filter_type').dropdown({
				options : this.getFilterTypesDropwdownOptions(),
				value : this.getFilterType()
			}).on('dd:change:value', function(e, new_val, old_val) {
				that.wnd.requestContentGet('report','index', {filter_type : new_val, folder_id: that.current_folder_id});
			}));
			$('a#report-index').removeClass('active').addClass('active');
		}

		this.renderEndlessScroll();
	};

	WndHandlerReport.prototype.renderEndlessScroll = function() {
		if (this.es_data) {
			this.es_data.es_args.filter_type = this.getFilterType();
			this.es_data.callback = function(data) {
				this.initializeDragDropList(data.action);
			}.bind(this);

			window.ReportEndlessScroll = new GPEndlessScroll(this.es_data);
		}
	};

	WndHandlerReport.prototype.onClose = function() {
		var root = this.wnd.getJQElement();

		root.off('.report_index, .draggable');

		CM.unregister(this.wnd.getContext(), 'btn_toggle_drag_drop');
		return true;
	};

	WndHandlerReport.prototype.reportView = function(report_id) {
		// Also delete notification
		GrepoNotificationStack.deleteByTypeAndParamID(NotificationType.NEWREPORT, report_id);

		this.wnd.requestContentPost('report', 'view', {id: report_id});
	};

	WndHandlerReport.prototype.reportDeleteOne = function(report_id) {
		// Also delete notification
		GrepoNotificationStack.deleteByTypeAndParamID(NotificationType.NEWREPORT, report_id, true);
		this.removeMapExtraData([parseInt(report_id, 10)]);

		this.wnd.requestContentPost('report', 'delete', {report_id: report_id, folder_id: this.current_folder_id});
	};

	WndHandlerReport.prototype.reportChangeFolder = function(folder_id) {
		this.current_folder_id = folder_id;
		this.last_folder_id = folder_id;
		this.wnd.requestContentGet('report', 'index', {folder_id: folder_id});
	};

	WndHandlerReport.prototype.reportDeleteMany = function(form_id) {
		var params = {};
		params.report_ids = [];
		$('#' + form_id + ' input:checkbox:checked').each(function() {
			var val = parseInt(this.value, 10);
			//Check if we have a valid numeric id
			if (val > 0) {
				params.report_ids.push(val);
				// Also delete notification
				GrepoNotificationStack.deleteByTypeAndParamID(NotificationType.NEWREPORT, val, true);
			}
		});
		this.removeMapExtraData(params.report_ids);
		this.wnd.requestContentPost('report', 'delete_many', params);
	};

	WndHandlerReport.prototype.reportMarkAsReadMany = function(form_id) {
		var l10n = DM.getl10n('report');
		var HumanMessage = require('misc/humanmessage');

		var params = {};
		params.report_ids = [];
		$('#' + form_id + ' input:checkbox:checked').each(function() {
			var val = parseInt(this.value, 10);
			//Check if we have a valid numeric id
			if (val > 0) {
				params.report_ids.push(this.value);
			}
		});
		if (params.report_ids.length > 0) {
			this.wnd.requestContentPost('report', 'mark_as_read_many', params);
		} else {
			HumanMessage.error(l10n.no_reports_selected);
		}
	};

	WndHandlerReport.prototype.reportMarkAsReadFolder= function(form_id) {
		var params = {
			folder_id : this.current_folder_id
		};
		this.wnd.requestContentPost('report', 'mark_folder_as_read', params);
	};

	WndHandlerReport.prototype.reportDeleteAllOfFolder = function() {
		var params = {
				folder_id : this.current_folder_id,
				filter_type : this.getFilterType()
			},
			that = this,
			reports_ids;

		that.wnd.requestContentPost('report', 'delete_all_from_folder', params, function(wndObj, data, status) {
			if (status === 'success') {
				reports_ids = data.reports_ids ? data.reports_ids : [];

				// Also delete notification
				reports_ids.forEach(function (id) {
					GrepoNotificationStack.deleteByTypeAndParamID(NotificationType.NEWREPORT, id, true);
				});
				this.removeMapExtraData(reports_ids);

				$('#report_list').empty().append($('<li class="even bottom">' + _('No reports available.') + '</li>'));
			}
		}.bind(this));
	};

	WndHandlerReport.prototype.resourceReportDeleteMany = function(form_id) {
		var params = {};
		params.resource_transport_report_ids = [];
		$('#' + form_id + ' input:checkbox:checked').each(function() {
			//Check if we have a valid numeric id
			if (parseInt(this.value, 10) > 0) {
				params.resource_transport_report_ids.push(this.value);
			}
		});

		this.wnd.requestContentPost('report', 'delete_many_res_trans_reports', params);
	};

	WndHandlerReport.prototype.resourceReportDeleteAll = function() {
		this.wnd.requestContentPost('report', 'delete_all_res_trans_reports', {});
	};

	WndHandlerReport.prototype.reportMove = function(form_id, folder_id, last_folder_id) {
		var params = {folder_id: folder_id};
		params.report_ids = [];

		if (typeof last_folder_id !== 'undefined') {
			params.last_folder_id = last_folder_id;
		}

		$('#' + form_id + ' input:checkbox:checked').each(function() {
			//Check if we have a valid numeric id
			if (parseInt(this.value, 10) > 0) {
				params.report_ids.push(this.value);
			}
		});

		this.wnd.requestContentPost('report', 'move', params);
	};

	WndHandlerReport.prototype.reportMoveOne = function(report_id, folder_id) {
		gpAjax.ajaxPost('report', 'move_report', {
			report_id: report_id,
			folder_id: folder_id
		}, true, function() {});
	};

	WndHandlerReport.prototype.unpublishReportMany = function(form_id) {
		var params = {};
		params.report_ids = [];
		$('#' + form_id + ' input:checkbox:checked').each(function() {
			//Check if we have a valid numeric id
			if (parseInt(this.value, 10) > 0) {
				params.report_ids.push(this.value);
			}
		});

		this.wnd.requestContentPost('report', 'unpublish_report_many', params);
	};

	WndHandlerReport.prototype.loadIndexTab = function() {
		this.wnd.requestContentGet('report', 'index', {folder_id: this.current_folder_id});
	};

	WndHandlerReport.prototype.setEndlessScrollData = function(data) {
		this.es_data = data;
	};

	/**
	 * remove mapExtraData (smoke) given only the report ids
	 * @param {[Number]} report_ids
	 */
	WndHandlerReport.prototype.removeMapExtraData = function(report_ids) {
		 MM.getOnlyCollectionByName('MapExtraInfo').removeByReports(report_ids);
	};

	GPWindowMgr.addWndType('REPORT', 'link_report', WndHandlerReport, 1);
}());
