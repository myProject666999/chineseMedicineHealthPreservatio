package routes

import (
	"chineseMedicineHealth/controllers"
	"chineseMedicineHealth/middleware"
	"chineseMedicineHealth/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := router.Group("/api")
	{
		user := api.Group("/user")
		{
			user.POST("/register", controllers.Register)
			user.POST("/login", controllers.Login)
			user.GET("/info", middleware.UserAuth(), controllers.GetUserInfo)
			user.PUT("/info", middleware.UserAuth(), controllers.UpdateUserInfo)
			user.POST("/recharge", middleware.UserAuth(), controllers.Recharge)
		}

		admin := api.Group("/admin")
		{
			admin.POST("/login", controllers.AdminLogin)
			admin.GET("/info", middleware.AdminAuth(), controllers.GetAdminInfo)
			admin.GET("/users", middleware.AdminAuth(), controllers.GetUserList)
		}

		category := api.Group("/category")
		{
			category.GET("/:type/list", controllers.GetCategories)
			category.POST("/:type", middleware.AdminAuth(), controllers.CreateCategory)
			category.PUT("/:type/:id", middleware.AdminAuth(), controllers.UpdateCategory)
			category.DELETE("/:type/:id", middleware.AdminAuth(), controllers.DeleteCategory)
		}

		health := api.Group("/health")
		{
			health.GET("/recommendations", controllers.GetHealthRecommendations)
			health.GET("/recommendations/:id", controllers.GetHealthRecommendation)
			health.POST("/recommendations", middleware.AdminAuth(), controllers.CreateHealthRecommendation)
			health.PUT("/recommendations/:id", middleware.AdminAuth(), controllers.UpdateHealthRecommendation)
			health.DELETE("/recommendations/:id", middleware.AdminAuth(), controllers.DeleteHealthRecommendation)

			health.POST("/share", middleware.UserAuth(), controllers.CreateHealthShare)
			health.POST("/constitution-test", middleware.UserAuth(), controllers.CreateConstitutionTest)
		}

		product := api.Group("/product")
		{
			product.GET("/list", controllers.GetProducts)
			product.GET("/:id", controllers.GetProduct)
			product.POST("", middleware.AdminAuth(), controllers.CreateProduct)
			product.PUT("/:id", middleware.AdminAuth(), controllers.UpdateProduct)
			product.DELETE("/:id", middleware.AdminAuth(), controllers.DeleteProduct)
		}

		cart := api.Group("/cart")
		{
			cart.Use(middleware.UserAuth())
			cart.GET("", controllers.GetCart)
			cart.POST("", controllers.AddToCart)
			cart.DELETE("/:id", controllers.RemoveFromCart)
		}

		order := api.Group("/order")
		{
			order.Use(middleware.UserAuth())
			order.GET("/list", controllers.GetOrders)
			order.GET("/:id", controllers.GetOrder)
			order.POST("", controllers.CreateOrder)
			order.POST("/confirm/:id", controllers.ConfirmReceive)
			order.POST("/refund", controllers.ApplyRefund)
		}

		forum := api.Group("/forum")
		{
			forum.GET("/posts", GetForumPosts)
			forum.GET("/posts/:id", GetForumPost)
			forum.POST("/posts", middleware.UserAuth(), CreateForumPost)
			forum.GET("/posts/:id/comments", GetForumComments)
			forum.POST("/posts/:id/comments", middleware.UserAuth(), CreateForumComment)
		}

		adminForum := api.Group("/admin/forum")
		{
			adminForum.Use(middleware.AdminAuth())
			adminForum.DELETE("/posts/:id", DeleteForumPost)
			adminForum.PUT("/posts/:id/top", SetForumPostTop)
			adminForum.DELETE("/comments/:id", DeleteForumComment)
		}

		announcement := api.Group("/announcement")
		{
			announcement.GET("/list", GetAnnouncements)
			announcement.GET("/:id", GetAnnouncement)
			announcement.POST("", middleware.AdminAuth(), CreateAnnouncement)
			announcement.PUT("/:id", middleware.AdminAuth(), UpdateAnnouncement)
			announcement.DELETE("/:id", middleware.AdminAuth(), DeleteAnnouncement)
		}

		banner := api.Group("/banner")
		{
			banner.GET("/list", GetBanners)
			banner.POST("", middleware.AdminAuth(), CreateBanner)
			banner.PUT("/:id", middleware.AdminAuth(), UpdateBanner)
			banner.DELETE("/:id", middleware.AdminAuth(), DeleteBanner)
		}

		consultation := api.Group("/consultation")
		{
			consultation.Use(middleware.UserAuth())
			consultation.GET("/list", GetConsultations)
			consultation.GET("/:id", GetConsultation)
			consultation.POST("", CreateConsultation)
		}

		adminConsultation := api.Group("/admin/consultation")
		{
			adminConsultation.Use(middleware.AdminAuth())
			adminConsultation.GET("/list", GetAllConsultations)
			adminConsultation.PUT("/:id/reply", ReplyConsultation)
		}

		adminOrder := api.Group("/admin/order")
		{
			adminOrder.Use(middleware.AdminAuth())
			adminOrder.GET("/list", GetAdminOrders)
			adminOrder.GET("/:id", GetAdminOrder)
			adminOrder.PUT("/:id/ship", ShipOrder)
		}
	}
}

func GetForumPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	posts, total, err := models.GetForumPosts(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取帖子列表失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      posts,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetForumPost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	post, err := models.GetForumPostByID(uint(id))
	if err != nil || post == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "帖子不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": post,
	})
}

func CreateForumPost(c *gin.Context) {
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

	post := &models.ForumPost{
		UserID:  userID,
		Title:   req.Title,
		Content: req.Content,
		Images:  req.Images,
		Status:  1,
	}

	if err := models.CreateForumPost(post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "发布失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "发布成功",
		"data":    post,
	})
}

func GetForumComments(c *gin.Context) {
	postID, _ := strconv.Atoi(c.Param("id"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	comments, total, err := models.GetForumCommentsByPostID(uint(postID), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取评论失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      comments,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func CreateForumComment(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	postID, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Content  string `json:"content" binding:"required"`
		ParentID uint   `json:"parent_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	comment := &models.ForumComment{
		PostID:   uint(postID),
		UserID:   userID,
		ParentID: req.ParentID,
		Content:  req.Content,
		Status:   1,
	}

	if err := models.CreateForumComment(comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "评论失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "评论成功",
	})
}

func DeleteForumPost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteForumPost(uint(id)); err != nil {
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

func SetForumPostTop(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	post, err := models.GetForumPostByID(uint(id))
	if err != nil || post == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "帖子不存在",
		})
		return
	}

	if post.IsTop == 1 {
		post.IsTop = 0
	} else {
		post.IsTop = 1
	}

	models.UpdateForumPost(post)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "设置成功",
	})
}

func DeleteForumComment(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteForumComment(uint(id)); err != nil {
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

func GetAnnouncements(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID, _ := strconv.Atoi(c.DefaultQuery("category_id", "0"))

	announcements, total, err := models.GetAnnouncements(page, pageSize, uint(categoryID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取公告失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      announcements,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetAnnouncement(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	announcement, err := models.GetAnnouncementByID(uint(id))
	if err != nil || announcement == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "公告不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": announcement,
	})
}

func CreateAnnouncement(c *gin.Context) {
	var req struct {
		Title      string `json:"title" binding:"required"`
		CategoryID uint   `json:"category_id"`
		Content    string `json:"content"`
		Cover      string `json:"cover"`
		IsTop      int    `json:"is_top"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	now := time.Now()
	announcement := &models.Announcement{
		Title:       req.Title,
		CategoryID:  req.CategoryID,
		Content:     req.Content,
		Cover:       req.Cover,
		IsTop:       req.IsTop,
		Status:      1,
		PublishTime: &now,
	}

	if err := models.CreateAnnouncement(announcement); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data":    announcement,
	})
}

func UpdateAnnouncement(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	announcement, err := models.GetAnnouncementByID(uint(id))
	if err != nil || announcement == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "公告不存在",
		})
		return
	}

	var req struct {
		Title      string `json:"title"`
		CategoryID uint   `json:"category_id"`
		Content    string `json:"content"`
		Cover      string `json:"cover"`
		IsTop      int    `json:"is_top"`
		Status     int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	if req.Title != "" {
		announcement.Title = req.Title
	}
	if req.CategoryID != 0 {
		announcement.CategoryID = req.CategoryID
	}
	if req.Content != "" {
		announcement.Content = req.Content
	}
	if req.Cover != "" {
		announcement.Cover = req.Cover
	}
	if req.IsTop != 0 {
		announcement.IsTop = req.IsTop
	}
	if req.Status != 0 {
		announcement.Status = req.Status
	}

	models.UpdateAnnouncement(announcement)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
	})
}

