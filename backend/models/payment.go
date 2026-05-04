package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Payment struct {
	ID            uint       `gorm:"primary_key" json:"id"`
	OrderID       uint       `gorm:"index" json:"order_id"`
	OrderNo       string     `gorm:"size:50" json:"order_no"`
	UserID        uint       `gorm:"index" json:"user_id"`
	Amount        float64    `gorm:"type:decimal(10,2)" json:"amount"`
	PayMethod     string     `gorm:"size:50" json:"pay_method"`
	PayStatus     int        `gorm:"default:0" json:"pay_status"`
	PayTime       *time.Time `json:"pay_time"`
	TransactionNo string    `gorm:"size:100" json:"transaction_no"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `sql:"index" json:"-"`
}

func (Payment) TableName() string {
	return "payments"
}

type Logistics struct {
	ID           uint       `gorm:"primary_key" json:"id"`
	OrderID      uint       `gorm:"index" json:"order_id"`
	OrderNo      string     `gorm:"size:50" json:"order_no"`
	LogisticsNo  string     `gorm:"size:100" json:"logistics_no"`
	LogisticsCompany string `gorm:"size:100" json:"logistics_company"`
	ReceiverName string     `gorm:"size:50" json:"receiver_name"`
	ReceiverPhone string    `gorm:"size:20" json:"receiver_phone"`
	ReceiverAddress string  `gorm:"size:500" json:"receiver_address"`
	Status       int        `gorm:"default:0" json:"status"`
	DeliverTime  *time.Time `json:"deliver_time"`
	ReceiveTime  *time.Time `json:"receive_time"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
}

func (Logistics) TableName() string {
	return "logistics"
}

type Refund struct {
	ID            uint       `gorm:"primary_key" json:"id"`
	OrderID       uint       `gorm:"index" json:"order_id"`
	OrderNo       string     `gorm:"size:50" json:"order_no"`
	UserID        uint       `gorm:"index" json:"user_id"`
	Amount        float64    `gorm:"type:decimal(10,2)" json:"amount"`
	Reason        string     `gorm:"size:500" json:"reason"`
	Status        int        `gorm:"default:0" json:"status"`
	RefundTime    *time.Time `json:"refund_time"`
	TransactionNo string    `gorm:"size:100" json:"transaction_no"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `sql:"index" json:"-"`
}

func (Refund) TableName() string {
	return "refunds"
}

func CreatePayment(payment *Payment) error {
	return DB.Create(payment).Error
}

func GetPaymentByOrderID(orderID uint) (*Payment, error) {
	var payment Payment
	err := DB.Where("order_id = ?", orderID).First(&payment).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &payment, nil
}

func UpdatePayment(payment *Payment) error {
	return DB.Save(payment).Error
}

func CreateLogistics(logistics *Logistics) error {
	return DB.Create(logistics).Error
}

func GetLogisticsByOrderID(orderID uint) (*Logistics, error) {
	var logistics Logistics
	err := DB.Where("order_id = ?", orderID).First(&logistics).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &logistics, nil
}

func UpdateLogistics(logistics *Logistics) error {
	return DB.Save(logistics).Error
}

func CreateRefund(refund *Refund) error {
	return DB.Create(refund).Error
}

func GetRefundByID(id uint) (*Refund, error) {
	var refund Refund
	err := DB.First(&refund, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &refund, nil
}

func GetRefundsByOrderID(orderID uint) ([]Refund, error) {
	var refunds []Refund
	err := DB.Where("order_id = ?", orderID).Find(&refunds).Error
	return refunds, err
}

func UpdateRefund(refund *Refund) error {
	return DB.Save(refund).Error
}
