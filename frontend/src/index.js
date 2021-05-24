import React from 'react';
import ReactDOM from 'react-dom';

import $ from 'jquery';

import 'bootstrap';
import './index.css';

ReactDOM.render(
    <div><h1>Test</h1><p id="hello">TestTest</p></div>,
    document.getElementById('root')
);

function x() {
    $('#hello').html(new Date())
    setTimeout(x, 1000);
}

x();