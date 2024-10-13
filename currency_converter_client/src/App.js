// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import './App.css'; // Your global styles
import CurrencyList from './components/CurrencyList/CurrencyList';
import CurrencyExchange from './components/ConvertCurrency/convertCurrency';
import CurrencyChart from './components/CurrencyChart/currencyChart';
import MultipleCurrencyExchange from './components/ConvertMultipleCurrency/convertMultipleCurrency';
import MultipleCurrencyChart from './components/MultipleCurrencyChart/multipleCurrencyChart';

const { Header, Content } = Layout;

const App = () => {
    return (
        <Router>
            <Layout style={{ minHeight: '100vh' }}>
                <Header>
                    <div className="logo" style={{ color: 'white', fontSize: '20px' }}>MyCurrency</div>
                    <Menu theme="dark" mode="horizontal">
                        <Menu.Item key="1">
                            <Link to="/currencies">Currencies</Link>
                        </Menu.Item>
                        {/* <Menu.Item key="2">
                            <Link to="/exchange">Currency Exchange</Link>
                        </Menu.Item> */}
                        {/* <Menu.Item key="3">
                            <Link to="/currency_chart">Currency Chart</Link>
                        </Menu.Item> */}
                        <Menu.Item key="4">
                            <Link to="/exchange_multiple_currency">Multiple Currency Exchange</Link>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <Link to="/multiple_currency_chart">Multiple Currency Chart</Link>
                        </Menu.Item>
                        {/* Add more menu items as needed */}
                    </Menu>
                </Header>
                <Content style={{ padding: '20px' }}>
                    <Routes>
                        <Route path="/currencies" element={<CurrencyList />} />
                        {/* <Route path="/exchange" element={<CurrencyExchange />} /> */}
                        {/* <Route path="/currency_chart" element={<CurrencyChart />} /> */}
                        <Route path="/exchange_multiple_currency" element={<MultipleCurrencyExchange />} />
                        <Route path="/multiple_currency_chart" element={<MultipleCurrencyChart />} />
                        {/* <Route path="/other" element={<OtherPage />} /> */}
                    </Routes>
                </Content>
            </Layout>
        </Router>
    );
};

export default App;
