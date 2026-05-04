import React, { useState, useEffect } from 'react';
import { Card, Table, Button, InputNumber, Typography, Empty, message, Tag, Modal, Form, Input, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;

function Cart({ user, cartCount, setCartCount }) {
  const [cartItems, setCartItems] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await request.get('/cart');
      setCartItems(res.data || []);
    } catch (error) {
      console.error('获取购物车失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (id, quantity) => {
    try {
      await request.put(`/cart/${id}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error('更新购物车失败:', error);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await request.delete(`/cart/${id}`);
      message.success('已从购物车移除');
      fetchCart();
      if (setCartCount) {
        setCartCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('移除购物车失败:', error);
    }
  };

  const getSelectedTotal = () => {
    const selectedItems = cartItems.filter(item => selectedRows.includes(item.id));
    return selectedItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = async (values) => {
    try {
      const orderItems = cartItems
        .filter(item => selectedRows.includes(item.id))
        .map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        }));

      await request.post('/order', {
        address: values.address,
        phone: values.phone,
        receiver: values.receiver,
        items: orderItems,
      });

      message.success('订单创建成功，请前往订单列表支付');
      setCheckoutModalVisible(false);
      form.resetFields();
      navigate('/orders');
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error('创建订单失败');
    }
  };

  const columns = [
    {
      title: '商品信息',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={record.product?.image || 'https://picsum.photos/100/100'}
            alt={record.product?.name}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.product?.name}</div>
            <Text type="secondary">单价: ¥{record.product?.price}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '数量',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.product?.stock || 999}
          value={record.quantity}
          onChange={(value) => updateCartQuantity(record.id, value)}
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 120,
      render: (_, record) => (
        <Text type="danger" strong>
          ¥{((record.product?.price || 0) * record.quantity).toFixed(2)}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (newSelectedRows) => {
      setSelectedRows(newSelectedRows);
    },
  };

  return (
    <div>
      <Title level={3} className="section-title">
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        购物车
      </Title>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : cartItems.length > 0 ? (
          <>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={cartItems}
              rowSelection={rowSelection}
              pagination={false}
            />

            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span>已选择 <Tag color="blue">{selectedRows.length}</Tag> 件商品</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span>
                  合计: <Text type="danger" strong style={{ fontSize: 20 }}>
                    ¥{getSelectedTotal().toFixed(2)}
                  </Text>
                </span>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  disabled={selectedRows.length === 0}
                  onClick={() => setCheckoutModalVisible(true)}
                >
                  结算
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="购物车是空的"
          >
            <Button type="primary" onClick={() => navigate('/products')}>
              去逛逛
            </Button>
          </Empty>
        )}
      </Card>

      <Modal
        title="确认订单"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckout}
          initialValues={{
            receiver: user?.nickname || user?.username,
            phone: user?.phone || '',
            address: '',
          }}
        >
          <Form.Item
            name="receiver"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人' }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="address"
            label="收货地址"
            rules={[{ required: true, message: '请输入收货地址' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入收货地址" />
          </Form.Item>

          <div style={{ padding: 16, backgroundColor: '#fafafa', borderRadius: 4 }}>
            <Text strong>订单信息：</Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">商品数量: {selectedRows.length} 件</Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text>订单总金额: </Text>
              <Text type="danger" strong style={{ fontSize: 18 }}>
                ¥{getSelectedTotal().toFixed(2)}
              </Text>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Cart;
