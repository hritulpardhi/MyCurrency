import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Form, Select, DatePicker, Button, Spin, Typography, Row, Col } from 'antd';
import moment from 'moment';
import { DollarCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const MultipleCurrencyChart = () => {
    const [currencyData, setCurrencyData] = useState({});
    const [loading, setLoading] = useState(false);
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [selectedCurrencies, setSelectedCurrencies] = useState(['EUR']); // Allow multiple selections
    const [dates, setDates] = useState([]);
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

    const fetchCurrencyData = async (startDate, endDate) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/v1/multiple_currency_timeseries/', {
                base_currency: baseCurrency,
                to_currencies: selectedCurrencies, // Send selected currencies
                start_date: startDate.format('YYYY-MM-DD'),
                end_date: endDate.format('YYYY-MM-DD'),
            });
            setCurrencyData(response.data); // Update this to reflect the correct structure
            setDates(Object.keys(response.data)); // Get keys if you still need dates separately
        } catch (error) {
            console.error('Error fetching currency data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onFinish = (values) => {
        const { dateRange } = values;
        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;
            fetchCurrencyData(startDate, endDate);
        }
    };

    const createChartData = () => {
        return selectedCurrencies.map(currency => {
            const rates = currencyData[currency]?.rates || [];
            const dataPoints = rates.map(rate => parseFloat(rate.rate_value)); // Convert rate values to float
            const datesArray = rates.map(rate => rate.valuation_date); // Extract valuation dates
            
            return {
                x: datesArray, // Use extracted dates for the x-axis
                y: dataPoints, // Use data points for the y-axis
                type: 'scatter',
                mode: 'lines+markers',
                marker: { size: 8 },
                line: { width: 3 },
                name: `${baseCurrency} to ${currency}`, // Chart legend name
            };
        });
    };

    const chartData = createChartData();

    // Define range presets
    const rangePresets = [
        {
            label: 'Last 7 Days',
            value: [dayjs().subtract(7, 'day'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().subtract(30, 'day'), dayjs()],
        },
        {
            label: 'Last 3 Months',
            value: [dayjs().subtract(3, 'month'), dayjs()],
        },
        {
            label: 'Last 6 Months',
            value: [dayjs().subtract(6, 'month'), dayjs()],
        },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9fafb', borderRadius: '12px', boxShadow: '0px 0px 15px rgba(0,0,0,0.1)' }}>
            <Title level={2} style={{ textAlign: 'center', color: '#00796b' }}>
                <DollarCircleOutlined /> Multiple Currency Exchange Rates <LineChartOutlined />
            </Title>
            <Form layout="vertical" onFinish={onFinish} style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Base Currency" name="baseCurrency">
                            <Select defaultValue={baseCurrency} onChange={value => setBaseCurrency(value)} showSearch>
                                {currencies.map(currency => (
                                    <Select.Option key={currency.code} value={currency.code}>
                                        {currency.name} ({currency.code})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="To Currencies" name="toCurrencies">
                            <Select
                                mode="multiple" // Allow multiple selection
                                defaultValue={selectedCurrencies}
                                onChange={value => setSelectedCurrencies(value)}
                                showSearch
                            >
                                {currencies.map(currency => (
                                    <Select.Option key={currency.code} value={currency.code}>
                                        {currency.name} ({currency.code})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Date Range" name="dateRange" rules={[{ required: true, message: 'Please select a date range!' }]}>
                            <RangePicker
                                presets={rangePresets} // Add the presets here
                                disabledDate={current => current && current > dayjs().endOf('day')}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify="center">
                    <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#00796b', borderColor: '#00796b' }}>
                        Fetch Data
                    </Button>
                </Row>
            </Form>
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Plot
                        data={chartData}
                        layout={{
                            title: `Exchange Rates from ${baseCurrency}`,
                            xaxis: { title: 'Date', showgrid: true, zeroline: false },
                            yaxis: { title: 'Exchange Rate', showgrid: true, zeroline: false },
                            plot_bgcolor: '#FFFFFF',
                            paper_bgcolor: '#FFFFFF',
                            margin: { l: 50, r: 50, t: 50, b: 50 },
                        }}
                        style={{ width: '100%', height: '450px' }}
                        config={{
                            displayModeBar: true,
                            scrollZoom: true,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default MultipleCurrencyChart;
