import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Typography, Alert, Spin, Card, Row, Col } from 'antd';
import axios from 'axios';
import WorldFlag from 'react-world-flags';
import './CurrencyExchange.css'; // New CSS file for custom styles

const { Title } = Typography;
const { Option } = Select;

const CurrencyExchange = () => {
    const [sourceCurrency, setSourceCurrency] = useState('USD');
    const [exchangedCurrency, setExchangedCurrency] = useState('INR');
    const [valuationDate, setValuationDate] = useState('2024-01-01');
    const [provider, setProvider] = useState('CurrencyBeacon');
    const [amount, setAmount] = useState('1');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currencies, setCurrencies] = useState([]);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/currency_list/');
                setCurrencies(response.data);
            } catch (error) {
                console.error('Error fetching currency list:', error);
            }
        };

        fetchCurrencies();
    }, []);

    const handleExchange = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:8000/api/v1/exchange_currency/', {
                source_currency: sourceCurrency,
                exchanged_currency: exchangedCurrency,
                valuation_date: valuationDate,
                provider: provider,
                amount: amount,
            });
            setExchangeRate(response.data.rate);
        } catch (err) {
            setError('Failed to fetch exchange rate');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="currency-exchange-container">
            <Card className="currency-exchange-card">
                <Title level={2} className="currency-exchange-title">Currency Exchange</Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Select
                            showSearch
                            value={sourceCurrency}
                            onChange={setSourceCurrency}
                            className="currency-select"
                            placeholder="From Currency"
                            filterOption={(input, option) => option.props.children.toLowerCase().includes(input.toLowerCase())}
                        >
                            {currencies.map(currency => (
                                <Option key={currency.code} value={currency.code}>
                                    <span style={{ marginRight: 8 }}>{currency.symbol}</span>
                                    <WorldFlag code={currency.countryCode} style={{ width: 20, marginRight: 8 }} />
                                    {currency.name} ({currency.code})
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={12}>
                        <Select
                            showSearch
                            value={exchangedCurrency}
                            onChange={setExchangedCurrency}
                            className="currency-select"
                            placeholder="To Currency"
                            filterOption={(input, option) => option.props.children.toLowerCase().includes(input.toLowerCase())}
                        >
                            {currencies.map(currency => (
                                <Option key={currency.code} value={currency.code}>
                                    <span style={{ marginRight: 8 }}>{currency.symbol}</span>
                                    <WorldFlag code={currency.countryCode} style={{ width: 20, marginRight: 8 }} />
                                    {currency.name} ({currency.code})
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Input
                    type="date"
                    value={valuationDate}
                    onChange={(e) => setValuationDate(e.target.value)}
                    className="currency-input"
                />
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="currency-input"
                />
                <Select value={provider} onChange={setProvider} className="currency-select" placeholder="Select Provider">
                    <Option value="CurrencyBeacon">CurrencyBeacon</Option>
                    <Option value="Mock">Mock</Option>
                </Select>

                <Button type="primary" onClick={handleExchange} loading={loading} className="currency-button">
                    Get Exchange Rate
                </Button>
                {loading && <Spin style={{ display: 'block', marginTop: '16px' }} />}
                {error && <Alert message={error} type="error" style={{ marginTop: '16px' }} />}
                {exchangeRate !== null && (
                    <Title level={4} style={{ marginTop: '16px', textAlign: 'center' }}>
                        Exchange Rate: {exchangeRate}
                    </Title>
                )}
            </Card>
        </div>
    );
};

export default CurrencyExchange;
