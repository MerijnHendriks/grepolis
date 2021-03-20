(function() {
	'use strict';

	var GrepolisModel = window.GrepolisModel;

	var ModelClass = function () {}; // never use this, because it will be overwritten
	ModelClass.urlRoot = 'CampaignPlayerArmy';

	GrepolisModel.addAttributeReader(ModelClass,
		'units_total_daily'
	);

	ModelClass.getArmy = function() {
		return this.get('units');
	};

	ModelClass.getMercenaryCost = function(mercenary_type) {
		var base_cost = window.GameDataHercules2014.getBaseCostFor(mercenary_type),
			army_unit = this.getArmy()[mercenary_type],
			cost_factor = (army_unit) ? army_unit.cost_factor : 1;

		return base_cost * cost_factor;
	};

	ModelClass.getHealerCost = function() {
		return window.GameDataHercules2014.getHealerBaseCost() * this.get('healer').cost_factor;
	};

	ModelClass.getHeroCost = function() {
		return window.GameDataHercules2014.getHeroBaseHealCost() * this.get('hero').cost_factor;
	};

	ModelClass.getHealerTimestamp = function() {
		return this.get('healer').cooldown_timestamp;
	};

	ModelClass.getHeroTimestamp = function() {
		return this.get('hero').cooldown_timestamp;
	};

	ModelClass.getCollectedAmount = function() {
		return this.get('unit_packs_collected');
	};

	ModelClass.buyMercenary = function(mercenary_type, callbacks) {
		this.execute('buyUnits', {unit_type: mercenary_type}, callbacks);
	};

	ModelClass.buyHealer = function(callbacks) {
		this.execute('buyHealInstant', {}, callbacks);
	};

	ModelClass.buyInstantHercules = function(callbacks) {
		this.execute('buyInstantHercules', {}, callbacks);
	};

	ModelClass.buyhealInstantHero = function(callbacks) {
		this.execute('buyHealInstantHercules', {}, callbacks);
	};

	ModelClass.onArmyChange = function(obj, callback) {
		obj.listenTo(this, 'change', callback);
	};

	window.GameModels.CampaignPlayerArmy = GrepolisModel.extend(ModelClass);
}());
