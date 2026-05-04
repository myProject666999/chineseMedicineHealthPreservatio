import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Divider, List, Form, Input, message, Avatar, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, UserOutlined, MessageOutlined, LikeOutlined, EyeOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ForumPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await request.get(`/forum/post/${id}`);
      setPost(res.data);
    } catch (error) {
      console.error('获取帖子详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await request.get(`/forum/post/${id}/comments`);
      setComments(res.data || []);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleSubmitComment = async (values) => {
    try {
      setCommentLoading(true);
      await request.post(`/forum/post/${id}/comment`, values);
      message.success('评论成功');
      form.resetFields();
      fetchComments();
    } catch (error) {
      console.error('评论失败:', error);
      message.error('评论失败');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Text type="secondary">帖子不存在</Text>
        <Button type="link" onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card className="health-card">
        <Title level={3}>{post.title}</Title>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{post.user?.nickname || post.user?.username || '匿名用户'}</Text>
            <div style={{ color: '#999', fontSize: 12 }}>
              发布于 {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            <span><EyeOutlined /> 浏览: {post.view_count || 0}</span>
            <span><LikeOutlined /> 点赞: {post.like_count || 0}</span>
            <span><MessageOutlined /> 评论: {post.comment_count || 0}</span>
          </div>
        </div>

        {post.is_top && <Tag color="red">置顶</Tag>}

        <Divider />

        <div className="forum-content" style={{ minHeight: 100 }}>
          {post.content}
        </div>
      </Card>

      <Card
        title={`评论 (${comments.length})`}
        className="health-card"
        style={{ marginTop: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitComment}
          style={{ marginBottom: 24, padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}
        >
          <Form.Item
            name="content"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea rows={3} placeholder="发表你的评论..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={commentLoading}>
              发表评论
            </Button>
          </Form.Item>
        </Form>

        {comments.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div>
                      <Text strong>{item.user?.nickname || item.user?.username || '匿名用户'}</Text>
                      <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </div>
                  }
                  description={item.content}
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
            暂无评论，快来抢沙发吧！
          </div>
        )}
      </Card>
    </div>
  );
}

export default ForumPostDetail;
