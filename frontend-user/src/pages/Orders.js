import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Modal, Descriptions, message, Spin, Empty } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;

const ORDER_STATUS_MAP = {
  0: { label: '待付款', color: 'orange' },
  1: { label: '待发货', color: 'blue' },
  2: { label: '已发货', color: 'cyan' },
  3: { label: '已完成', color: 'green' },
  4: { label: '已取消', color: 'default' },
  5: { label: '申请退款', color: 'purple' },
  6: { label: '已退款', color: 'purple' },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await request.get('/order/list');
      setOrders(res.data || []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (order) => {
    try {
      const modal = Modal.confirm({
        title: '确认支付',
        content: `确定要支付订单 ${order.order_no}，金额 ¥${order.total_amount} 吗？`,
        onOk: async () => {
          try {
            await request.post(`/order/${order.id}/pay`);
            message.success('支付成功');
            fetchOrders();
          } catch (error) {
            console.error('支付失败:', error);
            message.error('支付失败，余额不足或其他原因');
          }
        },
      });
    } catch (error) {
      console.error('支付失败:', error);
    }
  };

  const handleConfirmReceive = async (order) => {
    try {
      await request.post(`/order/${order.id}/confirm`);
      message.success('确认收货成功');
      fetchOrders();
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  };

  const handleRefund = async (order) => {
    try {
      const modal = Modal.confirm({
        title: '申请退款',
        content: `确定要对订单 ${order.order_no} 申请退款吗？`,
        onOk: async () => {
          try {
            await request.post(`/order/${order.id}/refund`);
            message.success('退款申请已提交');
            fetchOrders();
          } catch (error) {
            console.error('申请退款失败:', error);
            message.error('申请退款失败');
          }
        },
      });
    } catch (error) {
      console.error('申请退款失败:', error);
    }
  };

  const showDetail = (record) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: '订单号',
      key: 'order_no',
      render: (_, record) => <Text copyable>{record.order_no}</Text>,
    },
    {
      title: '订单状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusInfo = ORDER_STATUS_MAP[record.status] || { label: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '总金额',
      key: 'total_amount',
      width: 120,
      render: (_, record) => (
        <Text type="danger" strong>
          ¥{record.total_amount}
        </Text>
      ),
    },
    {
      title: '下单时间',
      key: 'created_at',
      width: 180,
      render: (_, record) => new Date(record.created_at).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === 0 && (
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={() => handlePay(record)}
            >
              付款
            </Button>
          )}
          {record.status === 2 && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirmReceive(record)}
            >
              确认收货
            </Button>
          )}
          {record.status === 3 && (
            <Button
              size="small"
              danger
              onClick={() => handleRefund(record)}
            >
              申请退款
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} className="section-title">
        我的订单
      </Title>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : orders.length > 0 ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={orders}
            pagination={{
              showTotal: (total) => `共 ${total} 条订单`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无订单"
          />
        )}
      </Card>

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="订单号">{selectedOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {(() => {
                  const statusInfo = ORDER_STATUS_MAP[selectedOrder.status] || { label: '未知', color: 'default' };
                  return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="收货人">{selectedOrder.receiver}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedOrder.phone}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {selectedOrder.address}
              </Descriptions.Item>
              <Descriptions.Item label="商品金额">¥{selectedOrder.product_amount}</Descriptions.Item>
              <Descriptions.Item label="运费">¥{selectedOrder.shipping_fee || 0}</Descriptions.Item>
              <Descriptions.Item label="订单总金额" span={2}>
                <Text type="danger" strong style={{ fontSize: 18 }}>
                  ¥{selectedOrder.total_amount}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">{new Date(selectedOrder.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString() : '未支付'}
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Text strong>订单商品：</Text>
                <Table
                  rowKey="id"
                  dataSource={selectedOrder.items}
                  columns={[
                    {
                      title: '商品名称',
                      key: 'product_name',
                      render: (_, item) => item.product?.name || '未知商品',
                    },
                    {
                      title: '商品图片',
                      key: 'product_image',
                      width: 80,
                      render: (_, item) => (
                        <img
                          src={item.product?.image || 'https://picsum.photos/60/60'}
                          alt=""
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                      ),
                    },
                    {
                      title: '单价',
                      key: 'price',
                      width: 100,
                      render: (_, item) => `¥${item.price}`,
                    },
                    {
                      title: '数量',
                      key: 'quantity',
                      width: 80,
                    },
                    {
                      title: '小计',
                      key: 'subtotal',
                      width: 120,
                      render: (_, item) => (
                        <Text type="danger" strong>¥{(item.price * item.quantity).toFixed(2)}</Text>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )}

            {selectedOrder.logistics && (
              <div style={{ marginTop: 24 }}>
                <Text strong>物流信息：</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="物流公司">{selectedOrder.logistics.company}</Descriptions.Item>
                  <Descriptions.Item label="物流单号">{selectedOrder.logistics.tracking_number}</Descriptions.Item>
                  <Descriptions.Item label="发货时间">
                    {selectedOrder.logistics.shipped_at ? new Date(selectedOrder.logistics.shipped_at).toLocaleString() : '未知'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

export default Orders;
