package controllers

import (
	"chineseMedicineHealth/middleware"
	"chineseMedicineHealth/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateHealthRecommendation(c *gin.Context) {
	var req struct {
		Title                string `json:"title" binding:"required"`
		Type                 string `json:"type"`
		Cover                string `json:"cover"`
		Exercise             string `json:"exercise"`
		AcupointMassage      string `json:"acupoint_massage"`
		HerbalMedicine       string `json:"herbal_medicine"`
		RecommendationReason string `json:"recommendation_reason"`
		Content              string `json:"content"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	hr := &models.HealthRecommendation{
		Title:                req.Title,
		Type:                 req.Type,
		Cover:                req.Cover,
		Exercise:             req.Exercise,
		AcupointMassage:      req.AcupointMassage,
		HerbalMedicine:       req.HerbalMedicine,
		RecommendationReason: req.RecommendationReason,
		Content:              req.Content,
		Status:               1,
	}

	if err := models.CreateHealthRecommendation(hr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data":    hr,
	})
}

func GetHealthRecommendations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	items, total, err := models.GetHealthRecommendations(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取列表失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      items,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetHealthRecommendation(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	item, err := models.GetHealthRecommendationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取失败",
		})
		return
	}

	if item == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "数据不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": item,
	})
}

func UpdateHealthRecommendation(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	item, err := models.GetHealthRecommendationByID(uint(id))
	if err != nil || item == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "数据不存在",
		})
		return
	}

	var req struct {
		Title                string `json:"title"`
		Type                 string `json:"type"`
		Cover                string `json:"cover"`
		Exercise             string `json:"exercise"`
		AcupointMassage      string `json:"acupoint_massage"`
		HerbalMedicine       string `json:"herbal_medicine"`
		RecommendationReason string `json:"recommendation_reason"`
		Content              string `json:"content"`
		Status               int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	if req.Title != "" {
		item.Title = req.Title
	}
	if req.Type != "" {
		item.Type = req.Type
	}
	if req.Cover != "" {
		item.Cover = req.Cover
	}
	if req.Exercise != "" {
		item.Exercise = req.Exercise
	}
	if req.AcupointMassage != "" {
		item.AcupointMassage = req.AcupointMassage
	}
	if req.HerbalMedicine != "" {
		item.HerbalMedicine = req.HerbalMedicine
	}
	if req.RecommendationReason != "" {
		item.RecommendationReason = req.RecommendationReason
	}
	if req.Content != "" {
		item.Content = req.Content
	}
	if req.Status != 0 {
		item.Status = req.Status
	}

	if err := models.UpdateHealthRecommendation(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
		"data":    item,
	})
}

func DeleteHealthRecommendation(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteHealthRecommendation(uint(id)); err != nil {
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

func CreateHealthShare(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Images  string `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	if err := models.CreateForumPost(&models.ForumPost{
		UserID:  userID,
		Title:   req.Title,
		Content: req.Content,
		Images:  req.Images,
		Status:  1,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "发布成功，等待审核",
	})
}

func CreateConstitutionTest(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var req struct {
		ConstitutionType string `json:"constitution_type"`
		Score            int    `json:"score"`
		Result           string `json:"result"`
		Suggestion       string `json:"suggestion"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	test := &models.ConstitutionTest{
		UserID:           userID,
		ConstitutionType: req.ConstitutionType,
		Score:            req.Score,
		Result:           req.Result,
		Suggestion:       req.Suggestion,
		TestDate:         time.Now(),
	}

	if err := models.DB.Create(test).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "测试记录保存成功",
		"data":    test,
	})
}
