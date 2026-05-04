import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Image, Descriptions, Spin, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;

function HealthDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, [id]);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await request.get(`/health/recommendation/${id}`);
      setHealth(res.data);
    } catch (error) {
      console.error('获取养生详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!health) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Text type="secondary">内容不存在</Text>
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>{health.title}</Title>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, color: '#999' }}>
            <span><EyeOutlined /> 浏览: {health.view_count || 0}</span>
            <span><LikeOutlined /> 点赞: {health.like_count || 0}</span>
          </div>
        </div>

        {health.cover && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Image
              src={health.cover}
              alt={health.title}
              style={{ maxHeight: 400, objectFit: 'contain' }}
            />
          </div>
        )}

        <Divider />

        <Descriptions column={1} bordered>
          {health.category_id && (
            <Descriptions.Item label="分类">
              <Tag color="blue">{health.category_name || '未设置'}</Tag>
            </Descriptions.Item>
          )}
          {health.type && (
            <Descriptions.Item label="类型">
              <Tag color="green">{health.type}</Tag>
            </Descriptions.Item>
          )}
          {health.reason && (
            <Descriptions.Item label="推荐原因">
              {health.reason}
            </Descriptions.Item>
          )}
        </Descriptions>

        {health.exercise && (
          <div style={{ marginTop: 24 }}>
            <Title level={4}>运动建议</Title>
            <div dangerouslySetInnerHTML={{ __html: health.exercise }} />
          </div>
        )}

        {health.acupressure && (
          <div style={{ marginTop: 24 }}>
            <Title level={4}>穴位按摩</Title>
            <div dangerouslySetInnerHTML={{ __html: health.acupressure }} />
          </div>
        )}

        {health.herbal_medicine && (
          <div style={{ marginTop: 24 }}>
            <Title level={4}>中药调理</Title>
            <div dangerouslySetInnerHTML={{ __html: health.herbal_medicine }} />
          </div>
        )}

        {health.content && (
          <div style={{ marginTop: 24 }}>
            <Title level={4}>详细内容</Title>
            <div dangerouslySetInnerHTML={{ __html: health.content }} />
          </div>
        )}

        {!health.exercise && !health.acupressure && !health.herbal_medicine && !health.content && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Text type="secondary">暂无详细内容</Text>
          </div>
        )}
      </Card>
    </div>
  );
}

export default HealthDetail;
