import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MoralisProvider } from "react-moralis";

export const SERVER_URL: string = "https://ut01tiub6zvr.usemoralis.com:2053/server";
export const APP_ID: string = "5GbBhVnTO74hE7okMwcD9GaMfAIwwoBCsR7q7Fyt";
export const CONTRACT_ADDRESS: string = "0x50bc4e435e941354f34fdd9e38271841e7959e51";
export const CHAIN = "mumbai";

export const SELL_PRICE = 20000000000000000;
export const SEEDING_PRICE = SELL_PRICE / 20;
export const WATERING_PRICE = SELL_PRICE / 100;
export const MAX_WATERING_COUNTER = 10;
export const MAX_HARVEST_LEVEL_COUNTER = 50;


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <MoralisProvider serverUrl={SERVER_URL} appId={APP_ID}>
            <App />
        </MoralisProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
