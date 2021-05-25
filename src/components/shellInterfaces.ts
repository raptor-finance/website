import {Component} from "react";

export abstract class BaseComponent<TProps, TState> extends Component<TProps, TState> {

	protected constructor(props: TProps) {
		super(props);
	}

	public readProps(): TProps {
		const self: any = this;
		return self.props || {};
	}
	public readState(): TState {
		const self: any = this;
		return self.state || {};
	}
	public updateState(value: TState): TState {
		const self: any = this;
		self.setState(value);
		return this.readState();
	}
}

export interface ComponentRef extends Function { new (...args: any[]): Component; }
export interface IShellPage {
	id: String;
	title: String;

	component: ComponentRef;
	componentProps?: any;
}
