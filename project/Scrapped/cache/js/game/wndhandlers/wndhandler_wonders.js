/*globals WndHandlerDefault, WorldWonders, WMap, GameEvents, DM, GPWindowMgr */

(function() {
	'use strict';

	var GameDataWorldWonders = require('data/world_wonders');
	var GREAT_PYRAMID_OF_GIZA = 'great_pyramid_of_giza';
	var HANGING_GARDENS_OF_BABYLON = 'hanging_gardens_of_babylon';
	var COLOSSUS_OF_RHODES = 'colossus_of_rhodes';


	function WndHandlerWonders(wndhandle){
		this.wnd = wndhandle;
		this.island_x = 0;
		this.island_y = 0;
		this.wonder = null;
	}

	WndHandlerWonders.inherits(WndHandlerDefault);

	WndHandlerWonders.prototype.getDefaultWindowOptions = function(){
		// JQuery UI Dialog Optiosn Object.
		var ret = {position: ['center','center'],
			height: 520,
			width: 762,
			resizable: false,
			title: _('Construction site for a World Wonder')
		};

		return ret;
	};

	WndHandlerWonders.prototype.onInit = function(title, UIopts, island_x, island_y){
		this.island_x = island_x;
		this.island_y = island_y;

		this.wnd.requestContentGet('wonders', 'index', {island_x : island_x, island_y : island_y});

		return true;
	};

	WndHandlerWonders.prototype.registerComponents = function(){
		var WonderHelper = require('helpers/wonder');
        WonderHelper.registerGracePeriodProgressBar(this.wnd);
	};

	WndHandlerWonders.prototype.onRcvData = function(data, controller, action) {
		var html = data.html ? data.html : null;

        if (html) {
            this.wnd.setContent(html);

			if (action === 'info') {
                return;
            }
		}

        this.registerComponents();
        this.registerEventListeners();

		//Handle the send resources to WW window
		if ((action === 'index' || action === 'start_next_building_phase' || action === 'decrease_build_time_with_favor') && data.data.created_at) {
			WorldWonders.initiaiteSendResourcesTab(this, data.data, {x : this.island_x, y : this.island_y});
		}

		var inactive_send_resources_btn = $('a.button.inactive_send_resources_btn');
		inactive_send_resources_btn.tooltip(inactive_send_resources_btn.attr('data-tooltip'));
		var inactive_reduce_buildtime_btn = $('a.button.inactive_reduce_buildtime_btn');
		inactive_reduce_buildtime_btn.tooltip(inactive_reduce_buildtime_btn.attr('data-tooltip'));
		this.registerTooltips();
	};

	WndHandlerWonders.prototype.onMessage = function(){
		return null;
	};

	WndHandlerWonders.prototype.buildWonder = function() {
		this.wnd.ajaxRequestPost('wonders', 'build_wonder', {island_x: this.island_x, island_y: this.island_y, wonder_type: this.wonder}, function(_wnd, return_data) {
            WMap.pollForMapChunksUpdate();
            _wnd.requestContentGet('wonders', 'index', {island_x : this.island_x, island_y : this.island_y});
            _wnd.setTitle(return_data.wonder_name);
		}.bind(this));
	};

	WndHandlerWonders.prototype.decreaseBuildTimeWithFavor = function(wonder_id) {
		this.wnd.requestContentPost('wonders', 'decrease_build_time_with_favor', {island_x: this.island_x, island_y: this.island_y});
	};

	WndHandlerWonders.prototype.chooseWonder = function(wonder_type) {
		var root = this.wnd.getJQElement();
		var descriptions = root.find('div.wonder_descriptions');
		var confirm_button = root.find('div.confirm_wonder_button');

		if(this.wonder !== null){
			descriptions.find('li.' + this.wonder).hide();
		}

		this.wonder = wonder_type;

		root.find('div.wonder_info_text_wrapper').hide();
		root.find('ul.wonder_building_options > li').removeClass('selected').filter('li.' + wonder_type).addClass('selected');
		descriptions.show().find('li.' + wonder_type).show();
		descriptions.append(confirm_button.show());
	};

	WndHandlerWonders.prototype.startNextBuildingPhase = function() {
		this.wnd.requestContentPost('wonders', 'start_next_building_phase', {island_x: this.island_x, island_y: this.island_y});
	};

	WndHandlerWonders.prototype.toggleInfoText = function() {
		var root = this.wnd.getJQElement(),
			wonder_info_text = root.find('div.wonder_info_text'),
			container = root.find('div.gpwindow_content'),
			wonder_controls = root.find('.wonder_controls');

		wonder_info_text.toggle();
		root.find('a.toggle_wonder_info_text').toggleClass('open closed');

		if (wonder_info_text.css("display") === "block") {
			container.scrollTop(parseInt(wonder_controls.outerHeight(true), 10));
		}
	};

	WndHandlerWonders.prototype.refreshOnResourcesSend = function(){
		this.wnd.requestContentGet('wonders', 'index', {island_x : this.island_x, island_y : this.island_y});
	};

	WndHandlerWonders.prototype.registerEventListeners = function(){
		var that = this,
			cm_context = this.wnd.getContext();

		this.unregisterEventListeners();

		$.Observer(GameEvents.town.town_switch).subscribe(['WndHandlerWonders', 'WndHandlerWonders' + cm_context.main], function(e, data) {
			that.wnd.requestContentGet('wonders', 'index', {island_x : that.island_x, island_y : that.island_y});
		});
	};

	WndHandlerWonders.prototype.registerTooltips = function(){
		var root = this.wnd.getJQElement(),
			wonders = root.find('.wonder_building_options').children();
		for(var i = 0; i < wonders.length; i++) {
			var wonder_data_type = wonders[i].getAttribute('data-type');
			$(wonders[i]).tooltip(this.getWorldWonderTooltip(wonder_data_type));
		}
	};

	WndHandlerWonders.prototype.getWorldWonderTooltip = function(data_type) {
		var tooltip_title = this.getWonderTooltipTitle(data_type),
			tooltip_description = this.getWonderTooltipDescription(data_type);
		return tooltip_title + '<br/>' + tooltip_description;
	};

	WndHandlerWonders.prototype.getWonderTooltipTitle = function(data_type) {
		var l10n = DM.getl10n('world_wonder_tooltips');
		return '<b>' + l10n[data_type].title + '</b>';
	};

	WndHandlerWonders.prototype.getWonderTooltipDescription = function(data_type) {
		var l10n = DM.getl10n('world_wonder_tooltips'),
			modification_value = 0;
		switch (data_type) {
			case COLOSSUS_OF_RHODES:
				modification_value = GameDataWorldWonders.getMaxExpansionStage();
				break;
			case GREAT_PYRAMID_OF_GIZA:
				modification_value = GameDataWorldWonders.getStorageModificationForPyramid();
				break;
			case HANGING_GARDENS_OF_BABYLON:
				modification_value = GameDataWorldWonders.getResourceProductionModificationForHangingGardens() * 100;
				break;
			default:
				modification_value = GameDataWorldWonders.getMythUnitsModificationForMausoleum() * 100;
				break;
		}
		return l10n[data_type].description(modification_value);
	};

	WndHandlerWonders.prototype.unregisterEventListeners = function(){
		var cm_context = this.wnd.getContext();

		$.Observer().unsubscribe(['WndHandlerWonders', 'WndHandlerWonders' + cm_context.main]);
	};

	WndHandlerWonders.prototype.onClose = function(){
		this.unregisterEventListeners();
		return true;
	};

	GPWindowMgr.addWndType('WONDERS', null, WndHandlerWonders);
}());
