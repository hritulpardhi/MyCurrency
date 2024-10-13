import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Form, Select, DatePicker, Button, Spin, Typography, Row, Col } from 'antd';
import moment from 'moment';
import { DollarCircleOutlined, LineChartOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CurrencyChart = () => {
    const [currencyData, setCurrencyData] = useState({});
    const [loading, setLoading] = useState(false);
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
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
            const response = await axios.post('http://localhost:8000/api/v1/currency_timeseries/', {
                base_currency: baseCurrency,
                to_currency: toCurrency,
                start_date: startDate.format('YYYY-MM-DD'),
                end_date: endDate.format('YYYY-MM-DD'),
            });
            setCurrencyData(response.data.response);
            setDates(Object.keys(response.data.response));
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
        const dataPoints = dates.map(date => currencyData[date]?.[toCurrency] || 0);

        return {
            x: dates,
            y: dataPoints,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: '#4CAF50', size: 8 },
            line: { color: '#1E88E5', width: 3 },
        };
    };

    const chartData = createChartData();

    // Define range presets
    const rangePresets = [
        {
            label: 'Last 7 Days',
            value: [moment().subtract(7, 'days'), moment()],
        },
        {
            label: 'Last 14 Days',
            value: [moment().subtract(14, 'days'), moment()],
        },
        {
            label: 'Last 30 Days',
            value: [moment().subtract(30, 'days'), moment()],
        },
        {
            label: 'Last 3 Months',
            value: [moment().subtract(90, 'days'), moment()],
        },
        {
            label: 'Last 6 Months',
            value: [moment().subtract(180, 'days'), moment()],
        },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9fafb', borderRadius: '12px', boxShadow: '0px 0px 15px rgba(0,0,0,0.1)' }}>
            <Title level={2} style={{ textAlign: 'center', color: '#00796b' }}>
                <DollarCircleOutlined /> Currency Exchange Rates <LineChartOutlined />
            </Title>
            <Form layout="vertical" onFinish={onFinish} style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Base Currency" name="baseCurrency">
                            <Select 
                                defaultValue={baseCurrency} 
                                onChange={value => setBaseCurrency(value)} 
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {currencies.map(currency => (
                                    <Select.Option 
                                        key={currency.code} 
                                        value={currency.code} 
                                        label={`${currency.name} (${currency.code})`}
                                    >
                                        {currency.name} ({currency.code})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="To Currency" name="toCurrency">
                            <Select 
                                defaultValue={toCurrency} 
                                onChange={value => setToCurrency(value)} 
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {currencies.map(currency => (
                                    <Select.Option 
                                        key={currency.code} 
                                        value={currency.code} 
                                        label={`${currency.name} (${currency.code})`}
                                    >
                                        {currency.name} ({currency.code})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Date Range" name="dateRange" rules={[{ required: true, message: 'Please select a date range!' }]}>
                            <RangePicker 
                                disabledDate={current => current && current > moment().endOf('day')}
                                format="YYYY-MM-DD"
                                presets={rangePresets} // Add presets here
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
                        data={[{
                            x: dates,
                            y: dates.map(date => currencyData[date]?.[toCurrency] || 0),
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: { color: '#FFC4C4', size: 6 },
                            line: { color: '#FFB6B9', width: 3 },
                            name: `${baseCurrency} to ${toCurrency}`, 
                        }]}
                        layout={{
                            title: `${baseCurrency} to ${toCurrency} Exchange Rate`,
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

export default CurrencyChart;
