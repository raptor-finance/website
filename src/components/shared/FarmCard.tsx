import * as React from 'react';
import * as numeral from 'numeral';

import { Tooltip, OverlayTrigger, Col } from 'react-bootstrap';
import AnimatedNumber from 'animated-number-react';

import '../pages/paddings.css';
import '../pages/farm/farmComponent.css';

export type FarmCardProps = {
	logo: string;
	pairName: string;
	fees: string;
	liquidityPool: string;
	enableGlow?: boolean;
	pid: number;
	version: number;
	addLiquidityURL?: string;
	/** Display the unit label ("LP") after the pair name / amounts. */
	showLP?: boolean;
	/** Show the TVL row (hidden on the deprecated v2 farms which never rendered it). */
	showTVL?: boolean;
	/** Show the ad iframe (hidden on the deprecated v2 farms which never rendered it). */
	showAd?: boolean;
	/** Amounts per pool, keyed by `${version},${pid}`. */
	amounts?: {
		[key: string]: {
			apr?: number;
			lpBalance?: number;
			stakedLp?: number;
			rewards?: number;
			tvl?: number;
			usdavailable?: number;
			usdstaked?: number;
			usdrewards?: number;
		};
	};
	ctValue?: { [key: string]: string };
	onAmountChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onDeposit?: (version: number, pid: number) => void;
	onWithdraw?: (version: number, pid: number) => void;
	onClaim?: (version: number, pid: number) => void;
};

/**
 * The farm / staking pool card.
 *
 * farmComponent.tsx, stakingComponent.tsx, farmComponentv2.tsx and
 * stakingComponentv2.tsx used to carry ~200 lines of near-identical JSX each;
 * the differences were cosmetic (labels, a TVL section, an ad iframe, a
 * liquidity-pool link). Those variants are now options on this one component.
 */
