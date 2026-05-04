package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Announcement struct {
	ID             uint       `gorm:"primary_key" json:"id"`
	Title          string     `gorm:"not null;size:200" json:"title"`
	CategoryID     uint       `gorm:"index" json:"category_id"`
	Content        string     `gorm:"type:text" json:"content"`
	Cover          string     `gorm:"size:500" json:"cover"`
	IsTop          int        `gorm:"default:0" json:"is_top"`
	Status         int        `gorm:"default:1" json:"status"`
	ViewCount      int        `gorm:"default:0" json:"view_count"`
	PublishTime    *time.Time `json:"publish_time"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	DeletedAt      *time.Time `sql:"index" json:"-"`
}

func (Announcement) TableName() string {
	return "announcements"
}

type Banner struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Title     string     `gorm:"size:200" json:"title"`
	Image     string     `gorm:"size:500;not null" json:"image"`
	Link      string     `gorm:"size:500" json:"link"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (Banner) TableName() string {
	return "banners"
}

type OnlineConsultation struct {
	ID           uint       `gorm:"primary_key" json:"id"`
	UserID       uint       `gorm:"index" json:"user_id"`
	Title        string     `gorm:"size:200" json:"title"`
	Content      string     `gorm:"type:text" json:"content"`
	Reply        string     `gorm:"type:text" json:"reply"`
	Status       int        `gorm:"default:0" json:"status"`
	ReplyTime    *time.Time `json:"reply_time"`
	RepliedBy    uint       `gorm:"index" json:"replied_by"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
	User         User       `gorm:"-" json:"user"`
}

func (OnlineConsultation) TableName() string {
	return "online_consultations"
}

type SystemSetting struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Key       string     `gorm:"unique_index;size:100;not null" json:"key"`
	Value     string     `gorm:"type:text" json:"value"`
	Title     string     `gorm:"size:200" json:"title"`
	Remark    string     `gorm:"size:500" json:"remark"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (SystemSetting) TableName() string {
	return "system_settings"
}

func CreateAnnouncement(ann *Announcement) error {
	return DB.Create(ann).Error
}

func GetAnnouncementByID(id uint) (*Announcement, error) {
	var ann Announcement
	err := DB.First(&ann, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &ann, nil
}

func GetAnnouncements(page, pageSize int, categoryID uint) ([]Announcement, int64, error) {
	var announcements []Announcement
	var total int64

	query := DB.Model(&Announcement{}).Where("status = ?", 1)
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("is_top desc, created_at desc").
		Offset(offset).Limit(pageSize).Find(&announcements).Error
	if err != nil {
		return nil, 0, err
	}

	return announcements, total, nil
}

func UpdateAnnouncement(ann *Announcement) error {
	return DB.Save(ann).Error
}

func DeleteAnnouncement(id uint) error {
	return DB.Delete(&Announcement{}, id).Error
}

func CreateBanner(banner *Banner) error {
	return DB.Create(banner).Error
}

func GetBannerByID(id uint) (*Banner, error) {
	var banner Banner
	err := DB.First(&banner, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &banner, nil
}

func GetAllBanners() ([]Banner, error) {
	var banners []Banner
	err := DB.Where("status = ?", 1).Order("sort asc, id asc").Find(&banners).Error
	return banners, err
}

func UpdateBanner(banner *Banner) error {
	return DB.Save(banner).Error
}

func DeleteBanner(id uint) error {
	return DB.Delete(&Banner{}, id).Error
}

func CreateOnlineConsultation(consult *OnlineConsultation) error {
	return DB.Create(consult).Error
}

func GetOnlineConsultationByID(id uint) (*OnlineConsultation, error) {
	var consult OnlineConsultation
	err := DB.First(&consult, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &consult, nil
}

func GetOnlineConsultationsByUserID(userID uint, page, pageSize int) ([]OnlineConsultation, int64, error) {
	var consultations []OnlineConsultation
	var total int64

	DB.Model(&OnlineConsultation{}).Where("user_id = ?", userID).Count(&total)

	offset := (page - 1) * pageSize
	err := DB.Where("user_id = ?", userID).Order("created_at desc").
		Offset(offset).Limit(pageSize).Find(&consultations).Error
	if err != nil {
		return nil, 0, err
	}

	return consultations, total, nil
}

func UpdateOnlineConsultation(consult *OnlineConsultation) error {
	return DB.Save(consult).Error
}
