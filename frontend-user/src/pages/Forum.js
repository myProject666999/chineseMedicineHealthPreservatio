import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, List, Avatar, Spin, Empty, Tag, Pagination, Modal, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MessageOutlined, LikeOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;
const { TextArea } = Input;

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [pagination.current]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await request.get(
        `/forum/list?page=${pagination.current}&page_size=${pagination.pageSize}`
      );
      setPosts(res.data?.list || []);
      setPagination(prev => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('获取论坛帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (values) => {
    try {
      await request.post('/forum/post', values);
      message.success('发布成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchPosts();
    } catch (error) {
      console.error('发布帖子失败:', error);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} className="section-title" style={{ margin: 0 }}>
          <MessageOutlined style={{ marginRight: 8 }} />
          养生论坛
        </Title>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setCreateModalVisible(true)}>
          发布帖子
        </Button>
      </div>

      <Card className="health-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : posts.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              dataSource={posts}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <span key="like"><LikeOutlined /> {item.like_count || 0}</span>,
                    <span key="comment"><MessageOutlined /> {item.comment_count || 0}</span>,
                    <span key="views">浏览: {item.view_count || 0}</span>,
                  ]}
                  extra={item.is_top && <Tag color="red">置顶</Tag>}
                  onClick={() => navigate(`/forum/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>{item.title}</Text>
                        {item.is_top && <Tag color="red">置顶</Tag>}
                      </div>
                    }
                    description={
                      <Text type="secondary">
                        发布于 {new Date(item.created_at).toLocaleString()}
                      </Text>
                    }
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" ellipsis={{ rows: 2 }}>
                      {item.content}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={['10', '20', '50']}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无帖子" />
        )}
      </Card>

      <Modal
        title="发布新帖子"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePost}
        >
          <Form.Item
            name="title"
            label="帖子标题"
            rules={[{ required: true, message: '请输入帖子标题' }]}
          >
            <Input placeholder="请输入帖子标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="帖子内容"
            rules={[{ required: true, message: '请输入帖子内容' }]}
          >
            <TextArea rows={8} placeholder="请输入帖子内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Forum;
