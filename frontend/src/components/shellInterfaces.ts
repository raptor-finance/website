import {Component} from "react";
import {BehaviorSubject, Observable} from "rxjs";

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

export class ShellNavigator {
	private readonly _navigating: BehaviorSubject<IShellPage> = new BehaviorSubject<IShellPage>(null);

	public navigatingEvent(): Observable<IShellPage> {
		return this._navigating.asObservable();
	}
	public navigateTo(page: IShellPage) {
		this._navigating.next(page);
	}
}
