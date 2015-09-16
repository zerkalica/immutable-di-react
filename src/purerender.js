import deepEqual from 'deeper'

function shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(this.props, nextProps)
}

export default function purerender(Component) {
    Component.prototype.shouldComponentUpdate = shouldComponentUpdate

    return Component
}
