// let's use React.js
import React from 'react';
import ReactDOM from 'react-dom';

// and bootstrap
import 'bootstrap';

// with our own theme
import './index.css';

// now all the components
import {Shell} from "./components/shell";
import {StaticHtml} from "./components/pages/staticHtml";

const pagesInNavigator = [
	{ id: 'home', title: 'Home', component: StaticHtml, componentProps: { src: [
		require('./content/home.css'),
		require('./content/home.html')]
	} },
	{ id: 'about', title: 'About', component: StaticHtml, componentProps: { src: [
		require('./content/about.css'),
		require('./content/about.html')]
	} },
	{ id: 'news', title: 'News', component: null },
	{ id: 'staking', title: 'Staking', component: null },
	{ id: 'lottery', title: 'Lottery', component: null },
	{ id: 'faq', title: 'FAQ', component: null },
]

// and render our app into the "root" element!
ReactDOM.render(
    <Shell pages={pagesInNavigator} />,
    document.getElementById('root')
);
