import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Modal, InputNumber, message, Descriptions, Divider } from 'antd';
import { UserOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import request from '../utils/request';

function Profile({ user, setUser }) {
  const [form] = Form.useForm();
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const res = await request.put('/user/info', values);
      message.success('更新成功');
      if (setUser) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (rechargeAmount <= 0) {
      message.error('请输入充值金额');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post('/user/recharge', { amount: rechargeAmount });
      message.success(`充值成功，充值金额: ¥${rechargeAmount}`);
      setRechargeModalVisible(false);
      setRechargeAmount(0);
      
      if (setUser && res.data) {
        const userRes = await request.get('/user/info');
        setUser(userRes.data);
        localStorage.setItem('user', JSON.stringify(userRes.data));
      }
    } catch (error) {
      console.error('充值失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card">
      <Card title="个人信息" className="health-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
          <h2 style={{ marginTop: 16 }}>{user?.nickname || user?.username}</h2>
        </div>

        <Divider />

        <Descriptions column={2} bordered>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user?.nickname || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {user?.created_at ? new Date(user.created_at).toLocaleString() : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="余额">
            <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{user?.balance || 0}</span>
            <Button
              type="link"
              icon={<MoneyCollectOutlined />}
              onClick={() => setRechargeModalVisible(true)}
            >
              充值
            </Button>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="编辑信息" className="health-card" style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            nickname: user?.nickname,
            email: user?.email,
            phone: user?.phone,
            avatar: user?.avatar,
          }}
        >
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item name="avatar" label="头像URL">
            <Input placeholder="请输入头像图片URL" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="账户充值"
        open={rechargeModalVisible}
        onCancel={() => setRechargeModalVisible(false)}
        onOk={handleRecharge}
        confirmLoading={loading}
      >
        <Form.Item label="充值金额" required>
          <InputNumber
            min={0}
            step={10}
            precision={2}
            style={{ width: '100%' }}
            placeholder="请输入充值金额"
            value={rechargeAmount}
            onChange={setRechargeAmount}
            addonBefore="¥"
          />
        </Form.Item>
        <p style={{ color: '#999', fontSize: 12 }}>
          提示：充值金额将直接添加到您的账户余额中
        </p>
      </Modal>
    </div>
  );
}

export default Profile;
