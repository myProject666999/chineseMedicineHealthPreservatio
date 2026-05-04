import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Option } = Select;

const CATEGORY_TYPE_MAP = {
  health: '养生分类',
  product: '产品分类',
  diet: '饮食类型',
  announcement: '公告分类',
};

function CategoryList({ categoryType }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchList();
  }, [categoryType]);

  const fetchList = async () => {
    try {
      setLoading(true);
      let url = '';
      switch (categoryType) {
        case 'health':
          url = '/category/health/list';
          break;
        case 'product':
          url = '/category/product/list';
          break;
        case 'diet':
          url = '/category/diet/list';
          break;
        case 'announcement':
          url = '/category/announcement/list';
          break;
        default:
          url = '/category/health/list';
      }
      const res = await request.get(url);
      setList(res.data || []);
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败');
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
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/admin/category/${id}`);
      message.success('删除成功');
      fetchList();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await request.put(`/admin/category/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        const data = { ...values, type: categoryType };
        await request.post('/admin/category', data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchList();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      width: 100,
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      key: 'created_at',
      dataIndex: 'created_at',
      width: 180,
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
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
      title={CATEGORY_TYPE_MAP[categoryType] || '分类管理'}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </Card>

    <Modal
      title={editingItem ? '编辑分类' : '新增分类'}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={() => form.submit()}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          initialValue={1}
        >
          <Select>
            <Option value={1}>启用</Option>
            <Option value={0}>禁用</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
    </div>
  );
}

export default CategoryList;
