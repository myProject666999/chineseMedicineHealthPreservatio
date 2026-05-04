package controllers

import (
	"chineseMedicineHealth/middleware"
	"chineseMedicineHealth/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AdminLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func AdminLogin(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	admin, _ := models.GetAdminByUsername(req.Username)
	if admin == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "管理员不存在",
		})
		return
	}

	if !middleware.CheckPassword(req.Password, admin.Password) {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "密码错误",
		})
		return
	}

	if admin.Status != 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "管理员已被禁用",
		})
		return
	}

	token, err := middleware.GenerateToken(admin.ID, admin.Username, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "生成token失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "登录成功",
		"data": gin.H{
			"token": token,
			"admin": admin,
		},
	})
}

func GetAdminInfo(c *gin.Context) {
	adminID := middleware.GetCurrentAdminID(c)

	admin, err := models.GetAdminByID(adminID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取管理员信息失败",
		})
		return
	}

	if admin == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "管理员不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "success",
		"data":    admin,
	})
}

func CreateCategory(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
		Sort int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	categoryType := c.Param("type")
	var err error

	switch categoryType {
	case "health":
		cat := &models.HealthCategory{
			Name:   req.Name,
			Sort:   req.Sort,
			Status: 1,
		}
		err = models.CreateHealthCategory(cat)
	case "product":
		cat := &models.ProductCategory{
			Name:   req.Name,
			Sort:   req.Sort,
			Status: 1,
		}
		err = models.CreateProductCategory(cat)
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的分类类型",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建分类失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
	})
}

func GetCategories(c *gin.Context) {
	categoryType := c.Param("type")

	switch categoryType {
	case "health":
		cats, err := models.GetAllHealthCategories()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code":    500,
				"message": "获取分类失败",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"data": cats,
		})
	case "product":
		cats, err := models.GetAllProductCategories()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code":    500,
				"message": "获取分类失败",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"data": cats,
		})
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的分类类型",
		})
	}
}

func UpdateCategory(c *gin.Context) {
	categoryType := c.Param("type")
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	uintID := uint(id)

	var req struct {
		Name   string `json:"name"`
		Sort   int    `json:"sort"`
		Status int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	switch categoryType {
	case "health":
		cat, err := models.GetHealthCategoryByID(uintID)
		if err != nil || cat == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"code":    404,
				"message": "分类不存在",
			})
			return
		}
		if req.Name != "" {
			cat.Name = req.Name
		}
		if req.Sort != 0 {
			cat.Sort = req.Sort
		}
		if req.Status != 0 {
			cat.Status = req.Status
		}
		models.UpdateHealthCategory(cat)
	case "product":
		cat, err := models.GetProductCategoryByID(uintID)
		if err != nil || cat == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"code":    404,
				"message": "分类不存在",
			})
			return
		}
		if req.Name != "" {
			cat.Name = req.Name
		}
		if req.Sort != 0 {
			cat.Sort = req.Sort
		}
		if req.Status != 0 {
			cat.Status = req.Status
		}
		models.UpdateProductCategory(cat)
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的分类类型",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
	})
}

func DeleteCategory(c *gin.Context) {
	categoryType := c.Param("type")
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	uintID := uint(id)

	var err error
	switch categoryType {
	case "health":
		err = models.DeleteHealthCategory(uintID)
	case "product":
		err = models.DeleteProductCategory(uintID)
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的分类类型",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "删除失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "删除成功",
	})
}
