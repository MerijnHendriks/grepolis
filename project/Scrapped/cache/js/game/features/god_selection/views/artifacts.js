/* globals Game */

define('features/god_selection/views/artifacts', function (require) {
    'use strict';

    var GameViews = require_legacy('GameViews');
    var ARTIFACTS = require('enums/artifacts');

    var ArtifactsView = GameViews.BaseView.extend({
        initialize: function (options) {
            GameViews.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        renderArtifact: function (artifact_id) {
            var l10n_artifacts = this.l10n.artifacts,
                unlocked = this.controller.isArtifactUnlocked(artifact_id);

            return this.getTemplate('artifact_card', {
                l10n: l10n_artifacts[artifact_id],
                artifact_id: artifact_id,
                unlocked: unlocked,
                locked_text: l10n_artifacts.locked
            });
        },

        renderArtifacts: function () {
            var $artifacts_wrapper = this.$el.find('.artifacts_wrapper'),
                fragment = document.createDocumentFragment(),
                artifact_id = '',
                artifact;

            for (var id in ARTIFACTS) {
                if (ARTIFACTS.hasOwnProperty(id)) {
                    artifact_id = ARTIFACTS[id];

                    artifact = this.renderArtifact(artifact_id);
                    $(fragment).append(artifact);
                }
            }

            $artifacts_wrapper.html(fragment);
        },

        /**
         * Helper function to set the elements of all shown artifacts to the same size
         * Used so we don not have to have fixed sizes for the texts and they keep a uniform look
         *
         * @param selector - CSS Selector to determine which elements should be resized
         */
        resizeArtifactElements: function (selector) {
            var $element = this.$el.find(selector),
                max_height = 0;

            $element.each(function (idx, el) {
                max_height = Math.max($(el).height(), max_height);
            });

            $element.height(max_height);
        },

        render: function () {
            this.renderTemplate(this.$el, 'artifacts', {});
            this.renderArtifacts();
            this.resizeArtifactElements('.description');
            this.resizeArtifactElements('.effect');
            this.resizeArtifactElements('.requirement');
        }
    });

    window.GameViews.ArtifactsView = ArtifactsView;

    return ArtifactsView;
});