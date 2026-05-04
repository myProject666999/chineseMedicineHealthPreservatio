import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag, Select, InputNumber, Image, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import request from '../utils/request';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

function ProductList() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, [pagination.current, pagination.pageSize]);

  const fetchCategories = async () => {
    try {
      const res = await request.get('/category/product/list');
      setCategories(res.data || []);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await request.get(
        `/product/list?page=${pagination.current}&page_size=${pagination.pageSize}`
      );
      setList(res.data?.list || []);
      setPagination(prev => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('获取产品列表失败:', error);
      message.error('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      shelf_date: record.shelf_date ? dayjs(record.shelf_date) : undefined,
    });
    setModalVisible(true);
  };

  const handleDetail = (record) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/admin/product/${id}`);
      message.success('删除成功');
      fetchList();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        shelf_date: values.shelf_date ? values.shelf_date.format('YYYY-MM-DD') : undefined,
      };

      if (editingItem) {
        await request.put(`/admin/product/${editingItem.id}`, data);
        message.success('更新成功');
      } else {
        await request.post('/admin/product', data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败');
    }
  };

  const handleTableChange = (pag) => {
    setPagination(prev => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
  };

  const columns = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '商品图片',
      key: 'image',
      dataIndex: 'image',
      width: 80,
      render: (image) => (
        image ? (
          <Image
            width={50}
            height={50}
            src={image}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: '#999' }}>无图</span>
        )
      ),
    },
    {
      title: '商品名称',
      key: 'name',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '分类',
      key: 'category_name',
      dataIndex: 'category_name',
      width: 100,
      render: (name) => name || '未分类',
    },
    {
      title: '品牌',
      key: 'brand',
      dataIndex: 'brand',
      width: 100,
    },
    {
      title: '规格',
      key: 'specification',
      dataIndex: 'specification',
      width: 100,
    },
    {
      title: '价格',
      key: 'price',
      dataIndex: 'price',
      width: 100,
      render: (price) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{price}</span>
      ),
    },
    {
      title: '库存',
      key: 'stock',
      dataIndex: 'stock',
      width: 80,
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="table-card"
        title="产品管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增产品
          </Button>
        }
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
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑产品' : '新增产品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="产品分类"
            rules={[{ required: true, message: '请选择产品分类' }]}
          >
            <Select placeholder="请选择产品分类">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="产品图片URL"
          >
            <Input placeholder="请输入产品图片URL" />
          </Form.Item>

          <Form.Item
            name="brand"
            label="品牌"
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>

          <Form.Item
            name="specification"
            label="规格"
          >
            <Input placeholder="请输入规格" />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="厂家"
          >
            <Input placeholder="请输入厂家" />
          </Form.Item>

          <Form.Item
            name="shelf_date"
            label="上架日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入价格" />
          </Form.Item>

          <Form.Item
            name="original_price"
            label="原价"
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入原价" />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存" />
          </Form.Item>

          <Form.Item
            name="purchase_limit"
            label="单限"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="每人限购数量，0表示不限" />
          </Form.Item>

          <Form.Item
            name="description"
            label="产品介绍"
          >
            <TextArea rows={4} placeholder="请输入产品介绍" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select>
              <Option value={1}>上架</Option>
              <Option value={0}>下架</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="产品详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedItem && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {selectedItem.image && (
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  style={{ maxHeight: 300, objectFit: 'contain' }}
                />
              )}
            </div>
            <Table
              columns={[
                { title: '字段', dataIndex: 'key', width: 120 },
                { title: '值', dataIndex: 'value' },
              ]}
              dataSource={[
                { key: '产品名称', value: selectedItem.name },
                { key: '分类', value: selectedItem.category_name || '未分类' },
                { key: '品牌', value: selectedItem.brand || '-' },
                { key: '规格', value: selectedItem.specification || '-' },
                { key: '厂家', value: selectedItem.manufacturer || '-' },
                { key: '价格', value: `¥${selectedItem.price}` },
                { key: '原价', value: selectedItem.original_price > 0 ? `¥${selectedItem.original_price}` : '-' },
                { key: '库存', value: selectedItem.stock },
                { key: '销量', value: selectedItem.sales_count || 0 },
                { key: '上架日期', value: selectedItem.shelf_date || '-' },
                { key: '状态', value: selectedItem.status === 1 ? '上架' : '下架' },
              ]}
              pagination={false}
              size="small"
            />
            {selectedItem.description && (
              <div style={{ marginTop: 24 }}>
                <h4>产品介绍</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ProductList;
