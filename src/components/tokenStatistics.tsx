import * as React from 'react';
import { BaseComponent } from './shellInterfaces';
import { RaptorStatistics } from './contracts/statistics';
import './roadmap.css';
import { withTranslation, WithTranslation, TFunction, Trans } from 'react-i18next';
import { fadeIn } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';

export type TokenStatisticsProps = {};
export type TokenStatisticsState = {
	exit?: boolean;
	priceUsd?: number;
	priceBnb?: number;
};

const FadeInAnimation = keyframes`${fadeIn}`;
const FadeInDiv = styled.div`
  animation: ease-in 0.4s ${FadeInAnimation};
`;

class TokenStatistics extends BaseComponent<TokenStatisticsProps & WithTranslation, TokenStatisticsState> {

	private readonly _statistics: RaptorStatistics;
	private _timeout = null;

	constructor(props: TokenStatisticsProps & WithTranslation) {
		super(props);
		this.state = {
			priceUsd: 0,
			priceBnb: 0,
		};
		this._statistics = new RaptorStatistics();
	}

	componentDidMount() {
		console.log('mount');
		this.tick();
	}

	componentWillUnmount() {
		if (!!this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}

		this.setState({ exit: true });
	}

	async tick() {
		const self = this;
		const state = this.readState();

		if (state.exit) {
			return;
		}

		await this._statistics.refresh();

		this.setState({
			priceBnb: this._statistics.raptorBnbPrice,
			priceUsd: this._statistics.raptorUsdPrice,
		});

		this._timeout = setTimeout(async () => await self.tick.call(self), 60000);
	}

	convert(n) {
		var sign = +n < 0 ? "-" : "",
			toStr = n.toString();
		if (!/e/i.test(toStr)) {
			return n;
		}
		var [lead, decimal, pow] = n.toString()
			.replace(/^-/, "")
			.replace(/^([0-9]+)(e.*)/, "$1.$2")
			.split(/e|\./);
		return +pow < 0
			? sign + "0." + "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal
			: sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))) : (decimal.slice(0, +pow) + "." + decimal.slice(+pow)))
	}

	handleChange = ({ target: {
		priceUsd,
		priceBnb,
	} }) => {
		this.setState({
			priceUsd,
			priceBnb,
		});
	};

	render() {
		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return <FadeInDiv>
			<div className="shadow align-self-center gradient-card primary"
				id="raptor-forest">
				<h2 className="flex-fill"><strong>{t('home.token_statistics.title')}</strong></h2>
				<p><strong>{t('home.token_statistics.price_usd')} </strong>
					<AnimatedNumber value={this.convert(+state.priceUsd)} duration="1000" formatValue={value => `${Number(value).toFixed(14)}`}>
						0
				</AnimatedNumber>
				</p>
				<p><strong>{t('home.token_statistics.price_bnb')} </strong>
					<AnimatedNumber value={this.convert(+state.priceBnb)} duration="1000" formatValue={value => `${Number(value).toFixed(14)}`}>
						0
				</AnimatedNumber>
				</p>
			</div>
		</FadeInDiv>
	}
};

export default withTranslation()(TokenStatistics);
