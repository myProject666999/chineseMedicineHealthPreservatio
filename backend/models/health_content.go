package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type HealthRecommendation struct {
	ID              uint       `gorm:"primary_key" json:"id"`
	Title           string     `gorm:"not null;size:200" json:"title"`
	Type            string     `gorm:"size:100" json:"type"`
	Cover           string     `gorm:"size:500" json:"cover"`
	Exercise        string     `gorm:"type:text" json:"exercise"`
	AcupointMassage string    `gorm:"type:text" json:"acupoint_massage"`
	HerbalMedicine  string     `gorm:"type:text" json:"herbal_medicine"`
	RecommendationReason string `gorm:"type:text" json:"recommendation_reason"`
	Content         string     `gorm:"type:text" json:"content"`
	Status          int        `gorm:"default:1" json:"status"`
	ViewCount       int        `gorm:"default:0" json:"view_count"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	DeletedAt       *time.Time `sql:"index" json:"-"`
}

func (HealthRecommendation) TableName() string {
	return "health_recommendations"
}

type HealthArticle struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Title     string     `gorm:"not null;size:200" json:"title"`
	CategoryID uint      `gorm:"index" json:"category_id"`
	Cover     string     `gorm:"size:500" json:"cover"`
	Author    string     `gorm:"size:100" json:"author"`
	Summary   string     `gorm:"type:text" json:"summary"`
	Content   string     `gorm:"type:text" json:"content"`
	Status    int        `gorm:"default:1" json:"status"`
	ViewCount int        `gorm:"default:0" json:"view_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (HealthArticle) TableName() string {
	return "health_articles"
}

type HealthKnowledge struct {
	ID              uint       `gorm:"primary_key" json:"id"`
	Title           string     `gorm:"not null;size:200" json:"title"`
	CategoryID      uint       `gorm:"index" json:"category_id"`
	Image           string     `gorm:"size:500" json:"image"`
	PreventDisease  string     `gorm:"type:text" json:"prevent_disease"`
	Function        string     `gorm:"type:text" json:"function"`
	RecommendationReason string `gorm:"type:text" json:"recommendation_reason"`
	Content         string     `gorm:"type:text" json:"content"`
	Status          int        `gorm:"default:1" json:"status"`
	ViewCount       int        `gorm:"default:0" json:"view_count"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	DeletedAt       *time.Time `sql:"index" json:"-"`
}

func (HealthKnowledge) TableName() string {
	return "health_knowledge"
}

type HealthShare struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `gorm:"index" json:"user_id"`
	Title     string     `gorm:"not null;size:200" json:"title"`
	Content   string     `gorm:"type:text" json:"content"`
	Images    string     `gorm:"type:text" json:"images"`
	Status    int        `gorm:"default:0" json:"status"`
	ViewCount int        `gorm:"default:0" json:"view_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
	User      User       `gorm:"-" json:"user"`
}

func (HealthShare) TableName() string {
	return "health_shares"
}

type ConstitutionTest struct {
	ID           uint       `gorm:"primary_key" json:"id"`
	UserID       uint       `gorm:"index" json:"user_id"`
	TestDate     time.Time  `json:"test_date"`
	ConstitutionType string   `gorm:"size:100" json:"constitution_type"`
	Score        int        `json:"score"`
	Result       string     `gorm:"type:text" json:"result"`
	Suggestion   string     `gorm:"type:text" json:"suggestion"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
	User         User       `gorm:"-" json:"user"`
}

func (ConstitutionTest) TableName() string {
	return "constitution_tests"
}

type SeasonalHealth struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Title     string     `gorm:"not null;size:200" json:"title"`
	Season    string     `gorm:"size:50" json:"season"`
	Cover     string     `gorm:"size:500" json:"cover"`
	Video     string     `gorm:"size:500" json:"video"`
	Content   string     `gorm:"type:text" json:"content"`
	Status    int        `gorm:"default:1" json:"status"`
	ViewCount int        `gorm:"default:0" json:"view_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (SeasonalHealth) TableName() string {
	return "seasonal_health"
}

func CreateHealthRecommendation(hr *HealthRecommendation) error {
	return DB.Create(hr).Error
}

func GetHealthRecommendationByID(id uint) (*HealthRecommendation, error) {
	var hr HealthRecommendation
	err := DB.First(&hr, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &hr, nil
}

func GetHealthRecommendations(page, pageSize int) ([]HealthRecommendation, int64, error) {
	var items []HealthRecommendation
	var total int64

	DB.Model(&HealthRecommendation{}).Where("status = ?", 1).Count(&total)

	offset := (page - 1) * pageSize
	err := DB.Where("status = ?", 1).Order("created_at desc").
		Offset(offset).Limit(pageSize).Find(&items).Error
	if err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func UpdateHealthRecommendation(hr *HealthRecommendation) error {
	return DB.Save(hr).Error
}

func DeleteHealthRecommendation(id uint) error {
	return DB.Delete(&HealthRecommendation{}, id).Error
}
