import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, Typography, Menu as AntMenu } from 'antd';
import {
  HomeOutlined,
  MedicineBoxOutlined,
  ShopOutlined,
  ForumOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Health from './pages/Health';
import Products from './pages/Products';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import HealthDetail from './pages/HealthDetail';
import ForumPostDetail from './pages/ForumPostDetail';
import ConstitutionTest from './pages/ConstitutionTest';
import Consultations from './pages/Consultations';
import Announcements from './pages/Announcements';
import request from './utils/request';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchUserInfo();
      fetchCartCount();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await request.get('/user/info');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await request.get('/cart');
      setCartCount(res.data?.length || 0);
    } catch (error) {
      console.error('获取购物车数量失败:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const userMenu = (
    <AntMenu>
      <AntMenu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </AntMenu.Item>
      <AntMenu.Item key="orders" icon={<ShopOutlined />} onClick={() => navigate('/orders')}>
        我的订单
      </AntMenu.Item>
      <AntMenu.Item key="consultations" onClick={() => navigate('/consultations')}>
        在线咨询
      </AntMenu.Item>
      <AntMenu.Divider />
      <AntMenu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </AntMenu.Item>
    </AntMenu>
  );

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/health',
      icon: <MedicineBoxOutlined />,
      label: '养生知识',
      onClick: () => navigate('/health'),
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: '养生产品',
      onClick: () => navigate('/products'),
    },
    {
      key: '/forum',
      icon: <ForumOutlined />,
      label: '养生论坛',
      onClick: () => navigate('/forum'),
    },
    {
      key: '/constitution-test',
      icon: <UserOutlined />,
      label: '体质测试',
      onClick: () => navigate('/constitution-test'),
    },
    {
      key: '/announcements',
      icon: <MedicineBoxOutlined />,
      label: '公告信息',
      onClick: () => navigate('/announcements'),
    },
  ];

  const AuthRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={(userData, token) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          navigate('/');
        }} />} />
        <Route path="/register" element={<Register onRegister={(userData, token) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          navigate('/');
        }} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div className="header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <MedicineBoxOutlined style={{ marginRight: 8 }} />
          中医养生系统
        </div>
        <div className="header-right">
          <Badge count={cartCount} size="small" className="cart-badge">
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 20, color: 'white' }} />}
              onClick={() => navigate('/cart')}
            />
          </Badge>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'white' }}>
              <Avatar size={32} icon={<UserOutlined />} src={user?.avatar} />
              <span style={{ marginLeft: 8 }}>{user?.nickname || user?.username}</span>
              <DownOutlined style={{ marginLeft: 8 }} />
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          className="sider"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={[window.location.pathname]}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/health" element={<Health />} />
              <Route path="/health/:id" element={<HealthDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail onAddToCart={fetchCartCount} />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:id" element={<ForumPostDetail />} />
              <Route path="/constitution-test" element={<ConstitutionTest />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/cart" element={<AuthRoute><Cart onUpdate={fetchCartCount} /></AuthRoute>} />
              <Route path="/orders" element={<AuthRoute><Orders /></AuthRoute>} />
              <Route path="/profile" element={<AuthRoute><Profile user={user} setUser={setUser} /></AuthRoute>} />
              <Route path="/consultations" element={<AuthRoute><Consultations /></AuthRoute>} />
            </Routes>
          </Content>
          <Footer className="footer">
            中医养生系统 ©2024 Created by Chinese Medicine Health System
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
