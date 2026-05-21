/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import App from './App.tsx';
import { DataProvider } from './data.tsx';

const root = document.getElementById('root');

render(() => <DataProvider><App /></DataProvider>, root!);
