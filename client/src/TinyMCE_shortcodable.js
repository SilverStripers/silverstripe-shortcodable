import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadComponent } from 'lib/Injector';
import ShortcodeSerialiser from 'lib/ShortcodeSerialiser';
import InsertShortCodeModal from 'components/InsertShortcodeModal';
import i18n from 'i18n';


const InjectableInsertShortcodeModal = loadComponent(InsertShortCodeModal);
const filter = 'div[data-shortcode="embed"]';

(() => {
    const ssembed = {
        init: (editor, url) => {
            editor.addButton('shortcodable', {
                title: "Short Code",
                image: url.replace('dist', '') + 'images/shortcodable.png',
                cmd: 'shortcodable',
            });

            editor.addCommand('shortcodable', () => {
                // See HtmlEditorField.js
                $(`#${editor.id}`).entwine('ss').openShortCodeDialog();
            });

            // Replace the tinymce default media commands with the ssembed command
            editor.on('BeforeExecCommand', (e) => {
                const cmd = e.command;
                const ui = e.ui;
                const val = e.value;
            });

            editor.on('SaveContent', (o) => {
                const content = $(`<div>${o.content}</div>`);

                o.content = content.html();
            });
            editor.on('BeforeSetContent', (o) => {
                let content = o.content;

                o.content = content;
            });
        },

    };

    tinymce.PluginManager.add('shortcodable', (editor, url) => ssembed.init(editor, url));
})();


$.entwine('ss', ($) => {
    let dialog = null;

    $('select.shortcode-type').entwine({
        onchange: function(){
            console.log('test');
            dialog.entwine('ss').close();
            // this.parents('form:first').reloadForm('type', this.val());
        }
    });

    $('textarea.htmleditor').entwine({
        openShortCodeDialog: function() {
            dialog = $('#insert-shortcode-react__dialog-wrapper');

            if (!dialog.length) {
                dialog = $('<div id="insert-shortcode-react__dialog-wrapper" />');
                $('body').append(dialog);
            }

            dialog.open();
            return;
        },
    });
    $('.js-injector-boot #insert-shortcode-react__dialog-wrapper').entwine({
        Element: null,

        Data: {},

        onunmatch() {
            // solves errors given by ReactDOM "no matched root found" error.
            this._clearModal();
        },

        _clearModal() {
            ReactDOM.unmountComponentAtNode(this[0]);
            // this.empty();
        },

        open() {
            this._renderModal(true);
        },

        close() {
            this.setData({});
            this._renderModal(false);
        },

        /**
         * Renders the react modal component
         *
         * @param {boolean} isOpen
         * @private
         */
        _renderModal(isOpen) {
            const handleHide = () => this.close();
            // Inserts embed into page
            const handleInsert = (...args) => this._handleInsert(...args);
            // Create edit form from url
            const handleCreate = (...args) => this._handleCreate(...args);
            const handleLoadingError = (...args) => this._handleLoadingError(...args);
            const attrs = this.getOriginalAttributes();

            // create/update the react component
            ReactDOM.render(
                <InjectableInsertShortcodeModal
                    isOpen={isOpen}
                    onCreate={handleCreate}
                    onInsert={handleInsert}
                    onClosed={handleHide}
                    onLoadingError={handleLoadingError}
                    bodyClassName="modal__dialog"
                    className="insert-shortcode-react__dialog-wrapper"
                    fileAttributes={attrs}
                />,
                this[0]
            );
        },

        _handleLoadingError() {
            this.setData({});
            this.open();
        },

        /**
         * Handles inserting the selected file in the modal
         *
         * @param {object} data
         * @returns {Promise}
         * @private
         */
        _handleInsert(data) {
            const oldData = this.getData();
            // this.setData(Object.assign({ Url: oldData.Url }, data));
            this.insertRemote();
            this.close();
        },

        _handleCreate(data) {
            this.setData(Object.assign({}, this.getData(), data));
            this.open();
        },

        /**
         * Find the selected node and get attributes associated to attach the data to the form
         *
         * @returns {object}
         */
        getOriginalAttributes() {
            const data = this.getData();
            const $field = this.getElement();
            if (!$field) {
                return data;
            }

            const node = $($field.getEditor().getSelectedNode());
            if (!node.length) {
                return data;
            }

            // Find root embed shortcode
            const element = node.closest(filter).add(node.filter(filter));
            if (!element.length) {
                return data;
            }
            const image = element.find('img.placeholder');
            // If image has been removed then this shortcode is invalid
            if (image.length === 0) {
                return data;
            }

            const caption = element.find('.caption').text();
            const width = parseInt(image.width(), 10);
            const height = parseInt(image.height(), 10);

            return {
                Url: element.data('url') || data.Url,
                CaptionText: caption,
                PreviewUrl: image.attr('src'),
                Width: isNaN(width) ? null : width,
                Height: isNaN(height) ? null : height,
                Placement: this.findPosition(element.prop('class')),
            };
        },

        /**
         * Calculate placement from css class
         */
        findPosition(cssClass) {
            const alignments = [
                'leftAlone',
                'center',
                'rightAlone',
                'left',
                'right',
            ];
            if (typeof cssClass !== 'string') {
                return '';
            }
            const classes = cssClass.split(' ');
            return alignments.find((alignment) => (
                classes.indexOf(alignment) > -1
            ));
        },

        insertRemote() {
            const $field = this.getElement();
            if (!$field) {
                return false;
            }
            const editor = $field.getEditor();
            if (!editor) {
                return false;
            }

            const data = this.getData();

            // Add base div
            const base = $('<div/>')
                .attr('data-url', data.Url)
                .attr('data-shortcode', 'embed')
                .addClass(data.Placement)
                .addClass('ss-htmleditorfield-file embed');

            // Add placeholder image
            const placeholder = $('<img />')
                .attr('src', data.PreviewUrl)
                .addClass('placeholder');

            // Set dimensions
            if (data.Width) {
                placeholder.attr('width', data.Width);
            }
            if (data.Height) {
                placeholder.attr('height', data.Height);
            }

            // Add to base
            base.append(placeholder);

            // Add caption p tag
            if (data.CaptionText) {
                const caption = $('<p />')
                    .addClass('caption')
                    .text(data.CaptionText);
                base.append(caption);
            }

            // Find best place to put this embed
            const node = $(editor.getSelectedNode());
            let replacee = $(null);
            if (node.length) {
                replacee = node.filter(filter);

                // Find find closest existing embed
                if (replacee.length === 0) {
                    replacee = node.closest(filter);
                }

                // Fail over to check if the node is an image
                if (replacee.length === 0) {
                    replacee = node.filter('img.placeholder');
                }
            }

            // Inject
            if (replacee.length) {
                replacee.replaceWith(base);
            } else {
                // Otherwise insert the whole HTML content
                editor.repaint();
                editor.insertContent($('<div />').append(base.clone()).html(), { skip_undo: 1 });
            }

            editor.addUndo();
            editor.repaint();

            return true;
        },
    });

});
