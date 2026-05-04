import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Pagination, Empty, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MedicineBoxOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;
const { Meta } = Card;

function Health() {
  const [healthRecommendations, setHealthRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchHealthRecommendations();
  }, [pagination.current]);

  const fetchHealthRecommendations = async () => {
    try {
      setLoading(true);
      const res = await request.get(
        `/health/recommendations?page=${pagination.current}&page_size=${pagination.pageSize}`
      );
      setHealthRecommendations(res.data?.list || []);
      setPagination(prev => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('获取养生推荐失败:', error);
    } finally {
      setLoading(false);
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
      <Title level={3} className="section-title">
        <MedicineBoxOutlined style={{ marginRight: 8 }} />
        养生知识
      </Title>

      <div style={{ marginBottom: 24 }}>
        <Tag color="green">养生推荐</Tag>
        <Tag color="blue">四季养生</Tag>
        <Tag color="orange">中医养生</Tag>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : healthRecommendations.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {healthRecommendations.map((item) => (
              <Col xs={24} sm={12} md={6} key={item.id}>
                <Card
                  hoverable
                  className="card-hover product-card health-card"
                  cover={
                    <img
                      alt={item.title}
                      src={item.cover || 'https://picsum.photos/400/250'}
                      style={{ height: 180, objectFit: 'cover' }}
                      onClick={() => navigate(`/health/${item.id}`)}
                    />
                  }
                  onClick={() => navigate(`/health/${item.id}`)}
                >
                  <Meta title={item.title} />
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    <span>浏览量: {item.view_count || 0}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['8', '16', '24']}
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无养生推荐" />
      )}
    </div>
  );
}

export default Health;
