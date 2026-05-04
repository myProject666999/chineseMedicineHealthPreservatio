import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Button, Modal, Form, Input, message, Tag, Timeline, Empty, Spin, Select } from 'antd';
import { MessageOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import request from '../utils/request';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const STATUS_MAP = {
  0: { label: '待回复', color: 'orange', icon: <ClockCircleOutlined /> },
  1: { label: '已回复', color: 'green', icon: <CheckCircleOutlined /> },
  2: { label: '已关闭', color: 'default', icon: <CloseCircleOutlined /> },
};

function Consultations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await request.get('/consultation/list');
      setList(res.data || []);
    } catch (error) {
      console.error('获取咨询列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      await request.post('/consultation', values);
      message.success('咨询提交成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchList();
    } catch (error) {
      console.error('提交咨询失败:', error);
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const handleClose = async (id) => {
    try {
      await request.post(`/consultation/${id}/close`);
      message.success('咨询已关闭');
      fetchList();
    } catch (error) {
      console.error('关闭咨询失败:', error);
      message.error('操作失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} className="section-title" style={{ margin: 0 }}>
          <MessageOutlined style={{ marginRight: 8 }} />
          在线咨询
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          发起咨询
        </Button>
      </div>

      <Card className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : list.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={list}
            renderItem={(item) => {
              const status = STATUS_MAP[item.status] || STATUS_MAP[0];
              return (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      size="small"
                      onClick={() => handleViewDetail(item)}
                    >
                      查看详情
                    </Button>,
                    item.status === 1 && (
                      <Button
                        key="close"
                        type="link"
                        size="small"
                        danger
                        onClick={() => handleClose(item.id)}
                      >
                        关闭咨询
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={<MessageOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>{item.title}</Text>
                        <Tag color={status.color}>
                          {status.icon} {status.label}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">
                          咨询类型：{item.type || '其他'}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 16 }}>
                          提交时间：{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            description="暂无咨询记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              发起咨询
            </Button>
          </Empty>
        )}
      </Card>

      <Modal
        title="发起在线咨询"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="title"
            label="咨询标题"
            rules={[{ required: true, message: '请输入咨询标题' }]}
          >
            <Input placeholder="请简要描述您的问题" />
          </Form.Item>

          <Form.Item
            name="type"
            label="咨询类型"
            initialValue="其他"
          >
            <Select>
              <Option value="养生咨询">养生咨询</Option>
              <Option value="饮食调理">饮食调理</Option>
              <Option value="体质分析">体质分析</Option>
              <Option value="产品咨询">产品咨询</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="咨询内容"
            rules={[{ required: true, message: '请输入咨询内容' }]}
          >
            <TextArea
              rows={6}
              placeholder="请详细描述您的问题，我们会尽快为您解答"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="咨询详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          selectedItem?.status === 1 ? (
            <Button onClick={() => handleClose(selectedItem.id)} danger>
              关闭咨询
            </Button>
          ) : null
        }
        width={700}
      >
        {selectedItem && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{selectedItem.title}</Title>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <Tag>类型：{selectedItem.type || '其他'}</Tag>
                {(() => {
                  const status = STATUS_MAP[selectedItem.status] || STATUS_MAP[0];
                  return <Tag color={status.color}>{status.icon} {status.label}</Tag>;
                })()}
                <Text type="secondary">
                  提交时间：{dayjs(selectedItem.created_at).format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
            </div>

            <Timeline>
              <Timeline.Item
                color="blue"
                label={dayjs(selectedItem.created_at).format('YYYY-MM-DD HH:mm')}
              >
                <div>
                  <Text strong>您发起了咨询</Text>
                  <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                    {selectedItem.content}
                  </Paragraph>
                </div>
              </Timeline.Item>

              {selectedItem.reply && (
                <Timeline.Item
                  color="green"
                  label={selectedItem.replied_at ? dayjs(selectedItem.replied_at).format('YYYY-MM-DD HH:mm') : ''}
                >
                  <div>
                    <Text strong style={{ color: '#52c41a' }}>医生回复</Text>
                    <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                      {selectedItem.reply}
                    </Paragraph>
                  </div>
                </Timeline.Item>
              )}
            </Timeline>

            {selectedItem.status === 0 && (
              <Card
                size="small"
                title="继续提问"
                style={{ marginTop: 16 }}
              >
                <Form form={replyForm} layout="vertical">
                  <Form.Item name="reply">
                    <TextArea rows={3} placeholder="如有补充问题，请在此描述" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      onClick={async () => {
                        const values = await replyForm.validateFields();
                        if (values.reply) {
                          try {
                            await request.post(`/consultation/${selectedItem.id}/reply`, values);
                            message.success('提交成功');
                            replyForm.resetFields();
                            fetchList();
                            setDetailModalVisible(false);
                          } catch (error) {
                            console.error('提交失败:', error);
                            message.error('提交失败');
                          }
                        }
                      }}
                    >
                      提交
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Consultations;
