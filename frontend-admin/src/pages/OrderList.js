import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Space, Tag, Select, Descriptions, Timeline, InputNumber } from 'antd';
import { EyeOutlined, EditOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Option } = Select;
const { TextArea } = Input;

const ORDER_STATUS_MAP = {
  0: { label: '待付款', color: 'orange' },
  1: { label: '待发货', color: 'blue' },
  2: { label: '已发货', color: 'cyan' },
  3: { label: '已完成', color: 'green' },
  4: { label: '已取消', color: 'default' },
  5: { label: '申请退款', color: 'purple' },
  6: { label: '已退款', color: 'purple' },
};

function OrderList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchList();
  }, [pagination.current, pagination.pageSize]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await request.get(
        `/admin/orders?page=${pagination.current}&page_size=${pagination.pageSize}`
      );
      setList(res.data?.list || []);
      setPagination(prev => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (record) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  const handleShip = (record) => {
    setSelectedItem(record);
    form.resetFields();
    setShipModalVisible(true);
  };

  const handleSubmitShip = async (values) => {
    try {
      await request.post(`/admin/order/${selectedItem.id}/ship`, values);
      message.success('发货成功');
      setShipModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('发货失败:', error);
      message.error('发货失败');
    }
  };

  const handleRefund = async (record) => {
    Modal.confirm({
      title: '确认退款',
      content: `确定要对订单 ${record.order_no} 进行退款吗？`,
      onOk: async () => {
        try {
          await request.post(`/admin/order/${record.id}/refund`);
          message.success('退款成功');
          fetchList();
        } catch (error) {
          console.error('退款失败:', error);
          message.error('退款失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '订单号',
      key: 'order_no',
      dataIndex: 'order_no',
      width: 180,
      render: (orderNo) => (
        <span style={{ fontFamily: 'monospace' }}>{orderNo}</span>
      ),
    },
    {
      title: '收货人',
      key: 'receiver',
      dataIndex: 'receiver',
      width: 100,
    },
    {
      title: '联系电话',
      key: 'phone',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '订单金额',
      key: 'total_amount',
      dataIndex: 'total_amount',
      width: 100,
      render: (amount) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{amount}</span>
      ),
    },
    {
      title: '订单状态',
      key: 'status',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = ORDER_STATUS_MAP[status] || { label: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '下单时间',
      key: 'created_at',
      dataIndex: 'created_at',
      width: 160,
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
          >
            详情
          </Button>
          {record.status === 1 && (
            <Button
              type="link"
              size="small"
              icon={<CarOutlined />}
              onClick={() => handleShip(record)}
            >
              发货
            </Button>
          )}
          {record.status === 5 && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleRefund(record)}
            >
              处理退款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="table-card"
        title="订单管理"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={(pag) => setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }))}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedItem && (
          <div>
            <Descriptions bordered column={2} size="small" className="order-detail-card">
              <Descriptions.Item label="订单号">{selectedItem.order_no}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {(() => {
                  const statusInfo = ORDER_STATUS_MAP[selectedItem.status] || { label: '未知', color: 'default' };
                  return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="收货人">{selectedItem.receiver}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedItem.phone}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {selectedItem.address}
              </Descriptions.Item>
              <Descriptions.Item label="商品金额">¥{selectedItem.product_amount}</Descriptions.Item>
              <Descriptions.Item label="运费">¥{selectedItem.shipping_fee || 0}</Descriptions.Item>
              <Descriptions.Item label="订单总金额" span={2}>
                <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 18 }}>
                  ¥{selectedItem.total_amount}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {selectedItem.paid_at ? new Date(selectedItem.paid_at).toLocaleString() : '未支付'}
              </Descriptions.Item>
            </Descriptions>

            {selectedItem.items && selectedItem.items.length > 0 && (
              <Card title="订单商品" size="small" className="order-detail-card">
                <Table
                  rowKey="id"
                  columns={[
                    { title: '商品名称', key: 'name', render: (_, item) => item.product?.name },
                    {
                      title: '商品图片',
                      key: 'image',
                      width: 60,
                      render: (_, item) => (
                        item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt=""
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : null
                      ),
                    },
                    { title: '单价', key: 'price', width: 80, render: (_, item) => `¥${item.price}` },
                    { title: '数量', key: 'quantity', width: 60 },
                    {
                      title: '小计',
                      key: 'subtotal',
                      width: 100,
                      render: (_, item) => (
                        <span style={{ color: '#f5222d', fontWeight: 500 }}>
                          ¥{(item.price * item.quantity).toFixed(2)}
                        </span>
                      ),
                    },
                  ]}
                  dataSource={selectedItem.items}
                  pagination={false}
                  size="small"
                />
              </Card>
            )}

            {selectedItem.logistics && (
              <Card title="物流信息" size="small" className="order-detail-card">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="物流公司">{selectedItem.logistics.company}</Descriptions.Item>
                  <Descriptions.Item label="物流单号">{selectedItem.logistics.tracking_number}</Descriptions.Item>
                  <Descriptions.Item label="发货时间">
                    {selectedItem.logistics.shipped_at ? new Date(selectedItem.logistics.shipped_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="发货"
        open={shipModalVisible}
        onCancel={() => setShipModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitShip}
        >
          <Form.Item
            name="company"
            label="物流公司"
            rules={[{ required: true, message: '请输入物流公司' }]}
          >
            <Input placeholder="请输入物流公司，如：顺丰速运、中通快递等" />
          </Form.Item>

          <Form.Item
            name="tracking_number"
            label="物流单号"
            rules={[{ required: true, message: '请输入物流单号' }]}
          >
            <Input placeholder="请输入物流单号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default OrderList;
