// let's use React.js
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

// and bootstrap
import 'bootstrap';

// with our own theme
import './index.css';

// with custom packages for the fallback loader
import { ClipLoader } from 'react-spinners';
import { css } from 'styled-components';

// now all the components
import {Shell} from "./components/shell";
import {StaticHtmlComponent} from "./components/pages/staticHtmlComponent";
import LotteryComponent from "./components/pages/lotteryComponent";
import HomeComponent from "./components/pages/homeComponent";
import StakingComponent from "./components/pages/stakingComponent";
import AboutComponent from "./components/pages/aboutComponent";
import FaqComponent from "./components/pages/faqComponent";

import './i18n'

const pagesInNavigator = [
	{ id: 'home', title: 'Home', component: HomeComponent },
	{ id: 'about', title: 'About', component: AboutComponent },
	// { id: 'about', title: 'About', component: StaticHtmlComponent, componentProps: { src: [
	// 	require('./content/about.css'),
	// 	require('./content/about.html')]
	// } },	
	//{ id: 'news', title: 'News', component: StaticHtmlComponent, componentProps: {src: '<h3 class="coming-soon">Coming soon</h3>'} },
	{ id: 'staking', title: 'Staking', component: StakingComponent },
	{ id: 'lottery', title: 'Lottery', component: LotteryComponent },
	{ id: 'faq', title: 'FAQ', component: FaqComponent },
	// { id: 'faq', title: 'FAQ', component: StaticHtmlComponent, componentProps: {src: [
	// 			require('./content/faq.css'),
	// 			require('./content/faq.html')]
	// } },
]

const overrideCss = css`
	margin-left: 50%
`;

// initialize modals
Modal.setAppElement('#root');
console.log(HomeComponent)
// and render our app into the "root" element!
ReactDOM.render(
	<React.Suspense fallback={<ClipLoader color={"#FFFFFF"} css={overrideCss}/>}>
		<Shell pages={pagesInNavigator} />
	</React.Suspense>,
    document.getElementById('root')
);
