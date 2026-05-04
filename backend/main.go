package main

import (
	"chineseMedicineHealth/config"
	"chineseMedicineHealth/models"
	"chineseMedicineHealth/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	config.InitConfig()
	models.InitDB()

	router := gin.Default()

	routes.SetupRoutes(router)

	log.Printf("Server starting on port %s...", config.AppConfig.Server.Port)
	if err := router.Run(":" + config.AppConfig.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
