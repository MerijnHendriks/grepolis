/*global Timestamp, GrepolisModel, DateHelper */
(function() {
	'use strict';

	var Mermaid = function () {}; // never use this, because it will be overwritten
	Mermaid.urlRoot = 'Mermaid';

	Mermaid.getReward = function() {
		return this.get('reward');
	};

	Mermaid.isVisible = function() {
		return this.get('visible') === true;
	};

	Mermaid.getTimeLeft = function() {
		return this.get('end_date') - Timestamp.now();
	};

	Mermaid.getEndDateNice = function() {
        return DateHelper.formatDateTimeNice(this.get('end_date'), false);
	};

	Mermaid.getMaxResources = function() {
		return this.get('max_resources');
	};

	Mermaid.getPowerId = function() {
		var reward = this.getReward();

		return reward.power_id;
	};

	Mermaid.onVisibilityChange = function(obj, callback) {
		obj.listenTo(this, 'change:visible', callback);
	};

	window.GameModels.Mermaid = GrepolisModel.extend(Mermaid);
}());



