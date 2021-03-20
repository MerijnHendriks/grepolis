(function() {
	'use strict';

	var Collection = window.GrepolisCollection;
	var CampaignPlayerStage = window.GameModels.CampaignPlayerStage;

	var CollectionClass = function() {}; // never use this, because it will be overwritten

	CollectionClass.model = CampaignPlayerStage;
	CollectionClass.model_class = 'CampaignPlayerStage';

	CollectionClass.getStages = function() {
		return this.models;
	};

	CollectionClass.getStagesCount = function() {
		return this.getStages().length;
	};

	CollectionClass.getStage = function(stage_id) {
		return this.find(function(model) {
			return model.getId() === stage_id;
		});
	};

	CollectionClass.getStageReward = function(stage_id) {
		var stage = this.getStage(stage_id);
		if (!stage) {
			return null;
		}
		return stage.getReward();
	};

	CollectionClass.onFightResultChange = function(obj, callback) {
		obj.listenTo(this, 'change:fight_result', callback);
	};

	CollectionClass.onStageChange = function(obj, callback) {
		obj.listenTo(this, 'change', callback);
	};

	window.GameCollections.CampaignPlayerStages = Collection.extend(CollectionClass);
}());
