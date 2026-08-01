import * as React from 'react';

import { withTranslation, WithTranslation, TFunction } from 'react-i18next';

export type WalletConnectButtonProps = {
	connected?: boolean;
	pending?: boolean;
	disconnectLabelKey?: string;
	connectLabelKey?: string;
	onConnect?: () => void;
	onDisconnect?: () => void;
};

/**
 * The connect / disconnect wallet button used on every wallet-backed page.
 *
 * Replaces the copy-pasted header button + spinner block that used to live in
 * each page's render(). State lives on the parent page (connected/pending),
 * this component is purely presentational.
 */
class WalletConnectButton extends React.Component<WalletConnectButtonProps & WithTranslation> {

	constructor(props: WalletConnectButtonProps & WithTranslation) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		const { connected, onConnect, onDisconnect } = this.props;
		if (connected) {
			onDisconnect && onDisconnect();
		} else {
			onConnect && onConnect();
		}
	}

	render() {
		const t: TFunction<"translation"> = this.readProps().t;
		const {
			connected,
			pending,
			disconnectLabelKey,
			connectLabelKey,
		} = this.props;

		const label = connected
			? t(disconnectLabelKey || 'farm.disconnect_wallet')
			: t(connectLabelKey || 'farm.connect_wallet');

		return (
			<a
				className="shadow btn btn-primary ladda-button btn-md btn-wallet float-right"
				disabled={pending}
				role="button"
				onClick={this.handleClick}
			>
				{pending && (
					<span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"> </span>
				)}
				{label}
			</a>
		);
	}

	private readProps(): WalletConnectButtonProps & WithTranslation {
		const self: any = this;
		return self.props || {};
	}
}

export default withTranslation()(WalletConnectButton);
