import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Pagination, Empty, Select, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShopOutlined, SearchOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title } = Typography;
const { Meta } = Card;
const { Option } = Select;

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [pagination.current, categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await request.get('/category/product/list');
      setCategories(res.data || []);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/product/list?page=${pagination.current}&page_size=${pagination.pageSize}`;
      if (categoryId > 0) {
        url += `&category_id=${categoryId}`;
      }
      const res = await request.get(url);
      setProducts(res.data?.list || []);
      setPagination(prev => ({
        ...prev,
        total: res.data?.total || 0,
      }));
    } catch (error) {
      console.error('获取产品失败:', error);
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

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  return (
    <div>
      <Title level={3} className="section-title">
        <ShopOutlined style={{ marginRight: 8 }} />
        养生产品
      </Title>

      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Select
          style={{ width: 200 }}
          placeholder="选择分类"
          allowClear
          value={categoryId || undefined}
          onChange={handleCategoryChange}
        >
          <Option value={0}>全部分类</Option>
          {categories.map(cat => (
            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
          ))}
        </Select>
        <Input.Search
          placeholder="搜索产品"
          allowClear
          style={{ width: 300 }}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={12} sm={8} md={6} key={product.id}>
                <Card
                  hoverable
                  className="card-hover product-card"
                  cover={
                    <img
                      alt={product.name}
                      src={product.image || 'https://picsum.photos/400/300'}
                      className="product-image"
                      onClick={() => navigate(`/products/${product.id}`)}
                    />
                  }
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="product-name">{product.name}</div>
                  <div>
                    <span className="product-price">¥{product.price}</span>
                    {product.original_price > 0 && (
                      <span className="product-original-price">¥{product.original_price}</span>
                    )}
                  </div>
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    <span>库存: {product.stock}</span>
                    <span style={{ marginLeft: 16 }}>销量: {product.sales_count || 0}</span>
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
              pageSizeOptions={['12', '24', '48']}
              showTotal={(total) => `共 ${total} 件商品`}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无产品" />
      )}
    </div>
  );
}

export default Products;
