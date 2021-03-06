import {createElement, Component} from 'react'
import {Factory, Facet} from 'immutable-di/define'
import {IDeps} from 'immutable-di/asserts'
import getFunctionName from 'immutable-di/utils/getFunctionName'
import Container from 'immutable-di/container'
import NativeCursor from 'immutable-di/cursors/native'

class LocalStateComponent extends Component {
    static stateMap = {}

    static getDefaultState = null

    constructor(props, context) {
        super(props, context)
        function pass(state) {
            return state
        }
        this.__setState = ::this.__setState
        const {stateMap, displayName, getDefaultState} = this.constructor
        const Getter = Facet(stateMap, displayName)(pass)
        this.__listener = Factory(stateMap, displayName)(this.__setState)

        this.__container = new Container(new NativeCursor(getDefaultState(props)), {isSynced: true})

        this.state = {...props, ...this.__container.get(Getter)}
        this.__isMounted = false
    }

    __setState(state) {
        if (!this.__isMounted) {
            throw new Error('setState invoked, but component is not mounted: ' + this.constructor.displayName)
        } else {
            this.setState(state)
        }
    }

    componentWillReceiveProps(props) {
        this.__setState(props)
    }

    componentDidMount() {
        this.__isMounted = true
        this.__container.mount(this.__listener)
    }

    componentWillUnmount() {
        this.__isMounted = false
        this.__container.unmount(this.__listener)
    }
}

function passState() {
    return {}
}

export default function localstate(stateMap = {}, getDefaultState) {
    IDeps(stateMap)
    return function wrapComponent(BaseComponent) {
        const dn = BaseComponent.displayName || getFunctionName(BaseComponent)

        return class LocalStateComponentWrapper extends LocalStateComponent {
            static displayName = dn + '_localstate'
            static stateMap = stateMap
            static getDefaultState = getDefaultState || passState

            render() {
                return createElement(BaseComponent, this.state)
            }
        }
    }
}
