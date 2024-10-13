// Home.js
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

const Home = () => {
  return (
    <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/currencies">Currencies</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '20px' }}>
        <h1>Welcome to the Home Page</h1>
        <p>This is your main dashboard.</p>
      </Content>
    </Layout>
  );
};

export default Home;