export function FarmCard(props: FarmCardProps) {
	const {
		logo,
		pairName,
		fees,
		liquidityPool,
		enableGlow,
		pid,
		version,
		addLiquidityURL,
		showLP,
		showTVL = true,
		showAd = true,
		amounts,
		ctValue,
		onAmountChange,
		onDeposit,
		onWithdraw,
		onClaim,
	} = props;

	const key = `${version},${pid}`;
	const value = (ctValue || {})[key];
	const amount = (amounts || {})[key] || {};

	const apr = amount.apr || 0;
	const lpBalance = amount.lpBalance || 0;
	const stakedLp = amount.stakedLp || 0;
	const rewards = amount.rewards || 0;
	const tvl = amount.tvl || 0;
	const usdavailable = amount.usdavailable || 0;
	const usdstaked = amount.usdstaked || 0;
	const usdrewards = amount.usdrewards || 0;

	const unitLabel = showLP ? 'LP' : '';
	const lpLabel = showLP ? ' LP' : '';

	const formatAmount = (v: number, decimals: number, suffix: string) =>
		`${Number(parseFloat(v.toFixed(decimals))).toLocaleString('en', { minimumFractionDigits: decimals })}${suffix}`;

	const usdSuffix = (v: number) =>
		` (= ${Number(parseFloat(v.toFixed(2))).toLocaleString('en', { minimumFractionDigits: 2 })}$)`;

	return (
		<Col xl={3} lg={4}>
			<div className={`farm-card ${enableGlow ? 'glow-div' : ''}`}>
				<div className="gradient-card shadow dark">
					<div className="farm-card-body d-flex justify-content-between">
						<div>
							<div className="d-flex justify-content-between pair-header">
								<img className="lp-pair-icon" src={logo} alt="bnb-raptor-pair" />
								<div>
									<h1 className="text-right">{pairName} {unitLabel}</h1>
									<h2 className="text-right">{fees}</h2>
								</div>
							</div>
							<hr />
							<div className="d-flex justify-content-between apr">
								<h2>APR: </h2>
								<h2>
									<AnimatedNumber
										value={numeral(apr || 0).format('0.00')}
										duration="1000"
										formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}%`}
									>
										{apr || 0}
									</AnimatedNumber>
								</h2>
							</div>
							{showTVL && (
								<div className="d-flex justify-content-between tvl">
									<h2>TVL: </h2>
									<h2>
										<AnimatedNumber
											value={numeral(tvl || 0).format('0.00')}
											duration="1000"
											formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}$`}
										>
											{apr || 0}
										</AnimatedNumber>
									</h2>
								</div>
							)}
							<div className="d-flex justify-content-between pool">
								<h2>Liquidity Pool: </h2>
								<h2>
									{addLiquidityURL
										? <a href={addLiquidityURL}><u>{liquidityPool}</u></a>
										: <u>{liquidityPool}</u>}
								</h2>
							</div>
							<h3>Available {pairName} {lpLabel}</h3>
							<AnimatedNumber
								value={numeral(lpBalance || 0).format('0.000000')}
								duration="1000"
								formatValue={value => formatAmount(parseFloat(value), 6, '')}
							>
								{lpBalance || 0}
							</AnimatedNumber>
							<AnimatedNumber value={numeral(usdavailable || 0).format('0.00')} formatValue={value => usdSuffix(parseFloat(value))}>
								{` (= ${usdavailable || 0}$)`}
							</AnimatedNumber>
							<div className="rewards-block d-flex justify-content-between">
								<div>
									<h3>Pending Rewards</h3>
									<AnimatedNumber
										value={numeral(rewards || 0).format('0.00')}
										duration="1000"
										formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })} Raptor`}
									>
										{rewards || 0}
									</AnimatedNumber>
									<AnimatedNumber value={numeral(usdrewards || 0).format('0.00')} formatValue={value => `${usdSuffix(parseFloat(value))})`}>
										{` (= ${usdrewards || 0}$)`}
									</AnimatedNumber>)
								</div>
								<div className="d-flex align-items-center">
									<OverlayTrigger
										placement="bottom-start"
										overlay={<Tooltip id="harvest-tooltip">Claim Rewards</Tooltip>}
									>
										<button aria-label="harvest button" className="btn btn-harvest stake-claim shadow" disabled={rewards <= 0 || rewards == null} type="button" onClick={() => onClaim && onClaim(version, pid)}>
											<img src="images/harvest-icon.svg" alt="harvest button icon" />
										</button>
									</OverlayTrigger>
								</div>
							</div>
							<div className="staked-lp-info">
								<h3>{pairName} {lpLabel} Staked</h3>
								<AnimatedNumber
									value={numeral(stakedLp || 0).format('0.000000')}
									duration="1000"
									formatValue={value => `${Number(parseFloat(value).toFixed(6)).toLocaleString('en', { minimumFractionDigits: 6 })} ${showLP ? 'LP' : 'RPTR'}`}
								>
									{stakedLp || 0}
								</AnimatedNumber>
								<AnimatedNumber
									value={numeral(usdstaked || 0).format('0.00')}
									duration="1000"
									formatValue={value => ` (= ${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}$)`}
								>
									{`(${usdstaked || 0}$)`}
								</AnimatedNumber>
							</div>
						</div>
						<hr />
						<div>
							<div className="d-flex">
								<input className="lp-input" type="number" id={key} onChange={onAmountChange} value={value || ''} />
							</div>
							<div className="wd-buttons d-flex justify-content-between">
								<button className="btn btn-complementary btn-small link-dark align-self-center stake-claim" disabled={stakedLp <= 0 || stakedLp == null} type="button" onClick={() => onWithdraw && onWithdraw(version, pid)}>Withdraw {lpLabel}</button>
								<button className="btn btn-primary btn-small link-dark align-self-center stake-claim right" disabled={lpBalance <= 0 || lpBalance == null} type="button" onClick={() => onDeposit && onDeposit(version, pid)}>Deposit {lpLabel}</button>
							</div>
						</div>
						{showAd && (
							<div>
								<iframe data-aa='2131703' src='//acceptable.a-ads.com/2131703' style={{ border: "0px", "margin-top": "15px", "border-radius": "5px", padding: 0, width: "100%", height: "100px", overflow: "hidden", "background-color": "transparent" }}></iframe>
							</div>
						)}
					</div>
				</div>
			</div>
		</Col>
	);
}
