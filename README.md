# KyberWidget
Payment button (widget) to allow users to pay for goods from tokens supported by Kyber, yet the merchants/ vendors can accept in whichever token they prefer.

## What does it do
The widget provides a friendly and convenient user interface for users to use ERC20 tokens to pay to an ETH address. Users can use different wallets of choice (for example, keystore, trezor, ledger, private key and metamask) to sign the transaction and make the payment, the widget will broadcast the transaction to the Ethereum network automatically and notify the app (vendors) about the transaction.

## How to use the widget
All you have to do is to place a button with proper url to your website.

Eg.
```
<a href="javascript:void(0);"
 NAME="KyberPay - Powered by KyberNetwork" title="Pay by tokens"
 onClick=window.open("https://developer.kyber.network/widget/payment?receiveAddr=0xFDF28Bf25779ED4cA74e958d54653260af604C20&receiveAmount=1.2&receiveToken=DAI&callback=https://yourwebsite.com/kybercallback&network=ropsten","Ratting","width=550,height=170,0,status=0");>Pay by tokens</a>
```

With that button, when a user click on it, a new window will pop up allowing him/her to do the payment. In this example, we *passed several params to the widget via its url*:

```
https://developer.kyber.network/widget/payment?receiveAddr=0xFDF28Bf25779ED4cA74e958d54653260af604C20&receiveAmount=1.2&receiveToken=DAI&callback=https://yourwebsite.com/kybercallback
```

that helps users to pay `1.2 DAI` equivalent amount of supported tokens (list of supported token will be given at the end of this Readme) to `0xFDF28Bf25779ED4cA74e958d54653260af604C20` (vendor's wallet), after the tx is broadcasted to the network, informations will be submitted to the callback url `https://yourwebsite.com/kybercallback`.

## Params to pass to the Widget
In this version, we only support the widget via a new browser windows thus we can pass params via its url as url query params.
The widget supports following params:
- ***receiveAddr*** (ethereum address with 0x prefix) - vendor's Ethereum wallet, user's payment will be sent there. *Must double check this param very carefully*. its value depend on field `type`
- ***receiveToken*** (string) - token that you (vendor) want to receive, it can be one of supported tokens (such as ETH, DAI, KNC...). If you leave it blank or missing, the users can specify it in the widget interface
- ***receiveAmount*** (float) - the amount of `receiveToken` you (vendor) want your user to pay. If you leave it blank or missing, the users can specify it in the widget interface. It could be useful for undetermined payment or pay-as-you-go payment like a charity, ICO or anything else.
- ***type*** (string) - default: `pay`. Possible value: `pay, swap, buy`. Indicate which app will behave. If value `pay`, Interface will become payment, `receiveAddr` is required. If value `swap`, Interface will be swap, `receiveAddr` must be blank, other cases will cause error. If value `buy`, Interface will be buy token, `receiveAddr` must be blank, `receiveToken` is required. 
- ***callback*** (string) - missing or blank value will prevent the widget to call the callback, the information will not be informed anywhere. Params submit to callback are in `urlencoded` format.
- ***network*** (string) - default: `ropsten`, ethereum network that the widget will run. Possible value: `test, ropsten, production, mainnet`. `test` and `ropsten` will run on Ropsten network. `production, mainnet` will run on Mainnet ethereum. Be carefull for this param! 
- ***paramForwarding*** (bool) - default: `true`, if it is true, all params that were passed to the widget will be submitted via the `callback`. It is useful that you can give your user a secret token (ideally one time token) to pass to the callback just so you know the callback is not coming from a malicious actor.
- ***signer*** (string) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.
- ***commissionId*** - Ethereum address - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.
- ***productName*** - String - Name of product
- ***productAvatar*** - String - Avatar of product
## Supported tokens
- OMG
- KNC
- SNT
- ELF
- POWR
- MANA
- BAT
- REQ
- GTO
- RDN
- APPC
- ENG
- SALT
- BQX
- ADX
- AST
- RCN
- ZIL
- DAI
- LINK
- IOST
- STORM
- MOT
- DGX
- ABT
- ENJ
- AION
- AE
- BLZ
- PAL
- ELEC
- BBO
- POLY
- LBA
- EDU
- CVC
- WAX
- SUB
- POE
- PAY
- CHAT
- DTA
- BNT
- TUSD
- TOMO
- MDS
- LEND
- WINGS
- MTL
- WABI
- ETH
