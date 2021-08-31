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
import {Shell} from './components/shell';
import LotteryComponent from './components/pages/lottery/lotteryComponent';
import HomeComponent from './components/pages/home/homeComponent';
import StakingComponent from './components/pages/staking/stakingComponent';
import AboutComponent from './components/pages/about/aboutComponent';
import FaqComponent from './components/pages/faq/faqComponent';
import FarmComponent from './components/pages/farm/farmComponent';
import MigrationComponent from './components/pages/migration/migrationComponent';
// import LaunchComponent from './components/pages/launchComponent'; WIP

import './i18n';

const pagesInNavigator = [
	{ id: 'home', title: 'Home', component: HomeComponent },
	{ id: 'about', title: 'About', component: AboutComponent },
	{ id: 'farm', title: 'Farm', component: FarmComponent },
	{ id: 'staking', title: 'Staking', component: StakingComponent },
	{ id: 'lottery', title: 'Lottery', component: LotteryComponent },
	{ id: 'faq', title: 'FAQ', component: FaqComponent },
	{ id: 'migrate', title:'Migration', component: MigrationComponent },
	// Ignored on nav
	// { id: 'launch', title: 'Launch', component: LaunchComponent },
];

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
