import {Component, createElement, PropTypes as p} from 'react'
import Container from 'immutable-di/container'
import getFunctionName from 'immutable-di/utils/getFunctionName'
import NativeCursor from 'immutable-di/cursors/native'

function pass(p) {
    return p
}

export class RootComponent extends Component {
    static _getState = pass

    static childContextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    getChildContext() {
        return {
            container: this.__container
        }
    }

    constructor(props, context) {
        super(props, context)
        this.__container = props.container
            ? props.container
            : new Container(new NativeCursor(this.constructor._getState(props)))
    }
}


export default function root(getDefaultState) {
    const getState = getDefaultState || pass

    return function rootWrapper(BaseComponent) {
        const dn = BaseComponent.displayName || getFunctionName(BaseComponent)
        class RootComponentWrapper extends RootComponent {
            static displayName = dn + '_root'
            static _getState = getState

            render() {
                return createElement(BaseComponent, this.props)
            }
        }

        RootComponentWrapper.childContextTypes = RootComponent.childContextTypes

        return RootComponentWrapper
    }
}
