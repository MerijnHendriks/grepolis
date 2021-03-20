/*global GrepolisModel */

define('events/crafting/models/easter_stats', function(require) {
	'use strict';

	var EasterStats = function () {}; // never use this, because it will be overwritten
	EasterStats.urlRoot = 'EasterStats';

	EasterStats.getForIngredient = function(ingredient_id) {
		return this.get('daily_stats')[ingredient_id] || 0;
	};

	window.GameModels.EasterStats = GrepolisModel.extend(EasterStats);
	return EasterStats;
});
