import React from "react"
import { connect } from "react-redux"
import { push } from 'react-router-redux'
import constants from "../../services/constants"
import AddressGenerator from "../../services/device/addressGenerator";
import { ImportByDeviceView } from "../../components/ImportAccount"
import {
  importNewAccount,
  importLoading,
  closeImportLoading,
  throwError,
  checkTimeImportLedger,
  resetCheckTimeImportLedger,
  setWallet
} from "../../actions/accountActions"
import { toEther } from "../../utils/converter"
import { getTranslate } from 'react-localize-redux'
import bowser from 'bowser';
import { roundingNumber } from "../../utils/converter";

@connect((store, props) => {
  var tokens = store.tokens.tokens
  var supportTokens = []
  Object.keys(tokens).forEach((key) => {
    supportTokens.push(tokens[key])
  })
  return {
    ethereumNode: store.connection.ethereum,
    account: store.account,
    tokens: supportTokens,
    deviceService: props.deviceService,
    translate: getTranslate(store.locale),
    screen: props.screen
  }
})
export default class ImportByDevice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addresses: [],
      currentAddresses: [],
      isFirstList: true,
    }
    this.setDeviceState();

    this.DPATH = [
      { path: "m/44'/60'/0'/0", desc: 'Jaxx, Metamask, Exodus, imToken, TREZOR (ETH) & Digital Bitbox', defaultType: 'trezor' },
      { path: "m/44'/60'/0'", desc: 'Ledger (ETH)', defaultType: 'ledger' },
      { path: "m/44'/61'/0'/0", desc: 'TREZOR (ETC)' },
      { path: "m/44'/60'/160720'/0'", desc: 'Ledger (ETC)' },
      { path: "m/0'/0'/0'", desc: 'SingularDTV', notSupport: true },
      { path: "m/44'/1'/0'/0", desc: 'Network: Testnets' },
      { path: "m/44'/40'/0'/0", desc: 'Network: Expanse', notSupport: true },
      { path: 0, desc: 'modal.custom_path', defaultP: "m/44'/60'/1'/0", custom: false },
    ]
  }

  componentDidMount() {
    this.showLoading(this.props.type);
  }
  componentWillUnmount () {
    clearInterval(this.interval)
  }
  setDeviceState() {
    this.addressIndex = 0;
    this.currentIndex = 0;
    this.walletType = 'trezor';
    this.generator = null;
  }

  updateBalance() {
    this.interval = setInterval(() => {
      this.state.addresses.forEach((address, index) => {
        this.addBalance(address.addressString, index);
      })
    }, 10000)
  }

  connectDevice(walletType, selectedPath, dpath) {
    this.setDeviceState();
    if (!this.props.deviceService) {
      this.props.dispatch(throwError("cannot find device service"))
      return
    }
    this.props.deviceService.getPublicKey(selectedPath, this.state.modalOpen)
      .then((result) => {
        this.dPath = (dpath != 0) ? result.dPath : dpath;
        this.generateAddress(result);
        this.props.dispatch(closeImportLoading());
      })
      .catch((err) => {
        this.props.dispatch(throwError(err))
        this.props.dispatch(closeImportLoading());
        if(this.walletType == 'ledger'){
          clearTimeout(this.ledgerLoading);
          this.props.dispatch(resetCheckTimeImportLedger())
        }
      })
    this.walletType = walletType;
  }

  generateAddress(data) {
    this.generator = new AddressGenerator(data);
    let addresses = [];
    let index = 0;

    for (index; index < 5; index++) {
      let address = {
        addressString: this.generator.getAddressString(index),
        index: index,
        balance: -1,
      };
      const shouldSetWallet = index === 0 ? true : false;

      addresses.push(address);
      this.addBalance(address.addressString, index, shouldSetWallet);
    }
    this.addressIndex = index;
    this.currentIndex = index;

    this.setState({
      addresses: addresses,
      currentAddresses: addresses
    })
    if (!this.state.modalOpen) this.openModal();
  }

  openModal() {
    if(this.walletType == 'ledger'){
      clearTimeout(this.ledgerLoading);
      this.props.dispatch(resetCheckTimeImportLedger())
    }
    this.setState({
      modalOpen: true,
    })
    this.updateBalance();
  }

  closeModal() {
    this.setState({
      modalOpen: false,
    })
    clearInterval(this.interval);
  }

  moreAddress() {
    let addresses = this.state.addresses,
      i = this.addressIndex,
      j = i + 5,
      currentAddresses = [];
    if (this.generator) {
      if (this.addressIndex == this.currentIndex) {
        for (i; i < j; i++) {
          let address = {
            addressString: this.generator.getAddressString(i),
            index: i,
            balance: -1,
          };
          addresses.push(address);
          currentAddresses.push(address);
          this.addBalance(address.addressString, i);

        }
      }
      this.addressIndex = i;
      this.currentIndex += 5;
      this.setState({
        addresses: addresses,
        currentAddresses: addresses.slice(this.currentIndex - 5, this.currentIndex)
      })
      if (this.state.isFirstList) {
        this.setState({
          isFirstList: false
        })
      }
    } else {
      this.props.dispatch(throwError('Cannot connect to ' + this.walletType))
    }
  }

  preAddress() {
    let addresses = this.state.addresses;
    if (this.currentIndex > 5) {
      this.currentIndex -= 5;
      this.setState({
        currentAddresses: addresses.slice(this.currentIndex - 5, this.currentIndex),
      })
    }
    if (this.currentIndex <= 5) {
      this.setState({
        isFirstList: true
      })
    }
  }

  getAddress() {
    this.props.dispatch(importNewAccount(
      this.props.account.wallet.address,
      this.walletType,
      this.dPath + '/' + this.props.account.wallet.index
    ))
  }

  setWallet(index, address, balance, type) {
    const wallet = {
      index: index,
      address: address,
      balance: roundingNumber(balance),
      type: type
    }

    this.props.dispatch(setWallet(wallet));
  }

  choosePath(selectedPath, dpath) {
    this.props.dispatch(importLoading());
    this.connectDevice(this.walletType, selectedPath, dpath);
  }

  getBalance(address) {
    return new Promise((resolve, reject) => {
      this.props.ethereumNode.call("getBalanceAtLatestBlock",address).then(balance => {
        resolve(toEther(balance))
      }).catch(err => console.log)
    })
  }

  addBalance(address, index, shouldSetWallet = false) {
    this.getBalance(address)
      .then((result) => {
        let addresses = this.state.addresses;
        addresses[index].balance = result;

        if (shouldSetWallet) {
          this.setWallet(index, address, result, this.walletType);
        }

        this.setState({
          currentList: addresses
        })
      })
  }

  showLoading(walletType) {
    let browser = bowser.name;
    this.props.dispatch(resetCheckTimeImportLedger())
    if (walletType == 'ledger') {
      if (browser != 'Chrome') {
        let erroMsg = this.props.translate("error.browser_not_support_ledger", { browser: browser }) || `Ledger is not supported on ${browser}, you can use Chrome instead.`
        this.props.dispatch(throwError(erroMsg));
        return;
      }
      this.props.dispatch(importLoading());
      this.connectDevice(walletType);
      this.ledgerLoading = setTimeout(() => {
        this.props.dispatch(checkTimeImportLedger())
      }, 6000);
    } else {
      this.props.dispatch(importLoading());
      this.connectDevice(walletType);
    }
  }

  render() {
    return (
      <ImportByDeviceView
        error={this.props.account.error}
        hasError={this.props.account.showError}
        isLoading={this.props.account.loading}
        isFirstList={this.state.isFirstList}
        getPreAddress={() => this.preAddress()}
        getMoreAddress={() => this.moreAddress()}
        dPath={this.DPATH}
        currentDPath={this.dPath}
        wallet={this.props.account.wallet}
        setWallet={this.setWallet.bind(this)}
        currentAddresses={this.state.currentAddresses}
        walletType={this.walletType}
        choosePath={this.choosePath.bind(this)}
        getAddress={this.getAddress.bind(this)}
        translate={this.props.translate}
        onCloseImportAccount={this.props.onCloseImportAccount}
        chosenImportAccount={this.props.account.chosenImportAccount}
      />
    )
  }
}