func DeleteAnnouncement(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteAnnouncement(uint(id)); err != nil {
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

func GetBanners(c *gin.Context) {
	banners, err := models.GetAllBanners()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取轮播图失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": banners,
	})
}

func CreateBanner(c *gin.Context) {
	var req struct {
		Title string `json:"title"`
		Image string `json:"image" binding:"required"`
		Link  string `json:"link"`
		Sort  int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	banner := &models.Banner{
		Title:  req.Title,
		Image:  req.Image,
		Link:   req.Link,
		Sort:   req.Sort,
		Status: 1,
	}

	if err := models.CreateBanner(banner); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data":    banner,
	})
}

func UpdateBanner(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	banner, err := models.GetBannerByID(uint(id))
	if err != nil || banner == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "轮播图不存在",
		})
		return
	}

	var req struct {
		Title  string `json:"title"`
		Image  string `json:"image"`
		Link   string `json:"link"`
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

	if req.Title != "" {
		banner.Title = req.Title
	}
	if req.Image != "" {
		banner.Image = req.Image
	}
	if req.Link != "" {
		banner.Link = req.Link
	}
	if req.Sort != 0 {
		banner.Sort = req.Sort
	}
	if req.Status != 0 {
		banner.Status = req.Status
	}

	models.UpdateBanner(banner)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
	})
}

func DeleteBanner(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteBanner(uint(id)); err != nil {
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

func GetConsultations(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	consultations, total, err := models.GetOnlineConsultationsByUserID(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取咨询列表失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      consultations,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetConsultation(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	consultation, err := models.GetOnlineConsultationByID(uint(id))
	if err != nil || consultation == nil || consultation.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "咨询不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": consultation,
	})
}

func CreateConsultation(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	consultation := &models.OnlineConsultation{
		UserID:  userID,
		Title:   req.Title,
		Content: req.Content,
		Status:  0,
	}

	if err := models.CreateOnlineConsultation(consultation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "提交失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "提交成功",
		"data":    consultation,
	})
}

func GetAllConsultations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var consultations []models.OnlineConsultation
	var total int64

	models.DB.Model(&models.OnlineConsultation{}).Count(&total)

	offset := (page - 1) * pageSize
	models.DB.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&consultations)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      consultations,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ReplyConsultation(c *gin.Context) {
	adminID := middleware.GetCurrentAdminID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	consultation, err := models.GetOnlineConsultationByID(uint(id))
	if err != nil || consultation == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "咨询不存在",
		})
		return
	}

	var req struct {
		Reply string `json:"reply" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	now := time.Now()
	consultation.Reply = req.Reply
	consultation.Status = 1
	consultation.ReplyTime = &now
	consultation.RepliedBy = adminID

	models.UpdateOnlineConsultation(consultation)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "回复成功",
	})
}

func GetAdminOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))

	var orders []models.Order
	var total int64

	query := models.DB.Model(&models.Order{})
	if status >= 0 {
		query = query.Where("order_status = ?", status)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&orders)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      orders,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetAdminOrder(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	order, err := models.GetOrderByID(uint(id))
	if err != nil || order == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "订单不存在",
		})
		return
	}

	var orderItems []models.OrderItem
	models.DB.Where("order_id = ?", order.ID).Find(&orderItems)
	order.OrderItems = orderItems

	logistics, _ := models.GetLogisticsByOrderID(order.ID)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"order":     order,
			"logistics": logistics,
		},
	})
}

func ShipOrder(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	order, err := models.GetOrderByID(uint(id))
	if err != nil || order == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "订单不存在",
		})
		return
	}

	if order.OrderStatus != 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "订单状态不正确",
		})
		return
	}

	var req struct {
		LogisticsNo     string `json:"logistics_no" binding:"required"`
		LogisticsCompany string `json:"logistics_company" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	now := time.Now()
	logistics := &models.Logistics{
		OrderID:         order.ID,
		OrderNo:         order.OrderNo,
		LogisticsNo:     req.LogisticsNo,
		LogisticsCompany: req.LogisticsCompany,
		ReceiverName:    order.ReceiverName,
		ReceiverPhone:   order.ReceiverPhone,
		ReceiverAddress: order.ReceiverAddress,
		Status:          1,
		DeliverTime:     &now,
	}

	if err := models.CreateLogistics(logistics); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "发货失败",
		})
		return
	}

	order.OrderStatus = 2
	models.UpdateOrder(order)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "发货成功",
	})
}
