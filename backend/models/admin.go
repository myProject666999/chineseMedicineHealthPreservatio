package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Admin struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Username  string     `gorm:"unique_index;not null;size:50" json:"username"`
	Password  string     `gorm:"not null;size:255" json:"-"`
	RealName  string     `gorm:"size:50" json:"real_name"`
	Role      string     `gorm:"size:50;default:'admin'" json:"role"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (Admin) TableName() string {
	return "admins"
}

func CreateAdmin(admin *Admin) error {
	return DB.Create(admin).Error
}

func GetAdminByID(id uint) (*Admin, error) {
	var admin Admin
	err := DB.First(&admin, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &admin, nil
}

func GetAdminByUsername(username string) (*Admin, error) {
	var admin Admin
	err := DB.Where("username = ?", username).First(&admin).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &admin, nil
}

func UpdateAdmin(admin *Admin) error {
	return DB.Save(admin).Error
}

func GetAdmins(page, pageSize int) ([]Admin, int64, error) {
	var admins []Admin
	var total int64

	DB.Model(&Admin{}).Count(&total)

	offset := (page - 1) * pageSize
	err := DB.Offset(offset).Limit(pageSize).Find(&admins).Error
	if err != nil {
		return nil, 0, err
	}

	return admins, total, nil
}

func DeleteAdmin(id uint) error {
	return DB.Delete(&Admin{}, id).Error
}
