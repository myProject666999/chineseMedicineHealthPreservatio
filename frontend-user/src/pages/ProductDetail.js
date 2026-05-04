import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Image, Descriptions, InputNumber, message, Spin } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, ShopOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;

function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await request.get(`/product/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('获取产品详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await request.post('/cart', {
        product_id: product.id,
        quantity: quantity,
      });
      message.success('已添加到购物车');
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (error) {
      console.error('添加到购物车失败:', error);
    }
  };

  const handleBuyNow = async () => {
    try {
      await request.post('/cart', {
        product_id: product.id,
        quantity: quantity,
      });
      message.success('已添加到购物车，请前往购物车结算');
      navigate('/cart');
    } catch (error) {
      console.error('添加到购物车失败:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Text type="secondary">产品不存在</Text>
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

      <Card>
        <Row gutter={24}>
          <Col xs={24} md={10}>
            <Image
              src={product.image || 'https://picsum.photos/600/600'}
              alt={product.name}
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Title level={3}>{product.name}</Title>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 24, color: '#f5222d', fontWeight: 'bold' }}>
                ¥{product.price}
              </span>
              {product.original_price > 0 && (
                <span style={{ marginLeft: 16, color: '#999', textDecoration: 'line-through' }}>
                  ¥{product.original_price}
                </span>
              )}
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="品牌">{product.brand || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="规格">{product.specification || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="厂家">{product.manufacturer || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="库存">
                <Text type={product.stock > 0 ? 'success' : 'danger'}>
                  {product.stock} 件
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="销量">{product.sales_count || 0} 件</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>数量:</span>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={setQuantity}
              />
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                加入购物车
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ShopOutlined />}
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }}
              >
                立即购买
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="产品详情" style={{ marginTop: 24 }}>
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
        {!product.description && (
          <Text type="secondary">暂无产品详情</Text>
        )}
      </Card>
    </div>
  );
}

export default ProductDetail;
