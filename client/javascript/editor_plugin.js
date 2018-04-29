(function () {
    if (typeof tinymce !== 'undefined') {
        
        var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

        // Used when there is no 'main' module.
        // The name is probably (hopefully) unique so minification removes for releases.
        var register_3795 = function (id) {
            var module = dem(id);
            var fragments = id.split('.');
            var target = Function('return this;')();
            for (var i = 0; i < fragments.length - 1; ++i) {
                if (target[fragments[i]] === undefined)
                    target[fragments[i]] = {};
                target = target[fragments[i]];
            }
            target[fragments[fragments.length - 1]] = module;
        };

        var instantiate = function (id) {
            var actual = defs[id];
            var dependencies = actual.deps;
            var definition = actual.defn;
            var len = dependencies.length;
            var instances = new Array(len);
            for (var i = 0; i < len; ++i)
                instances[i] = dem(dependencies[i]);
            var defResult = definition.apply(null, instances);
            if (defResult === undefined)
                throw 'module [' + id + '] returned undefined';
            actual.instance = defResult;
        };

        var def = function (id, dependencies, definition) {
            if (typeof id !== 'string')
                throw 'module id must be a string';
            else if (dependencies === undefined)
                throw 'no dependencies for ' + id;
            else if (definition === undefined)
                throw 'no definition function for ' + id;
            defs[id] = {
                deps: dependencies,
                defn: definition,
                instance: undefined
            };
        };

        var dem = function (id) {
            console.log(defs);
            var actual = defs[id];
            if (actual === undefined)
                throw 'module [' + id + '] was undefined';
            else if (actual.instance === undefined)
                instantiate(id);
            return actual.instance;
        };

        var req = function (ids, callback) {
            var len = ids.length;
            var instances = new Array(len);
            for (var i = 0; i < len; ++i)
                instances.push(dem(ids[i]));
            callback.apply(null, callback);
        };

        var ephox = {};

        ephox.bolt = {
            module: {
                api: {
                    define: def,
                    require: req,
                    demand: dem
                }
            }
        };

        var define = def;
        var require = req;
        var demand = dem;
        // this helps with minificiation when using a lot of global references
        var defineGlobal = function (id, ref) {
            define(id, [], function () { return ref; });
        };
        /*jsc
         ["tinymce.plugins.hr.Plugin","tinymce.core.PluginManager","global!tinymce.util.Tools.resolve"]
         jsc*/
        defineGlobal("global!tinymce.util.Tools.resolve", tinymce.util.Tools.resolve);
        /**
         * ResolveGlobal.js
         *
         * Released under LGPL License.
         * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
         *
         * License: http://www.tinymce.com/license
         * Contributing: http://www.tinymce.com/contributing
         */

        define(
            'tinymce.core.PluginManager',
            [
                'global!tinymce.util.Tools.resolve'
            ],
            function (resolve) {
                return resolve('tinymce.PluginManager');
            }
        );


        define(
            'tinymce.plugins.shortcodable',
            [
                'tinymce.core.PluginManager'
            ],
            function (PluginManager) {
                PluginManager.add('shortcodable', function (editor) {

                    var me = tinyMCE.activeEditor.plugins.shortcodable;


                    editor.addButton('shortcodable', {
                        title: 'Insert Shortcode',
                        cmd: 'shortcodable',
                        'class': 'mce_shortcode'
                    });

                    editor.addCommand('shortcodable', function (ed) {
                        jQuery('#' + this.id).entwine('ss').openShortcodeDialog();
                    });


                    /*
                    // On load replace shorcode with placeholder.
                    editor.onLoadContent.add(function (ed, o) {
                        var newContent = me.replaceShortcodesWithPlaceholders(o.content, ed);
                        ed.execCommand('mceSetContent', false, newContent, false);
                    });

                    editor.onDblClick.add(function (ed, e) {
                        var dom = ed.dom, node = e.target;
                        if (node.nodeName === 'IMG' && dom.hasClass(node, 'shortcode-placeholder') && e.button !== 2) {
                            ed.execCommand('shortcodable');
                        }
                    });
                    */


                    return function (node, editor) {

                        function getInfo () {
                            return {
                                longname: 'Shortcodable - Shortcode UI plugin for SilverStripe',
                                author: 'Shea Dawson',
                                authorurl: 'http://www.livesource.co.nz/',
                                infourl: 'http://www.livesource.co.nz/',
                                version: "1.0"
                            };
                        }

                        // get an attribute from a shortcode string by it's key
                        function getAttribute(string, key) {
                            var attr = new RegExp(key + '=\"([^\"]+)\"', 'g').exec(string);
                            return attr ? tinymce.DOM.decode(attr[1]) : '';
                        }

                        // replace placeholder tags with shortcodes
                        function replacePlaceholdersWithShortcodes(co) {
                            var content = jQuery(co);
                            content.find('.shortcode-placeholder').each(function () {
                                var el = jQuery(this);
                                var shortCode = '[' + tinymce.trim(el.attr('title')) + ']';
                                el.replaceWith(shortCode);
                            });
                            var originalContent = '';
                            content.each(function () {
                                if (this.outerHTML !== undefined) {
                                    originalContent += this.outerHTML;
                                }
                            });
                            return originalContent;
                        }

                        function replaceShortcodesWithPlaceholders (content, editor) {
                            var plugin = tinyMCE.activeEditor.plugins.shortcodable;
                            var placeholderClasses = jQuery('#' + editor.id).entwine('ss').getPlaceholderClasses();

                            if (placeholderClasses) {
                                return content.replace(/\[([a-z_]+)\s*([^\]]*)\]/gi, function (found, name, params) {
                                    var id = plugin.getAttribute(params, 'id');
                                    if (placeholderClasses.indexOf(name) != -1) {
                                        var src = encodeURI('admin/shortcodable/shortcodePlaceHolder/' + name + '/' + id + '?Shortcode=[' + name + ' ' + params + ']');
                                        var img = jQuery('<img/>')
                                            .attr('class', 'shortcode-placeholder mceItem')
                                            .attr('title', name + ' ' + params)
                                            .attr('src', src);
                                        return img.prop('outerHTML');
                                    }

                                    return found;
                                });
                            } else {
                                return content;
                            }
                        };


                        return {
                            getInfo                             : getInfo,
                            replaceShortcodesWithPlaceholders   : replaceShortcodesWithPlaceholders,
                            replacePlaceholdersWithShortcodes   : replacePlaceholdersWithShortcodes,
                            getAttribute                        : getAttribute
                        };
                    }



                });


                return function () { };
            }
        );




        /*
        tinymce.create('tinymce.plugins.shortcodable', {
            getInfo: function () {
                return {
                    longname: 'Shortcodable - Shortcode UI plugin for SilverStripe',
                    author: 'Shea Dawson',
                    authorurl: 'http://www.livesource.co.nz/',
                    infourl: 'http://www.livesource.co.nz/',
                    version: "1.0"
                };
            },

            init: function (ed, url) {
                var me = tinyMCE.activeEditor.plugins.shortcodable;

                ed.addButton('shortcodable', {
                    title: 'Insert Shortcode',
                    cmd: 'shortcodable',
                    'class': 'mce_shortcode'
                });

                ed.addCommand('shortcodable', function (ed) {
                    jQuery('#' + this.id).entwine('ss').openShortcodeDialog();
                });

                // On load replace shorcode with placeholder.
                ed.onLoadContent.add(function (ed, o) {
                    var newContent = me.replaceShortcodesWithPlaceholders(o.content, ed);
                    ed.execCommand('mceSetContent', false, newContent, false);
                });

                ed.onDblClick.add(function (ed, e) {
                    var dom = ed.dom, node = e.target;
                    if (node.nodeName === 'IMG' && dom.hasClass(node, 'shortcode-placeholder') && e.button !== 2) {
                        ed.execCommand('shortcodable');
                    }
                });
            },

            // replace shortcode strings with placeholder images
            replaceShortcodesWithPlaceholders: function (content, editor) {
                var plugin = tinyMCE.activeEditor.plugins.shortcodable;
                var placeholderClasses = jQuery('#' + editor.id).entwine('ss').getPlaceholderClasses();

                if (placeholderClasses) {
                    return content.replace(/\[([a-z_]+)\s*([^\]]*)\]/gi, function (found, name, params) {
                        var id = plugin.getAttribute(params, 'id');
                        if (placeholderClasses.indexOf(name) != -1) {
                            var src = encodeURI('admin/shortcodable/shortcodePlaceHolder/' + name + '/' + id + '?Shortcode=[' + name + ' ' + params + ']');
                            var img = jQuery('<img/>')
                                .attr('class', 'shortcode-placeholder mceItem')
                                .attr('title', name + ' ' + params)
                                .attr('src', src);
                            return img.prop('outerHTML');
                        }

                        return found;
                    });
                } else {
                    return content;
                }
            },

            // replace placeholder tags with shortcodes
            replacePlaceholdersWithShortcodes: function (co) {
                var content = jQuery(co);
                content.find('.shortcode-placeholder').each(function () {
                    var el = jQuery(this);
                    var shortCode = '[' + tinymce.trim(el.attr('title')) + ']';
                    el.replaceWith(shortCode);
                });
                var originalContent = '';
                content.each(function () {
                    if (this.outerHTML !== undefined) {
                        originalContent += this.outerHTML;
                    }
                });
                return originalContent;
            },

            // get an attribute from a shortcode string by it's key
            getAttribute: function (string, key) {
                var attr = new RegExp(key + '=\"([^\"]+)\"', 'g').exec(string);
                return attr ? tinymce.DOM.decode(attr[1]) : '';
            }
        });
        */

        // Adds the plugin class to the list of available TinyMCE plugins
        dem('tinymce.plugins.shortcodable')();
        console.log(tinymce.PluginManager);
        // tinymce.PluginManager.add("shortcodable", tinymce.plugins.shortcodable);
    }
})();
