package config

import (
	"log"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret string
	Expire int
}

var AppConfig *Config

func InitConfig() {
	AppConfig = &Config{
		Server: ServerConfig{
			Port: "8080",
			Mode: "debug",
		},
		Database: DatabaseConfig{
			Host:     "localhost",
			Port:     "3306",
			User:     "root",
			Password: "123456",
			DBName:   "chinese_medicine_health",
		},
		JWT: JWTConfig{
			Secret: "chinese_medicine_health_secret_key_2024",
			Expire: 72,
		},
	}

	log.Println("Config initialized successfully")
}
