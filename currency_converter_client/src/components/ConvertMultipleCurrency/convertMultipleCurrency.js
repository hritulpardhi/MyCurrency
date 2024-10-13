import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Typography, Alert, Spin, Tag } from 'antd';
import axios from 'axios';
import moment from 'moment'; // Import moment
import './MultipleCurrencyExchange.css'; // Import external CSS
import { DollarCircleOutlined, EuroCircleFilled, EuroCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const MultipleCurrencyExchange = () => {
    const [sourceCurrency, setSourceCurrency] = useState('USD');
    const [valuationDate, setValuationDate] = useState(moment().format('YYYY-MM-DD'));
    const [provider, setProvider] = useState('CurrencyBeacon');
    const [amount, setAmount] = useState('1');
    const [exchangeRates, setExchangeRates] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [targetCurrencies, setTargetCurrencies] = useState(['INR']); // Default to INR

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

    const handleAddCurrency = () => {
        setTargetCurrencies([...targetCurrencies, '']);
    };

    const handleRemoveCurrency = (index) => {
        setTargetCurrencies(targetCurrencies.filter((_, i) => i !== index));
    };

    const handleCurrencyChange = (index, value) => {
        const newCurrencies = [...targetCurrencies];
        newCurrencies[index] = value;
        setTargetCurrencies(newCurrencies);
    };

    const handleExchange = async () => {
        setLoading(true);
        setError(null);
        setExchangeRates({});

        try {
            const response = await axios.post('http://localhost:8000/api/v1/convert_multiple_currency/', {
                source_currency: sourceCurrency,
                exchanged_currencies: targetCurrencies,
                valuation_date: valuationDate,
                provider: provider,
                amount: amount,
            });

            setExchangeRates(response.data);
        } catch (err) {
            setError('Failed to fetch exchange rates');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Function to check if all required fields are filled
    const isFormValid = () => {
        const isCurrenciesFilled = targetCurrencies.every(currency => currency !== '');
        return sourceCurrency && valuationDate && amount && isCurrenciesFilled;
    };

    return (
        <div className="currency-exchange-container">
            <Title level={2} style={{ textAlign: 'center', color: '#00796b' }}>
                <DollarCircleOutlined /> Multiple Currency Exchange <EuroCircleOutlined />
            </Title>
            <Select
                showSearch
                value={sourceCurrency}
                onChange={setSourceCurrency}
                className="currency-select"
                filterOption={(input, option) => {
                    const optionText = `${option.props.children}`;
                    return optionText.toLowerCase().includes(input.toLowerCase());
                }}
            >
                {currencies.map(currency => (
                    <Option key={currency.code} value={currency.code}>
                        <span className="currency-symbol">{currency.symbol} </span>
                        {currency.name} ({currency.code})
                    </Option>
                ))}
            </Select>

            <Input
                type="date"
                value={valuationDate}
                onChange={(e) => setValuationDate(e.target.value)}
                className="input-field"
            />
            <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="input-field"
            />
            <Select value={provider} onChange={setProvider} className="currency-select">
                <Option value="CurrencyBeacon">CurrencyBeacon</Option>
                <Option value="Mock">Mock</Option>
            </Select>

            <div className="target-currencies">
                {targetCurrencies.map((currency, index) => (
                    <div key={index} className="currency-row">
                        <Select
                            showSearch
                            value={currency}
                            onChange={(value) => handleCurrencyChange(index, value)}
                            className="currency-select"
                        >
                            {currencies.map((c) => (
                                <Option key={c.code} value={c.code}>
                                    <span className="currency-symbol">{c.symbol} </span>
                                    {c.name} ({c.code})
                                </Option>
                            ))}
                        </Select>
                        <Button type="danger" onClick={() => handleRemoveCurrency(index)} className="remove-button">Remove</Button>
                    </div>
                ))}
                <Button type="dashed" onClick={handleAddCurrency} className="add-button">
                    Add Currency
                </Button>
            </div>

            <Button type="primary" onClick={handleExchange} loading={loading} disabled={!isFormValid()} className="exchange-button">
                Get Exchange Rates
            </Button>
            {loading && <Spin className="loading-spinner" />}
            {error && <Alert message={error} type="error" className="error-alert" />}
            {Object.entries(exchangeRates).map(([currency, { rate, converted_amount, fetched_from }]) => {
                const currencyObj = currencies.find(c => c.code === currency);
                const currencySymbol = currencyObj ? currencyObj.symbol : '';

                return (
                    <Tag key={currency} color="blue" style={{ marginBottom: '8px', padding:"5px", marginTop:"16px" }}>
                        {currency} : {currencySymbol} {converted_amount} (Fetched from: {fetched_from})
                    </Tag>
                );
            })}
        </div>
    );
};

export default MultipleCurrencyExchange;
