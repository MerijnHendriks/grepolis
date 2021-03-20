/* globals GrepolisModel */

define('features/surveys/models/survey', function() {
	"use strict";

	var Survey = GrepolisModel.extend({
		urlRoot : 'Survey',

		initialize: function (attributes) {

		},

		getId: function () {
			return this.get('id');
		},

		hasData: function () {
			return !!this.get('survey_data');
		},

		getData: function () {
			return this.get('survey_data') || {};
		},

		getType: function () {
			return this.getData().type || false;
		},

		isPoll: function () {
			return this.getType() === 'poll';
		},
        isFeedback: function () {
            return this.getType() === 'feedback';
        },
		isCouncilVoting: function () {
            return this.getType() === 'councilvoting';
        },

		getSubject: function () {
			return this.getData().subject;
		},

		hasResults: function () {
			return !!this.get('has_results');
		},

		getDescription: function () {
			return this.getData().description;
		},

		getQuestions: function () {
			if(!this.hasResults()){
				return this.get('survey_answers');
			} else {
				return false;
			}
		},

		getResults: function () {
			if(this.hasResults()){
				return this.get('survey_answers');
			} else {
				return false;
			}
		},

		getVotes: function () {
			if(this.hasResults()){
				return this.get('survey_votes');
			} else {
				return false;
			}
		},

		getResultForVote: function (answer_id) {
			var votes = this.getVotes(), vote;
			if(votes) {
				vote = us.findWhere(votes, {'survey_answer_id': answer_id});
				if(vote) {
					return {
						percentage: Math.round((parseFloat(vote.rating) / 5) *100),
						value: Math.round((parseFloat(vote.rating) * 100)) / 100
					};
				} else {
					return {
						percentage: 0,
						value: 0
					};
				}
			} else {
					return {
						percentage: 0,
						value: 0
					};
			}
		},

		onResultsChange: function(obj, callback) {
			obj.listenTo(this, 'change:has_results', callback);
		},

		onParticipatedChange : function(obj, callback) {
			obj.listenTo(this, 'change:participated', callback);
		},

		hasParticipated : function() {
			//return this.getData().participated;
			return this.get('participated');
		},

		setParticipated : function() {
			this.set('participated', true);
			//var data = this.getData();
			//data.participated = true;
			//this.set(data);
		}

	});

	window.GameModels.Survey = Survey;

	return window.GameModels.Survey;
});
