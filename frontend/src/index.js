import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Global, css } from '@emotion/react';
import { CELL_SIZE_CSS, CELL_SIZE_MOBILE_CSS } from './constants';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Global
      styles={css`
    :root {
      --cell-size: ${CELL_SIZE_CSS};
    }
    @media (max-width: 600px) {
      :root {
        --cell-size: ${CELL_SIZE_MOBILE_CSS};
      }
    }
  `}
    />
    <App />
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
