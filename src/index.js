import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';

// FONTS
import './fonts/BentonSansCond-Regular.otf';
import './fonts/BentonSansCond-RegItalic.otf';
import './fonts/BentonSansCond-Bold.otf';
import './fonts/BentonSansCond-BoldItalic.otf';
import './fonts/Shift-Bold.otf';
import './fonts/Shift-BoldItalic.otf';


// CSS
import './css/index.css';


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
