import React, { useState } from 'react';
import { Card, Steps, Button, Radio, Typography, Form, Input, message, Result, Divider } from 'antd';
import { UserOutlined, MedicineBoxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const CONSTITUTION_TYPES = [
  { value: 'balanced', label: '平和体质', description: '阴阳气血调和，体态适中，面色红润，精力充沛。' },
  { value: 'qi-deficiency', label: '气虚体质', description: '元气不足，容易疲乏，气短，自汗。' },
  { value: 'yang-deficiency', label: '阳虚体质', description: '阳气不足，畏寒怕冷，手足不温。' },
  { value: 'yin-deficiency', label: '阴虚体质', description: '阴液亏少，口燥咽干，手足心热。' },
  { value: 'phlegm-dampness', label: '痰湿体质', description: '痰湿凝聚，体型肥胖，腹部肥满，口黏苔腻。' },
  { value: 'damp-heat', label: '湿热体质', description: '面垢油光，口苦口干，身重困倦。' },
  { value: 'blood-stasis', label: '血瘀体质', description: '血行不畅，肤色晦暗，色素沉着。' },
  { value: 'qi-stagnation', label: '气郁体质', description: '气机郁滞，神情抑郁，忧虑脆弱。' },
  { value: 'special-inherited', label: '特禀体质', description: '先天失常，生理缺陷，过敏反应。' },
];

const QUESTIONS = [
  {
    id: 1,
    question: '您是否容易疲乏？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 2,
    question: '您是否容易气短？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 3,
    question: '您是否容易心慌？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 4,
    question: '您是否比别人怕冷？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 5,
    question: '您是否比别人怕热？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 6,
    question: '您是否容易感到口干或口苦？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 7,
    question: '您是否皮肤容易出油？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
  {
    id: 8,
    question: '您是否容易情绪低落或忧郁？',
    options: [
      { value: 3, label: '总是' },
      { value: 2, label: '经常' },
      { value: 1, label: '有时' },
      { value: 0, label: '从不' },
    ],
  },
];

function ConstitutionTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values) => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    
    let predictedType = 'balanced';
    if (totalScore > 10) {
      if (answers[1] >= 2 || answers[2] >= 2 || answers[3] >= 2) {
        predictedType = 'qi-deficiency';
      } else if (answers[4] >= 2) {
        predictedType = 'yang-deficiency';
      } else if (answers[5] >= 2 || answers[6] >= 2) {
        predictedType = 'yin-deficiency';
      } else if (answers[7] >= 2) {
        predictedType = 'damp-heat';
      } else if (answers[8] >= 2) {
        predictedType = 'qi-stagnation';
      }
    }

    const typeInfo = CONSTITUTION_TYPES.find(t => t.value === predictedType) || CONSTITUTION_TYPES[0];

    try {
      setLoading(true);
      await request.post('/health/constitution-test', {
        ...values,
        answers: JSON.stringify(answers),
        result_type: predictedType,
        result_description: typeInfo.description,
      });
      message.success('体质测试完成！');
      setCurrentStep(3);
    } catch (error) {
      console.error('提交测试失败:', error);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  let predictedType = 'balanced';
  if (totalScore > 10) {
    if (answers[1] >= 2 || answers[2] >= 2 || answers[3] >= 2) {
      predictedType = 'qi-deficiency';
    } else if (answers[4] >= 2) {
      predictedType = 'yang-deficiency';
    } else if (answers[5] >= 2 || answers[6] >= 2) {
      predictedType = 'yin-deficiency';
    } else if (answers[7] >= 2) {
      predictedType = 'damp-heat';
    } else if (answers[8] >= 2) {
      predictedType = 'qi-stagnation';
    }
  }
  const typeInfo = CONSTITUTION_TYPES.find(t => t.value === predictedType) || CONSTITUTION_TYPES[0];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ padding: '20px 0' }}>
            <Title level={4}>第1步：填写基本信息</Title>
            <Form
              form={form}
              layout="vertical"
              initialValues={{ gender: 'male' }}
            >
              <Form.Item name="name" label="姓名">
                <Input placeholder="请输入姓名" />
              </Form.Item>
              <Form.Item name="gender" label="性别">
                <Radio.Group>
                  <Radio value="male">男</Radio>
                  <Radio value="female">女</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="age" label="年龄">
                <Input type="number" placeholder="请输入年龄" />
              </Form.Item>
              <Form.Item name="occupation" label="职业">
                <Input placeholder="请输入职业" />
              </Form.Item>
            </Form>
          </div>
        );
      case 1:
        return (
          <div style={{ padding: '20px 0' }}>
            <Title level={4}>第2步：回答问题</Title>
            <Paragraph type="secondary">
              请根据您的实际情况回答以下问题，帮助我们判断您的体质类型。
            </Paragraph>
            <Divider />
            {QUESTIONS.map((q, index) => (
              <div key={q.id} style={{ marginBottom: 24 }}>
                <Text strong>{index + 1}. {q.question}</Text>
                <Radio.Group
                  style={{ display: 'block', marginTop: 8 }}
                  value={answers[q.id]}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                >
                  {q.options.map(opt => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div style={{ padding: '20px 0' }}>
            <Title level={4}>第3步：补充说明</Title>
            <Form form={form} layout="vertical">
              <Form.Item name="symptoms" label="主要症状">
                <TextArea rows={4} placeholder="请描述您目前的主要症状（如：容易疲劳、失眠、消化不良等）" />
              </Form.Item>
              <Form.Item name="medical_history" label="病史">
                <TextArea rows={3} placeholder="请描述您的病史（如：高血压、糖尿病等）" />
              </Form.Item>
              <Form.Item name="lifestyle" label="生活习惯">
                <TextArea rows={3} placeholder="请描述您的生活习惯（如：饮食、作息、运动等）" />
              </Form.Item>
            </Form>
          </div>
        );
      case 3:
        return (
          <div style={{ padding: '40px 0' }}>
            <Result
              status="success"
              icon={<MedicineBoxOutlined />}
              title="体质测试完成！"
              subTitle={`根据您的回答，您的体质类型倾向于：${typeInfo.label}`}
            />
            <Card title="体质分析" style={{ marginTop: 24 }}>
              <Paragraph><Text strong>体质类型：</Text>{typeInfo.label}</Paragraph>
              <Paragraph><Text strong>体质特点：</Text>{typeInfo.description}</Paragraph>
              <Divider />
              <Title level={5}>养生建议</Title>
              <List>
                {predictedType === 'balanced' && (
                  <>
                    <List.Item>• 保持平和心态，情绪稳定</List.Item>
                    <List.Item>• 饮食规律，营养均衡</List.Item>
                    <List.Item>• 适度运动，劳逸结合</List.Item>
                  </>
                )}
                {predictedType === 'qi-deficiency' && (
                  <>
                    <List.Item>• 宜食用补气健脾食物，如山药、黄芪、大枣</List.Item>
                    <List.Item>• 避免过度劳累，保证充足睡眠</List.Item>
                    <List.Item>• 适度运动，选择太极拳、八段锦等温和运动</List.Item>
                  </>
                )}
                {predictedType === 'yang-deficiency' && (
                  <>
                    <List.Item>• 宜食用温阳食物，如羊肉、生姜、桂圆</List.Item>
                    <List.Item>• 注意保暖，避免寒冷刺激</List.Item>
                    <List.Item>• 适度晒太阳，增加户外活动</List.Item>
                  </>
                )}
                {predictedType === 'yin-deficiency' && (
                  <>
                    <List.Item>• 宜食用滋阴食物，如银耳、百合、莲子</List.Item>
                    <List.Item>• 避免辛辣燥热食物，戒烟限酒</List.Item>
                    <List.Item>• 保持充足睡眠，避免熬夜</List.Item>
                  </>
                )}
                {predictedType === 'damp-heat' && (
                  <>
                    <List.Item>• 宜食用清热利湿食物，如薏米、冬瓜、绿豆</List.Item>
                    <List.Item>• 避免辛辣油腻食物，戒烟限酒</List.Item>
                    <List.Item>• 保持居住环境干燥通风</List.Item>
                  </>
                )}
                {predictedType === 'qi-stagnation' && (
                  <>
                    <List.Item>• 宜食用疏肝理气食物，如陈皮、玫瑰花、茉莉花</List.Item>
                    <List.Item>• 保持心情舒畅，多参加社交活动</List.Item>
                    <List.Item>• 选择有氧运动，如散步、瑜伽</List.Item>
                  </>
                )}
              </List>
            </Card>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setCurrentStep(0);
                  setAnswers({});
                  form.resetFields();
                }}
              >
                重新测试
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Title level={3} className="section-title">
        <UserOutlined style={{ marginRight: 8 }} />
        体质测试
      </Title>

      <Card className="health-card">
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="基本信息" />
          <Step title="回答问题" />
          <Step title="补充说明" />
          <Step title="查看结果" />
        </Steps>

        {renderStepContent()}

        {currentStep < 3 && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={currentStep === 0}
              onClick={handlePrev}
            >
              上一步
            </Button>
            {currentStep < 2 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={loading}
              >
                提交测试
              </Button>
            )}
          </div>
        )}
      </Card>

      <Form
        form={form}
        onFinish={handleSubmit}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ConstitutionTest;
