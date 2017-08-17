import React, {Component} from "react";
import PubSub from "pubsub-js";

export default class InputLabel extends Component {
    constructor() {
        super();
        this.state = {errorMsg: ''};
    }

    render() {
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input {...this.props}/>
                <span className="danger">{this.state.errorMsg}</span>
            </div>
        );
    }

    componentDidMount() {
        PubSub.subscribe('field-error', (topic, error) => {
            if (error.field === this.props.name) {
                this.setState({errorMsg: error.defaultMessage});
            }
        });
        PubSub.subscribe('clear-errors', () => {
            this.setState({errorMsg: ''});
        });
    }
}