/*global window, GrepolisModel */

define('events/crafting/models/easter_cost_modifier', function(require) {
	"use strict";

	function EasterCostModifier() {}

	EasterCostModifier.urlRoot = 'EasterCostModifier';

	/**
	 * Returns model id
	 *
	 * @return {Integer}
	 */
	EasterCostModifier.getId = function() {
		return this.get('id');
	};

	/**
	 * @return {String}
	 */
	EasterCostModifier.getType = function() {
		return this.get('type');
	};

	/**
	 * @return {String}
	 */
	EasterCostModifier.getSubType = function() {
		return this.get('subtype');
	};

	/**
	 * @return {String}
	 */
	EasterCostModifier.getModifier = function() {
		return this.get('modifier');
	};

	window.GameModels.EasterCostModifier = GrepolisModel.extend(EasterCostModifier);
	return EasterCostModifier;
});
