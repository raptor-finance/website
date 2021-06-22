import * as React from 'react';

import { WithTranslation, withTranslation, Trans } from 'react-i18next';
import { BaseComponent } from '../shellInterfaces';
import { Fade } from 'react-reveal';

import './faqComponent.css';

export type FaqProps = {};
export type FaqState = {};

class FaqComponent extends BaseComponent<FaqProps & WithTranslation, FaqState> {

  constructor(props) {
    super(props);
  }

  render() {
    const t = this.readProps().t
    return <div className="faq-container">
      <div className="d-flex flex-row container">
        <div>
          <Fade bottom>
            <h1><span>{t('faq.faq1.title')}<br /></span></h1>
            <p><Trans i18nKey='faq.faq1.desc'>Raptor is launched on the Binance Smart Chain. This means that in order to buy Raptor, you need the
				Binance Coin (BNB). You can buy BNB from <a href="https://trustwallet.com/" target="_blank">Trustwallet</a>, Binance Smart Chain wallet, or from an exchange such as Binance itself, Crypto.com, Whitebit, or similar. Once you have BNB, send them to
				your wallet and <a target="_blank"
                href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xf9A3FdA781c94942760860fc731c24301c83830A">head
                        over to PancakeSwap</a>to buy Raptor for BNB. Make sure you set your slippage to 8%.</Trans><br /></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq2.title')}<br /></span></h1>
            <p><Trans i18nKey="faq.faq2.desc">Go to <a href="staking">our &quot;Staking&quot; page</a>. It will automatically ask you to connect
				your wallet, connect the wallet that contains your Raptor Tokens. You will see your wallet information appear and the total amount of Raptor Tokens that you own in your wallet. We do not charge any fees for staking but you have to have BNB in your wallet in order to pay for the Binance SmartChain gas fees. Make sure you keep enough BNB in your wallet to claim or unstake you Raptor Tokens in the future. When you are all set use the slidebar to select how many Raptor Tokens you wish to stake. Press the &quot;Stake&quot; button to stake the amount of Raptor tokens you entered. Now your Raptor Tokens are staked and you'll earn 5% APY.</Trans></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq3.title')}<br /></span></h1>
            <p><Trans i18nKey='faq.faq3.desc'>When you have staked your Raptor Tokens you're able to claim your rewards anytime you wish. Just press the &quot;Claim&quot; button
                    in <a href="staking">our &quot;Staking&quot; page</a> and your rewards will be automatically transferred
                    to your wallet. Make sure you have enough BNB in your wallet to pay for the gas fees.</Trans></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq4.title')}<br /></span></h1>
            <p><Trans i18nKey='faq.faq4.desc'>Go to <a href="staking">our &quot;Staking&quot; page</a> and press the &quot;Unstake&quot; button. All of your staked
                Raptor Tokens and your rewards will be automatically transferred to your wallet.
                    Make sure you have enough BNB in your wallet to pay for the gas fees.</Trans></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq5.title')}<br /></span></h1>
            <p><Trans i18nKey='faq.faq5.desc'>Yes, <a href="https://bscscan.com/tx/0xf5ec7ea50fffba3e1c2ab21f9bd3a7e29d11791b523f6af36ebd1bb5e145ec6c"
              target="_blank">we have locked the liquidity</a> until the release of RaptorSwap. At which point,
                    we will only be unlocking it for testing, and then immediately locking it again for the remainder of our existence.</Trans><br /></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq6.title')}<br /></span></h1>
            <p><Trans i18nKey='faq.faq6.desc'>Yes, the identity of the team members are revealed on <a href="about">our &quot;About&quot; page</a>. Our
                    founder is called Ismail van Essen and you can find him <a
                href="https://www.linkedin.com/in/ismail-van-essen-b6936628/">on LinkedIn</a></Trans>.</p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq7.title')}<br /></span></h1>
            <p><Trans i18nKey="faq.faq7.desc">Yes, we have extensive security measures in place to ensure the upmost protection of our clients' assets.
                    Please <a href="https://bscscan.com/address/0xf9a3fda781c94942760860fc731c24301c83830a#code" target="_blank">review our
                        smart contract</a> during your own research to confirm the security for yourself.</Trans><br /></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq8.title')}<br /></span></h1>
            <p>{t('faq.faq8.desc')}<br /></p>
          </Fade>
          <Fade bottom>
            <h1><span>{t('faq.faq9.title')}<br /></span></h1>
            <p>{t('faq.faq9.desc')}<br /></p>
          </Fade>
        </div>
      </div>
    </div>
  }
}

export default withTranslation()(FaqComponent);
