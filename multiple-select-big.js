(function ($, window, document, undefined) {

    function Selectmultiple(element, opts) {
        this.options = $.extend({}, Selectmultiple.DEFAULTS, opts);
        this.$element = $(element);
        this.init();
        this.$element.data('value', null);
        this.$element.data('count', this.length);
        this.$element.data('options', this.options.data);
    }

    var pluginName = 'selectmultiple';

    // default options
    Selectmultiple.DEFAULTS = {
        data: [],
        size: 100,
        text: 'selectmultiple',
        placeholder: 'search'
    };

    // draw the html widget and load the first options.size items
    Selectmultiple.prototype = {
        init: function () {

            this.$element.empty(); // clear element content
            this.optionPage = 1;
            this.page = 1;
            this.scrollAmount = 0;
            // make the multipe select fit in the parent container is no width specified 
            this.length = this.options.data.length;
            this.select = []; // array of boolean, size of data.length. Store wether an option is selected (true) or not
            for (var i = 0; i < this.length; i++) {
                this.select[i] = false;
            }
            // CREATE HTML COMPONENTS
            this.$element.addClass('btn-group');
            this.$element.addClass('show-tick');
            this.$element.css('width', '100%');

            this.$buttonsearch = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">')
                    .css({'width': '100%', 'padding': '5px 6px 2px 6px'})
                    .appendTo(this.$element);

            this.$buttontext = $('<span>')
                    .text(this.options.text)
                    .css({'width': '120px', 'display': 'inline-block', 'overflow': 'hidden', 'white-space': 'nowrap', 'text-overflow': 'ellipsis'})
                    .appendTo(this.$buttonsearch);

            this.$buttoniconspan = $('<span class="caret"> ')
                    .css({'margin-left': '10px', 'margin-top': '-10px'})
                    .appendTo(this.$buttonsearch);

            this.$menu = $('<div class="dropdown-menu" >')
                    .css({'width': '100%', 'padding': '10px'})
                    .appendTo(this.$element);

            this.$input = $('<input type="text" class="input form-control" >')
                    .css({'margin-top': '6px', 'width': (this.width - 30) + 'px'})
                    .prop('placeholder', this.options.placeholder)
                    .appendTo(this.$menu);

            this.$select = $('<select multiple size="15" >')
                    .css({'width': '100%', 'margin-top': '6px'})
                    .appendTo(this.$menu);
            if (this.length > this.options.size) {
                this.$buttonloadall = $('<button type="button" class="btn btn-default btn-xs btn-secondary">')
                        .css({'width': '100%', 'margin-top': '10px'})
                        .text('deselect all')
                        .appendTo(this.$menu);
                // load all the list at once 
                this.$buttonloadall.off('click').on('click', $.proxy(function () {
                   this.deselectAll(); 
                   this.$buttontext.html(this.options.text);
                }, this));
            }
            // LOAD ITEMS 
            this.load(this.options.size);

            // EVENT LISTENER 
            var ctrlPressed = false;
            $(window).keydown(function (evt) {
                if (evt.which === 17) {
                    ctrlPressed = true;
                }
            }).keyup(function (evt) {
                if (evt.which === 17) {
                    ctrlPressed = false;
                }
            });
            // on text input, search for options mathcing the text entered 
            // use str.indexOf() for the moment, should use a regex? ==> regex is slower 
            this.$input.off('change paste keyup').on('change paste keyup', $.proxy(function () {
                if (this.$input.val() === "") {
                    this.page = 1;
                    this.load(this.options.size);
                } else {
                    this.page = 1;
                    this.optionPage = 1;
                    this.search(this.$input.val());
                }
            }, this));

            // when values are selected, refill the this.select array to store new selected options 
            this.$select.off('change').on('change', $.proxy(function () {
                var id = [];
                var val = [];
                var count = 0;
                this.$select.children().filter(":selected").each(function (i, selected) {
                    id[i] = parseInt($(selected).prop('id'));
                });
                // if ctrl key is press, keep previous item in selection 
                if (ctrlPressed) {
                    for (var j = 0; j < this.length; j++) {
                        if (id.indexOf(j) !== -1) {
                            this.select[j] = true;
                            val.push(this.options.data[j]);
                        }
                    }
                } else {
                    for (var j = 0; j < this.length; j++) {
                        if (id.indexOf(j) !== -1) {
                            this.select[j] = true;
                            val.push(this.options.data[j]);
                        } else {
                            this.select[j] = false;
                        }
                    }
                }
                for (var k = 0; k < this.length; k++) {
                    if (this.select[k]) {
                        count++;
                    }
                }
                val = val.length === 0 ? null : val;
                this.$element.data('value', val);
                this.$element.data('count', count);
                this.$buttontext.html(val.join(";")); 
                this.$buttonsearch.trigger('multiple_select_change'); // custom event to detect when selected values changed
            }, this));

            // when select bottom is reached after scrolling, load size more items 
            // only do this if the search field is empty 
            this.$select.on('scroll', $.proxy(function () {
                if ((this.$select.scrollTop() + this.$select.innerHeight() >= this.$select[0].scrollHeight) && (this.page * this.options.size < this.length)) {
                    this.scrollAmount = this.$select.scrollTop();
                    if (this.$input.val() === "") {
                        this.appendItems();
                    } else {
                        this.optionPage++;
                        this.search(this.$input.val());
                    }
                }
            }, this));
            // when the menu is cliked, it doesn't hide
            this.$menu.click(function (event) {
                event.stopPropagation();
            });
        },
        // load the first ln items in the select 
        load: function (ln) {
            if (ln === this.length) {
                this.page = (this.length / this.options.size) + 1;
            } else {
                this.page = 1;
            }
            ln = ln > this.length ? this.length : ln;
            var html = '';
            for (var i = 0; i < ln; i++) {
                if (this.select[i]) {
                    html += '<option id="' + i + '" selected>' + this.options.data[i] + '</option>';
                } else {
                    html += '<option id="' + i + '" >' + this.options.data[i] + '</option>';
                }
            }
            this.$select.html(html);
        },
        // append options.size items to the select 
        appendItems: function () {
            var html = '';
            var start = this.page * this.options.size;
            var end = (start + this.options.size) >= this.length ? this.length : (start + this.options.size);
            for (var i = start; i < end; i++) {
                if (this.select[i]) {
                    html += '<option id="' + i + '" selected>' + this.options.data[i] + '</option>';
                } else {
                    html += '<option id="' + i + '" >' + this.options.data[i] + '</option>';
                }
            }
            this.page++;
            this.$select.append(html);
            this.$select.scrollTop(this.scrollAmount);
        },
        // redraw the list to display only options matching user input 
        search: function (input) {
            var html = '';
            var size = this.optionPage * this.options.size;
            var nb_opt = 0;
            for (var i = 0; i < this.length; i++) {
                if ((this.options.data[i].indexOf(input) !== -1) && (nb_opt <= size)) {
                    nb_opt++;
                    if (this.select[i]) {
                        html += '<option id="' + i + '" selected>' + this.options.data[i] + '</option>';
                    } else {
                        html += '<option id="' + i + '" >' + this.options.data[i] + '</option>';
                    }
                }
            }
            this.$select.html(html);
            this.$select.scrollTop(this.scrollAmount);
        },
        // select or deselect all according to bool value ( select all if true) 
        selectAll: function (bool) {
            if (bool === null) {
                bool = true;
            }
            for (var i = 0; i < this.length; i++) {
                this.select[i] = bool;
            }
            this.load(this.options.size);
            this.$element.data('count', 0);
            this.$element.data('value', bool ? this.options.data : null);
            this.$buttonsearch.trigger('multiple_select_change');
        },
        deselectAll: function () {
            this.selectAll(false);
        }
    };
    // eihter trigger a public fonction or call constructor 
    $.fn.selectmultiple = function (methodOrOptions) {
        var args = arguments;
        if (methodOrOptions === 'value') {
            return this.data('value');
        } else if (methodOrOptions === 'count') {
            return this.data('count');
        } else if (methodOrOptions === 'option') {
            return this.data('options');
        }
        return this.each(function () {
            if (typeof methodOrOptions === 'object') {
                $.data(this, 'plugin_' + pluginName, new Selectmultiple(this, methodOrOptions));
            } else if (Selectmultiple.prototype[methodOrOptions]) {
                if (typeof $.data(this, 'plugin_' + pluginName) != 'undefined') {
                    $.data(this, 'plugin_' + pluginName)[methodOrOptions].apply($.data(this, 'plugin_' + pluginName), args);
                }
            } else {
                $.error('Method ' + methodOrOptions + ' does not exist on multiselect');
            }
        });
    };

})(jQuery, window, document);
