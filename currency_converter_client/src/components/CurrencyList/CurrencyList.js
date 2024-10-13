import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Input, Typography, Space, Card } from 'antd';
import axios from 'axios';
import './CurrencyList.css'; // Assuming you have a CSS file for custom styles
import { Footer } from 'antd/es/layout/layout';
import { SearchOutlined } from '@ant-design/icons'; // Import search icon

const { Title, Text } = Typography;

const CurrencyList = () => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/currency_list/');
                setCurrencies(response.data);
                setFilteredData(response.data);
            } catch (err) {
                setError('Failed to fetch currency data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = currencies.filter(currency =>
            currency.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const columns = [
        {
            title: 'Currency Code',
            dataIndex: 'code',
            key: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
            width: '20%',
        },
        {
            title: 'Currency Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: '60%',
        },
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
            width: '20%',
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" style={{ color: '#00796b' }} /> {/* You can customize the color here */}
            </div>
        );
    }
    

    if (error) {
        return <Alert message={error} type="error" showIcon />;
    }

    return (
        <div className="currency-list-container">
            <Card className="currency-card" bordered={false}>
                <Title level={2} className="currency-title">Supported Currencies</Title>
                <Text type="secondary" className="currency-description">
                    Below, you will find a list of currencies we currently support via the API. We are constantly expanding our database and adding more countries. If you don't find a currency on this page, please let us know and we will update it. The API requires the ISO 4217 currency codes when making calls.
                </Text>
                <Input
                    placeholder="Search Currency"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="currency-search"
                    prefix={<SearchOutlined />}
                />
                <Table
                    dataSource={filteredData}
                    columns={columns}
                    rowKey="code"
                    pagination={false}
                    className="currency-table"
                    scroll={{ x: true }} // Enable horizontal scroll for responsive design
                />
            </Card>
            <Text type="secondary" className="currency-disclaimer">
                Please note that the information provided on our platform is strictly intended for informational purposes only and should not be construed as trading or investment advice. MyCurrency presents all information on an "as is" basis, without any warranties or guarantees of any kind.
            </Text>
            <Footer className="currency-footer">
                <Text> © MyCurrency by Hritul Pardhi 2024 </Text>
            </Footer>
        </div>
    );
};

export default CurrencyList;
