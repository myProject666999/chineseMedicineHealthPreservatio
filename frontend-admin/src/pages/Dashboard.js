import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Spin, Calendar } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  MessageOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import request from '../utils/request';
import dayjs from 'dayjs';

const { Title } = Typography;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    posts: 0,
    consultations: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, productsRes, ordersRes, postsRes] = await Promise.all([
        request.get('/user/list?page=1&page_size=1000').catch(() => ({ data: { total: 0 } })),
        request.get('/product/list?page=1&page_size=1000').catch(() => ({ data: { total: 0 } })),
        request.get('/admin/orders?page=1&page_size=1000').catch(() => ({ data: { list: [], total: 0 } })),
        request.get('/forum/list?page=1&page_size=1000').catch(() => ({ data: { total: 0 } })),
      ]);

      const orders = ordersRes.data?.list || [];
      const completedOrders = orders.filter(o => o.status === 3);
      const revenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setStats({
        users: usersRes.data?.total || 0,
        products: productsRes.data?.total || 0,
        orders: ordersRes.data?.total || 0,
        revenue: revenue,
        posts: postsRes.data?.total || 0,
        consultations: 0,
      });

      setRecentOrders(orders.slice(0, 5));
      setRecentUsers(usersRes.data?.list?.slice(0, 5) || []);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: '订单号',
      key: 'order_no',
      render: (_, record) => <span style={{ fontFamily: 'monospace' }}>{record.order_no}</span>,
    },
    {
      title: '金额',
      key: 'total_amount',
      render: (_, record) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{record.total_amount}</span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          0: { label: '待付款', color: 'orange' },
          1: { label: '待发货', color: 'blue' },
          2: { label: '已发货', color: 'cyan' },
          3: { label: '已完成', color: 'green' },
          4: { label: '已取消', color: 'default' },
        };
        const status = statusMap[record.status] || { label: '未知', color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '时间',
      key: 'created_at',
      render: (_, record) => dayjs(record.created_at).format('MM-DD HH:mm'),
    },
  ];

  const userColumns = [
    {
      title: '用户名',
      key: 'username',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          <span>{record.username}</span>
        </div>
      ),
    },
    {
      title: '昵称',
      key: 'nickname',
      render: (_, record) => record.nickname || '未设置',
    },
    {
      title: '注册时间',
      key: 'created_at',
      render: (_, record) => dayjs(record.created_at).format('YYYY-MM-DD'),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>数据概览</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="注册用户"
              value={stats.users}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="商品数量"
              value={stats.products}
              prefix={<ShopOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="订单总数"
              value={stats.orders}
              prefix={<ShoppingCartOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="营收总额"
              value={stats.revenue}
              precision={2}
              prefix={<RiseOutlined style={{ color: '#f5222d' }} />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="论坛帖子"
              value={stats.posts}
              prefix={<MessageOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8} lg={4}>
          <Card className="stat-card">
            <Statistic
              title="待处理咨询"
              value={stats.consultations}
              prefix={<SafetyCertificateOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="最近订单" className="table-card">
            <Table
              rowKey="id"
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最近注册用户" className="table-card">
            <Table
              rowKey="id"
              columns={userColumns}
              dataSource={recentUsers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="日历" className="table-card">
            <Calendar fullscreen={false} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统信息" className="table-card">
            <div style={{ padding: 16 }}>
              <p><strong>系统版本：</strong>1.0.0</p>
              <p><strong>技术栈：</strong>Golang + React + MySQL</p>
              <p><strong>前端框架：</strong>React 18 + Ant Design 5</p>
              <p><strong>后端框架：</strong>Gin + GORM</p>
              <p><strong>当前时间：</strong>{new Date().toLocaleString()}</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
