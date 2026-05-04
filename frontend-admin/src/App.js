import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Modal, Result } from 'antd';
import {
  DashboardOutlined,
  FolderOutlined,
  MedicineBoxOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CategoryList from './pages/CategoryList';
import ProductList from './pages/ProductList';
import OrderList from './pages/OrderList';
import request from './utils/request';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function PlaceholderPage({ title }) {
  return (
    <Result
      status="info"
      title={title}
      subTitle="该功能正在开发中，敬请期待..."
    />
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('admin');
    
    if (!token && location.pathname !== '/login') {
      navigate('/login');
      setLoading(false);
      return;
    }

    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        setAdmin(null);
        navigate('/login');
      },
    });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => {},
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/'),
    },
    {
      key: 'category',
      icon: <FolderOutlined />,
      label: '分类管理',
      children: [
        { key: '/category/health', label: '养生分类' },
        { key: '/category/product', label: '产品分类' },
        { key: '/category/diet', label: '饮食类型' },
        { key: '/category/announcement', label: '公告分类' },
      ],
    },
    {
      key: 'health',
      icon: <MedicineBoxOutlined />,
      label: '养生内容管理',
      children: [
        { key: '/health/recommendation', label: '养生推荐' },
        { key: '/health/article', label: '养生文章' },
        { key: '/health/knowledge', label: '养生知识' },
        { key: '/health/share', label: '养生分享' },
        { key: '/health/constitution', label: '体质测试' },
        { key: '/health/seasonal', label: '四季养生' },
      ],
    },
    {
      key: 'product',
      icon: <ShopOutlined />,
      label: '产品管理',
      children: [
        { key: '/product/list', label: '产品列表' },
      ],
    },
    {
      key: 'order',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
      children: [
        { key: '/order/list', label: '订单列表' },
      ],
    },
    {
      key: 'forum',
      icon: <MessageOutlined />,
      label: '论坛管理',
      children: [
        { key: '/forum/list', label: '帖子列表' },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/system/about', label: '关于我们' },
        { key: '/system/intro', label: '系统简介' },
        { key: '/system/banner', label: '轮播图管理' },
        { key: '/system/announcement', label: '公告信息' },
        { key: '/system/consultation', label: '在线咨询' },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const isLoginPage = location.pathname === '/login';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        加载中...
      </div>
    );
  }

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }} className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <SafetyOutlined style={{ fontSize: 24, marginRight: 8 }} />
          {!collapsed && (
            <Title level={5} style={{ color: 'white', margin: 0 }}>
              中医养生系统
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div className="header-title">
            中医养生系统管理后台
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{admin?.username || admin?.nickname || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/category/health" element={<CategoryList categoryType="health" />} />
            <Route path="/category/product" element={<CategoryList categoryType="product" />} />
            <Route path="/category/diet" element={<CategoryList categoryType="diet" />} />
            <Route path="/category/announcement" element={<CategoryList categoryType="announcement" />} />
            <Route path="/product/list" element={<ProductList />} />
            <Route path="/order/list" element={<OrderList />} />
            <Route path="/health/recommendation" element={<PlaceholderPage title="养生推荐管理" />} />
            <Route path="/health/article" element={<PlaceholderPage title="养生文章管理" />} />
            <Route path="/health/knowledge" element={<PlaceholderPage title="养生知识管理" />} />
            <Route path="/health/share" element={<PlaceholderPage title="养生分享管理" />} />
            <Route path="/health/constitution" element={<PlaceholderPage title="体质测试管理" />} />
            <Route path="/health/seasonal" element={<PlaceholderPage title="四季养生管理" />} />
            <Route path="/forum/list" element={<PlaceholderPage title="论坛管理" />} />
            <Route path="/system/about" element={<PlaceholderPage title="关于我们" />} />
            <Route path="/system/intro" element={<PlaceholderPage title="系统简介" />} />
            <Route path="/system/banner" element={<PlaceholderPage title="轮播图管理" />} />
            <Route path="/system/announcement" element={<PlaceholderPage title="公告信息管理" />} />
            <Route path="/system/consultation" element={<PlaceholderPage title="在线咨询管理" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
