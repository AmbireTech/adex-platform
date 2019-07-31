import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import Chip from '@material-ui/core/Chip'
import Helper from 'helpers/miscHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class WalletCheck extends Component {

	constructor(props, context) {
		super(props, context)

		const words = props.identity.mnemonic.split(' ')
		this.state = {
			shuffledWords: Helper.shuffleArray(words)
				.map((word, index) => { return { word: word, used: false, index: index } }),
			userWords: [],
			wordsChecked: false
		}
	}

	componentDidMount() {
		this.props.validate('mnemonicChecked', {
			isValid: !!this.props.identity.mnemonicChecked,
			err: { msg: 'ERR_MNEMONIC_NOT_CHECKED' },
			dirty: false
		})
	}

    validateMnemonic = (valid) => {
    	this.props.handleChange('mnemonicChecked', true)
    	this.props.validate('mnemonicChecked', {
    		isValid: valid
    	})
    }

    checkWordsOrder = (userWords) => {
    	const checked = userWords.map(word => word.word).join(' ') === this.props.identity.mnemonic
    	if(checked) {
    		this.validateMnemonic(true)
    	}
        
    	return checked
    }

    addUserWord = (word, index) => {
    	const shuffledWords = [...this.state.shuffledWords]
    	const usedWord = { ...shuffledWords[index] }
    	usedWord.used = true
    	shuffledWords[index] = usedWord
    	const userWord = { ...word }
    	userWord.index = index

    	const userWords = [...this.state.userWords, userWord]
    	const wordsChecked = this.checkWordsOrder(userWords)

    	this.setState({
    		userWords: userWords,
    		shuffledWords: shuffledWords,
    		wordsChecked: wordsChecked
    	})
    }

    removeUserWord = (word, index) => {
    	const userWord = { ...word }
    	const usedWord = { ...this.state.shuffledWords[userWord.index] }
    	usedWord.used = false

    	const shuffledWords = [...this.state.shuffledWords]
    	shuffledWords[userWord.index] = usedWord

    	const userWords = ([...this.state.userWords])
    	userWords.splice(index, 1)

    	const wordsChecked = this.checkWordsOrder(userWords)
    	this.setState({
    		userWords: userWords,
    		shuffledWords: shuffledWords,
    		wordsChecked: wordsChecked
    	})
    }

    ShuffledWords = () => {
    	return (
    		<div>
    			{this.state.shuffledWords.map((word, index) =>
    				<Chip
    					color={word.used ? 'default' : 'primary'}
    					clickable={!word.used}
    					disabled={!!word.used}
    					key={index}
    					label={word.word}
    					onClick={!word.used ? this.addUserWord.bind(this, word, index) : null}
    				/>
    			)}
    		</div>
    	)
    }

    OrderedWords = () => {
    	return (
    		<div>
    			{this.state.userWords.map((word, index) =>
    				<Chip
    					color='secondary'
    					key={word + index}
    					label={word.word}
    					onDelete={this.removeUserWord.bind(this, word, index)}
    				/>)}
    		</div>
    	)
    }

    render() {
    	const { t } = this.props
    	const { wordsChecked } = this.state
    	return (
    		<div>
    			<this.ShuffledWords />
    			<this.OrderedWords />
    			{wordsChecked &&
                    <Typography paragraph variant='subheading'>
                    	{t('WALLET_WORDS_CHECK_SUCCESS')}
                    </Typography>
    			}
    		</div>
    	)
    }
}

WalletCheck.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	let persist = state.persist
	let memory = state.memory
	return {
		account: persist.account,
		wallet: memory.wallet
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const IdentityWalletCheckStep = IdentityHoc(WalletCheck)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityWalletCheckStep)))