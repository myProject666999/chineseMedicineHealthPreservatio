package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type User struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Username  string     `gorm:"unique_index;not null;size:50" json:"username"`
	Password  string     `gorm:"not null;size:255" json:"-"`
	Email     string     `gorm:"unique_index;size:100" json:"email"`
	Phone     string     `gorm:"unique_index;size:20" json:"phone"`
	Nickname  string     `gorm:"size:50" json:"nickname"`
	Avatar    string     `gorm:"size:500" json:"avatar"`
	Balance   float64    `gorm:"default:0" json:"balance"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (User) TableName() string {
	return "users"
}

func CreateUser(user *User) error {
	return DB.Create(user).Error
}

func GetUserByID(id uint) (*User, error) {
	var user User
	err := DB.First(&user, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func GetUserByUsername(username string) (*User, error) {
	var user User
	err := DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func UpdateUser(user *User) error {
	return DB.Save(user).Error
}

func UpdateUserBalance(userID uint, amount float64) error {
	return DB.Model(&User{}).Where("id = ?", userID).
		Update("balance", gorm.Expr("balance + ?", amount)).Error
}

func GetUsers(page, pageSize int) ([]User, int64, error) {
	var users []User
	var total int64

	DB.Model(&User{}).Count(&total)

	offset := (page - 1) * pageSize
	err := DB.Offset(offset).Limit(pageSize).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
