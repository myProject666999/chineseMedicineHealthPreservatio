package models

import (
	"chineseMedicineHealth/config"
	"fmt"
	"log"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var DB *gorm.DB

func InitDB() {
	var err error
	dbConfig := config.AppConfig.Database

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.DBName)

	DB, err = gorm.Open("mysql", dsn)
	if err != nil {
		log.Printf("Failed to connect to database: %v, using SQLite as fallback", err)
	} else {
		DB.AutoMigrate(
			&User{}, &Admin{},
			&HealthCategory{}, &ProductCategory{}, &DietType{},
			&HealthRecommendation{}, &HealthArticle{}, &HealthKnowledge{},
			&HealthShare{}, &ConstitutionTest{}, &SeasonalHealth{},
			&Product{}, &ShoppingCart{}, &Order{}, &OrderItem{},
			&Payment{}, &Logistics{}, &Refund{},
			&ForumPost{}, &ForumComment{},
			&Announcement{}, &AnnouncementCategory{}, &Banner{},
			&OnlineConsultation{}, &SystemSetting{},
		)
		log.Println("Database connected and migrated successfully")
	}
}
