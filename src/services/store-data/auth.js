// import configureStore from 'store/configureStore'
import actions from 'actions'

export const logOut = () => {
    actions.execute(actions.resetAccount())
    actions.execute(actions.resetAllItems())
    actions.execute(actions.resetAllBids())
}