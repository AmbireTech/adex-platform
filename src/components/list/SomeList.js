
// import React, { Component } from 'react'
// import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import * as actions from './../../actions/itemActions'
// import { ItemsTypes } from './../../constants/itemsTypes'
// // import Card from './../collection/Card'
// // import NewUnitForm from './../forms/NewUnitForm'
// // import Rows from './../collection/Rows'
// import { IconButton } from 'react-toolbox/lib/button'
// import { compose } from 'recompose'

// const VIEW_MODE = 'unitsRowsView'

// class SomeList extends Component {
//     constructor(props, context) {
//         super(props, context);

//         this.state = {
//             items: [],
//             page: 0,
//             isLoading: false,
//             isError: false,
//         }
//     }

//     onPaginatedSearch(e) {
//         console.log('e-hoi', e)
//         this.setState({ page: this.state.page + 1 })
//     }

//     toggleView() {
//         // this.props.actions.updateUi(VIEW_MODE, !this.props.rowsView)
//     }

//     render() {
//         let items = this.props.items
//             .filter((i) => !!i && !!i._meta && !i._meta.deleted)
//             // .sort((a, b) => b._id - a._id)
//             .slice(this.state.page * 10, (this.state.page * 10) + 10)

//         console.log('items', items)

//         return (
//             <div>
//                 <h1>All units </h1>
//                 <div>
//                     {/* <NewUnitForm addCampaign={this.props.actions.addCampaign} btnLabel="Add new Unit" title="Add new unit" /> */}
//                     <IconButton icon='view_module' primary onClick={this.toggleView} />
//                     <IconButton icon='view_list' primary onClick={this.toggleView} />
//                 </div>

//                 <AdvancedList
//                     list={items}
//                     isError={this.state.isError}
//                     isLoading={this.state.isLoading}
//                     page={this.state.page}
//                     onPaginatedSearch={this.onPaginatedSearch.bind(this)}
//                 />
//             </div>
//         )
//     }
// }

// SomeList.propTypes = {
//     // actions: PropTypes.object.isRequired,
//     // account: PropTypes.object.isRequired,
//     items: PropTypes.array.isRequired,
//     // rowsView: PropTypes.bool.isRequired
// };

// const List = ({ list }) =>
//     <div className="list">
//         {list.map(item => <div className="list-row" key={item._id}>
//             <h3 >{item._name}</h3>
//         </div>)}
//     </div>

// const withLoading = (conditionFn) => (Component) => (props) =>
//     <div>
//         <Component {...props} />

//         <div className="interactions">
//             {conditionFn(props) && <span>Loading...</span>}
//         </div>
//     </div>

// const withPaginated = (conditionFn) => (Component) => (props) =>
//     <div>


//         <div className="interactions">
//             {
//                 conditionFn(props) &&
//                 <div>
//                     {/* <div>
//                         Something went wrong...
//                      </div> */}
//                     <button
//                         type="button"
//                         onClick={props.onPaginatedSearch}
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             }
//         </div>

//         <Component {...props} />
//     </div>

// const withInfiniteScroll = (conditionFn) => (Component) =>
//     class WithInfiniteScroll extends React.Component {
//         componentDidMount() {
//             window.addEventListener('scroll', this.onScroll, true);
//         }

//         componentWillUnmount() {
//             window.removeEventListener('scroll', this.onScroll, true);
//         }

//         onScroll = () => {
//             console.log('onScroll')
//             conditionFn(this.props) && this.props.onPaginatedSearch();

//         }

//         render() {
//             return <Component {...this.props} />;
//         }
//     }

// const paginatedCondition = props =>
//     props.page !== null //&& !props.isLoading && props.isError;

// const infiniteScrollCondition = props => {
//     console.log('window.innerHeight', window.innerHeight)
//     console.log('window.scrollY', window.scrollY)
//     console.log('document.body.offsetHeight ', document.body.offsetHeight)
//     return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)
//         && props.list.length
//     // && !props.isLoading
//     // && !props.isError;
// }

// const loadingCondition = props =>
//     props.isLoading;

// const AdvancedList = compose(
//     withPaginated(paginatedCondition),
//     withInfiniteScroll(infiniteScrollCondition),
//     // withLoading(loadingCondition),
// )(List);


// function mapStateToProps(state) {
//     // console.log('mapStateToProps Campaigns', state)
//     return {
//         // account: state.account,
//         items: state.items[ItemsTypes.AdUnit.id],
//         // rowsView: !!state.ui[VIEW_MODE]
//     };
// }

// function mapDispatchToProps(dispatch) {
//     return {
//         actions: bindActionCreators(actions, dispatch)
//     };
// }

// export default connect(
//     mapStateToProps,
//     mapDispatchToProps
// )(SomeList);
