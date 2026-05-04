package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Product struct {
	ID           uint       `gorm:"primary_key" json:"id"`
	Name         string     `gorm:"not null;size:200" json:"name"`
	CategoryID   uint       `gorm:"index" json:"category_id"`
	Image        string     `gorm:"size:500" json:"image"`
	Images       string     `gorm:"type:text" json:"images"`
	Brand        string     `gorm:"size:100" json:"brand"`
	Specification string    `gorm:"size:200" json:"specification"`
	Manufacturer string    `gorm:"size:200" json:"manufacturer"`
	LaunchDate   time.Time  `json:"launch_date"`
	LimitPerUser int        `gorm:"default:0" json:"limit_per_user"`
	Stock        int        `gorm:"default:0" json:"stock"`
	Price        float64    `gorm:"type:decimal(10,2)" json:"price"`
	OriginalPrice float64   `gorm:"type:decimal(10,2)" json:"original_price"`
	Description  string     `gorm:"type:text" json:"description"`
	Status       int        `gorm:"default:1" json:"status"`
	SalesCount   int        `gorm:"default:0" json:"sales_count"`
	ViewCount    int        `gorm:"default:0" json:"view_count"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
}

func (Product) TableName() string {
	return "products"
}

type ShoppingCart struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `gorm:"index" json:"user_id"`
	ProductID uint       `gorm:"index" json:"product_id"`
	Quantity  int        `gorm:"default:1" json:"quantity"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
	Product   Product    `gorm:"-" json:"product"`
}

func (ShoppingCart) TableName() string {
	return "shopping_carts"
}

type Order struct {
	ID              uint       `gorm:"primary_key" json:"id"`
	OrderNo         string     `gorm:"unique_index;size:50" json:"order_no"`
	UserID          uint       `gorm:"index" json:"user_id"`
	TotalAmount     float64    `gorm:"type:decimal(10,2)" json:"total_amount"`
	DiscountAmount  float64    `gorm:"type:decimal(10,2);default:0" json:"discount_amount"`
	PayAmount       float64    `gorm:"type:decimal(10,2)" json:"pay_amount"`
	PayStatus       int        `gorm:"default:0" json:"pay_status"`
	PayTime         *time.Time `json:"pay_time"`
	OrderStatus     int        `gorm:"default:0" json:"order_status"`
	ReceiverName    string     `gorm:"size:50" json:"receiver_name"`
	ReceiverPhone   string     `gorm:"size:20" json:"receiver_phone"`
	ReceiverAddress string     `gorm:"size:500" json:"receiver_address"`
	Remark          string     `gorm:"size:500" json:"remark"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	DeletedAt       *time.Time `sql:"index" json:"-"`
	User            User       `gorm:"-" json:"user"`
	OrderItems      []OrderItem `gorm:"-" json:"order_items"`
}

func (Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	ID         uint       `gorm:"primary_key" json:"id"`
	OrderID    uint       `gorm:"index" json:"order_id"`
	ProductID  uint       `gorm:"index" json:"product_id"`
	ProductName string    `gorm:"size:200" json:"product_name"`
	ProductImage string   `gorm:"size:500" json:"product_image"`
	Price      float64    `gorm:"type:decimal(10,2)" json:"price"`
	Quantity   int        `gorm:"default:1" json:"quantity"`
	TotalPrice float64    `gorm:"type:decimal(10,2)" json:"total_price"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt  *time.Time `sql:"index" json:"-"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

func CreateProduct(product *Product) error {
	return DB.Create(product).Error
}

func GetProductByID(id uint) (*Product, error) {
	var product Product
	err := DB.First(&product, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func GetProducts(page, pageSize int, categoryID uint) ([]Product, int64, error) {
	var products []Product
	var total int64

	query := DB.Model(&Product{}).Where("status = ?", 1)
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&products).Error
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func UpdateProduct(product *Product) error {
	return DB.Save(product).Error
}

func DeleteProduct(id uint) error {
	return DB.Delete(&Product{}, id).Error
}

func CreateShoppingCart(cart *ShoppingCart) error {
	return DB.Create(cart).Error
}

func GetShoppingCartByUserID(userID uint) ([]ShoppingCart, error) {
	var carts []ShoppingCart
	err := DB.Where("user_id = ?", userID).Find(&carts).Error
	return carts, err
}

func DeleteShoppingCart(id uint) error {
	return DB.Delete(&ShoppingCart{}, id).Error
}

func CreateOrder(order *Order) error {
	return DB.Create(order).Error
}

func GetOrderByID(id uint) (*Order, error) {
	var order Order
	err := DB.First(&order, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func GetOrderByOrderNo(orderNo string) (*Order, error) {
	var order Order
	err := DB.Where("order_no = ?", orderNo).First(&order).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func GetOrdersByUserID(userID uint, status int) ([]Order, error) {
	var orders []Order
	query := DB.Where("user_id = ?", userID)
	if status >= 0 {
		query = query.Where("order_status = ?", status)
	}
	err := query.Order("created_at desc").Find(&orders).Error
	return orders, err
}

func UpdateOrder(order *Order) error {
	return DB.Save(order).Error
}
