import i18n from 'i18n';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FormBuilderModal from 'components/FormBuilderModal/FormBuilderModal';
import * as schemaActions from 'state/schema/SchemaActions';
import PropTypes from 'prop-types';

const sectionConfigKey = 'Silverstripe\\Shortcodable\\Controller\\ShortcodableController';


class InsertShortcodeModal extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount() {
        this.setOverrides(this.props);
    }

    componentWillReceiveProps(props) {
        if (props.isOpen && !this.props.isOpen) {
            this.setOverrides(props);
        }
    }

    componentWillUnmount() {
        this.clearOverrides();
    }

    /**
     * Compares the current properties with received properties and determines if overrides need to be
     * cleared or added.
     *
     * @param {object} props
     */
    setOverrides(props) {
        if (this.props.schemaUrl !== props.schemaUrl) {
            this.clearOverrides();
        }
        if (props.schemaUrl) {
            const attrs = Object.assign({}, props.fileAttributes);
            delete attrs.ID;

            const overrides = {
                fields: Object.entries(attrs).map((field) => {
                    const [name, value] = field;
                    return { name, value };
                }),
            };
            // set overrides into redux store, so that it can be accessed by FormBuilder with the same
            // schemaUrl.
            this.props.actions.schema.setSchemaStateOverrides(props.schemaUrl, overrides);
        }
    }

    /**
     * Generates the properties for the modal
     *
     * @returns {object}
     */
    getModalProps() {
        const props = Object.assign(
            {
                onSubmit: this.handleSubmit,
                onLoadingError: this.handleLoadingError,
                showErrorMessage: true,
                responseClassBad: 'alert alert-danger',
                identifier: 'Shortcodable.AddShortcodeModal',
            },
            this.props,
            {
                className: `insert-embed-modal ${this.props.className}`,
                size: 'lg',
                onClosed: this.props.onClosed,
                title: 'Add short code',
            }
        );
        delete props.sectionConfig;
        delete props.onInsert;
        delete props.fileAttributes;

        return props;
    }

    /**
     * Clear any overrides that may be in place
     */
    clearOverrides() {
        this.props.actions.schema.setSchemaStateOverrides(this.props.schemaUrl, null);
    }

    /**
     * Handler for when loading the form returns an error
     *
     * @param error
     */
    handleLoadingError(error) {
        if (typeof this.props.onLoadingError === 'function') {
            this.props.onLoadingError(error);
        }
    }

    /**
     * Capture submission in the form and stop the default submit behaviour
     *
     * @param data
     * @param action
     * @returns {Promise}
     */
    handleSubmit(data, action) {
        switch (action) {
            case 'action_addshortcode': {
                this.props.onInsert(data);
                break;
            }
            case 'action_cancel': {
                this.props.onClosed();
                break;
            }
            default: {
                // noop
            }
        }

        return Promise.resolve();
    }

    render() {
        return <FormBuilderModal {...this.getModalProps()}/>
    }
}

InsertShortcodeModal.propTypes = {
    sectionConfig: PropTypes.shape({
        url: PropTypes.string,
        form: PropTypes.object,
    }),
    isOpen: PropTypes.bool,
    onInsert: PropTypes.func.isRequired,
    onClosed: PropTypes.func.isRequired,
    className: PropTypes.string,
    actions: PropTypes.object,
    schemaUrl: PropTypes.string.isRequired,
    targetUrl: PropTypes.string,
    onLoadingError: PropTypes.func,
};

InsertShortcodeModal.defaultProps = {
    className: '',
    fileAttributes: {},
};

function mapStateToProps(state, ownProps) {
    const sectionConfig = state.config.sections.find((section) => section.name === sectionConfigKey);

    // get the schemaUrl to use as a key for overrides
    const targetUrl = ownProps.fileAttributes ? ownProps.fileAttributes.Url : '';
    const baseEditUrl = sectionConfig.form.shortCodeEditForm.schemaUrl;

    const editUrl = targetUrl && `${baseEditUrl}/?embedurl=${encodeURIComponent(targetUrl)}`;
    const createUrl = sectionConfig.form.shortCodeEditForm.schemaUrl;

    let schemaUrl = editUrl || createUrl;

    if (typeof ownProps.shortCodeType !== 'undefined') {
        schemaUrl = schemaUrl + '?type='+ownProps.shortCodeType
    }

    return {
        sectionConfig,
        schemaUrl,
        targetUrl,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            schema: bindActionCreators(schemaActions, dispatch),
        },
    };
}

export { InsertShortcodeModal as Component };

export default connect(mapStateToProps, mapDispatchToProps)(InsertShortcodeModal);
