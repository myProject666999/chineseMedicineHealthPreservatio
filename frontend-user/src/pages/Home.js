import React, { useState, useEffect } from 'react';
import { Carousel, Row, Col, Card, Typography, Empty, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MedicineBoxOutlined,
  ShopOutlined,
  ForumOutlined,
  UserOutlined,
  CalendarOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;
const { Meta } = Card;

function Home() {
  const [banners, setBanners] = useState([]);
  const [healthRecommendations, setHealthRecommendations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [bannersRes, healthRes, productsRes] = await Promise.all([
        request.get('/banner/list'),
        request.get('/health/recommendations?page=1&page_size=4'),
        request.get('/product/list?page=1&page_size=8'),
      ]);

      setBanners(bannersRes.data || []);
      setHealthRecommendations(healthRes.data?.list || []);
      setProducts(productsRes.data?.list || []);
    } catch (error) {
      console.error('获取首页数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'health', icon: <MedicineBoxOutlined />, name: '养生知识', path: '/health' },
    { key: 'products', icon: <ShopOutlined />, name: '养生产品', path: '/products' },
    { key: 'forum', icon: <ForumOutlined />, name: '养生论坛', path: '/forum' },
    { key: 'constitution', icon: <UserOutlined />, name: '体质测试', path: '/constitution-test' },
    { key: 'seasonal', icon: <CalendarOutlined />, name: '四季养生', path: '/health' },
    { key: 'announcements', icon: <NotificationOutlined />, name: '公告信息', path: '/announcements' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {banners.length > 0 ? (
        <Carousel autoplay className="banner-carousel">
          {banners.map((banner) => (
            <div key={banner.id}>
              <img
                src={banner.image || 'https://picsum.photos/1200/300'}
                alt={banner.title}
                className="banner-image"
                onClick={() => banner.link && navigate(banner.link)}
                style={{ cursor: banner.link ? 'pointer' : 'default' }}
              />
            </div>
          ))}
        </Carousel>
      ) : (
        <Carousel autoplay className="banner-carousel">
          <div>
            <img
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20medicine%20health%20preservation%20banner%20with%20herbs%20and%20healthy%20lifestyle%20elements&image_size=landscape_16_9"
              alt="中医养生"
              className="banner-image"
            />
          </div>
          <div>
            <img
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Healthy%20lifestyle%20with%20Chinese%20medicine%20acupuncture%20and%20herbal%20teas&image_size=landscape_16_9"
              alt="健康生活"
              className="banner-image"
            />
          </div>
        </Carousel>
      )}

      <div className="category-grid">
        <Title level={4} className="section-title">
          功能导航
        </Title>
        <Row gutter={[16, 16]}>
          {categories.map((category) => (
            <Col xs={8} sm={6} md={4} key={category.key}>
              <div
                className="category-card card-hover"
                onClick={() => navigate(category.path)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Title level={4} className="section-title">
          养生推荐
        </Title>
        {healthRecommendations.length > 0 ? (
          <Row gutter={[16, 16]}>
            {healthRecommendations.map((item) => (
              <Col xs={24} sm={12} md={6} key={item.id}>
                <Card
                  hoverable
                  className="card-hover product-card"
                  cover={
                    <img
                      alt={item.title}
                      src={item.cover || 'https://picsum.photos/400/200'}
                      className="product-image"
                      onClick={() => navigate(`/health/${item.id}`)}
                    />
                  }
                  onClick={() => navigate(`/health/${item.id}`)}
                >
                  <Meta title={item.title} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无养生推荐" />
        )}
      </div>

      <div>
        <Title level={4} className="section-title">
          热门产品
        </Title>
        {products.length > 0 ? (
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={12} sm={8} md={6} key={product.id}>
                <Card
                  hoverable
                  className="card-hover product-card"
                  cover={
                    <img
                      alt={product.name}
                      src={product.image || 'https://picsum.photos/400/200'}
                      className="product-image"
                      onClick={() => navigate(`/products/${product.id}`)}
                    />
                  }
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="product-name">{product.name}</div>
                  <div>
                    <span className="product-price">¥{product.price}</span>
                    {product.originalPrice > 0 && (
                      <span className="product-original-price">¥{product.originalPrice}</span>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无产品" />
        )}
      </div>
    </div>
  );
}

export default Home;
