define('events/town_overlay/views/town_overlay', function () {
    'use strict';

    var View = window.GameViews.BaseView;
    var MAX_DESCRIPTION_HEIGHT = 230;

    var TownOverlayView = View.extend({
        initialize: function () {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);

            this.l10n = this.controller.getl10n();
            this.render();
        },

        render: function () { 
            this.$el.html(us.template(this.controller.getTemplate('index'), {
                l10n: this.l10n,
                event_type_css_class: this.controller.getWindowSkin()
            }));

            this.$el.find('.yellowBox').includeTemplate('generic_box');

            this.registerComponents();
        },

        registerComponents: function () {
            var $description = this.$el.find('.description');

            this.controller.unregisterComponent('btn_start');
            this.controller.registerComponent('btn_start', this.$el.find('.btn_start').button({
                caption: this.l10n.btn_caption
            }).on('btn:click', this.controller.closeWindow.bind(this.controller)));

            if ($description.height() > MAX_DESCRIPTION_HEIGHT) { // create wrapping boxes and make it all scrollable
                $description.addClass('scrolled').wrapInner('<div class="scrollbox"><div class="scrollable"></div></div>');
                $description = $description.find('.scrollbox');
                this.unregisterComponent('interstitial_description_scrollbar');
                this.registerComponent('interstitial_description_scrollbar', $description.skinableScrollbar({
                    orientation: 'vertical',
                    template: 'tpl_skinable_scrollbar',
                    skin: 'blue',
                    disabled: false,
                    elements_to_scroll: $description.find('.scrollable'),
                    element_viewport: $description,
                    scroll_position: 0
                }));
            }
        }
    });

    window.GameViews.TownOverlayView = TownOverlayView;

    return TownOverlayView;
});