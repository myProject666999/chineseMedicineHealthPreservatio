import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Tag, Button, Modal, Descriptions } from 'antd';
import { NotificationOutlined, EyeOutlined } from '@ant-design/icons';
import request from '../utils/request';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await request.get('/announcement/list');
      setList(res.data || []);
    } catch (error) {
      console.error('获取公告列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  return (
    <div>
      <Title level={3} className="section-title">
        <NotificationOutlined style={{ marginRight: 8 }} />
        公告信息
      </Title>

      <Card className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : list.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={list}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(item)}
                  >
                    查看详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: 16 }}>{item.title}</Text>
                      {item.is_top && <Tag color="red">置顶</Tag>}
                      <Tag color={item.status === 1 ? 'green' : 'default'}>
                        {item.status === 1 ? '已发布' : '草稿'}
                      </Tag>
                    </div>
                  }
                  description={
                    <Text type="secondary">
                      发布时间：{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  }
                />
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8, color: '#666' }}>
                  {item.content || '暂无内容'}
                </Paragraph>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无公告" />
        )}
      </Card>

      <Modal
        title="公告详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedItem && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={3}>{selectedItem.title}</Title>
              <div style={{ color: '#999', marginTop: 8 }}>
                {selectedItem.is_top && <Tag color="red">置顶</Tag>}
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  发布时间：{dayjs(selectedItem.created_at).format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
            </div>
            <Divider />
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selectedItem.content || '暂无内容'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Announcements;
