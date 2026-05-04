package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type HealthCategory struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"not null;size:100" json:"name"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (HealthCategory) TableName() string {
	return "health_categories"
}

type ProductCategory struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"not null;size:100" json:"name"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (ProductCategory) TableName() string {
	return "product_categories"
}

type DietType struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"not null;size:100" json:"name"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (DietType) TableName() string {
	return "diet_types"
}

type AnnouncementCategory struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"not null;size:100" json:"name"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (AnnouncementCategory) TableName() string {
	return "announcement_categories"
}

func CreateHealthCategory(cat *HealthCategory) error {
	return DB.Create(cat).Error
}

func GetHealthCategoryByID(id uint) (*HealthCategory, error) {
	var cat HealthCategory
	err := DB.First(&cat, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &cat, nil
}

func GetAllHealthCategories() ([]HealthCategory, error) {
	var cats []HealthCategory
	err := DB.Where("status = ?", 1).Order("sort asc, id asc").Find(&cats).Error
	return cats, err
}

func UpdateHealthCategory(cat *HealthCategory) error {
	return DB.Save(cat).Error
}

func DeleteHealthCategory(id uint) error {
	return DB.Delete(&HealthCategory{}, id).Error
}

func CreateProductCategory(cat *ProductCategory) error {
	return DB.Create(cat).Error
}

func GetProductCategoryByID(id uint) (*ProductCategory, error) {
	var cat ProductCategory
	err := DB.First(&cat, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &cat, nil
}

func GetAllProductCategories() ([]ProductCategory, error) {
	var cats []ProductCategory
	err := DB.Where("status = ?", 1).Order("sort asc, id asc").Find(&cats).Error
	return cats, err
}

func UpdateProductCategory(cat *ProductCategory) error {
	return DB.Save(cat).Error
}

func DeleteProductCategory(id uint) error {
	return DB.Delete(&ProductCategory{}, id).Error
}
