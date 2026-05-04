package controllers

import (
	"chineseMedicineHealth/middleware"
	"chineseMedicineHealth/models"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateProduct(c *gin.Context) {
	var req struct {
		Name          string  `json:"name" binding:"required"`
		CategoryID    uint    `json:"category_id"`
		Image         string  `json:"image"`
		Images        string  `json:"images"`
		Brand         string  `json:"brand"`
		Specification string  `json:"specification"`
		Manufacturer  string  `json:"manufacturer"`
		LimitPerUser  int     `json:"limit_per_user"`
		Stock         int     `json:"stock"`
		Price         float64 `json:"price"`
		OriginalPrice float64 `json:"original_price"`
		Description   string  `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	product := &models.Product{
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		Image:         req.Image,
		Images:        req.Images,
		Brand:         req.Brand,
		Specification: req.Specification,
		Manufacturer:  req.Manufacturer,
		LaunchDate:    time.Now(),
		LimitPerUser:  req.LimitPerUser,
		Stock:         req.Stock,
		Price:         req.Price,
		OriginalPrice: req.OriginalPrice,
		Description:   req.Description,
		Status:        1,
	}

	if err := models.CreateProduct(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data":    product,
	})
}

func GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID, _ := strconv.Atoi(c.DefaultQuery("category_id", "0"))

	products, total, err := models.GetProducts(page, pageSize, uint(categoryID))
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
			"list":      products,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	product, err := models.GetProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取失败",
		})
		return
	}

	if product == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "产品不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": product,
	})
}

func UpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	product, err := models.GetProductByID(uint(id))
	if err != nil || product == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "产品不存在",
		})
		return
	}

	var req struct {
		Name          string  `json:"name"`
		CategoryID    uint    `json:"category_id"`
		Image         string  `json:"image"`
		Images        string  `json:"images"`
		Brand         string  `json:"brand"`
		Specification string  `json:"specification"`
		Manufacturer  string  `json:"manufacturer"`
		LimitPerUser  int     `json:"limit_per_user"`
		Stock         int     `json:"stock"`
		Price         float64 `json:"price"`
		OriginalPrice float64 `json:"original_price"`
		Description   string  `json:"description"`
		Status        int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.CategoryID != 0 {
		product.CategoryID = req.CategoryID
	}
	if req.Image != "" {
		product.Image = req.Image
	}
	if req.Images != "" {
		product.Images = req.Images
	}
	if req.Brand != "" {
		product.Brand = req.Brand
	}
	if req.Specification != "" {
		product.Specification = req.Specification
	}
	if req.Manufacturer != "" {
		product.Manufacturer = req.Manufacturer
	}
	if req.LimitPerUser != 0 {
		product.LimitPerUser = req.LimitPerUser
	}
	if req.Stock != 0 {
		product.Stock = req.Stock
	}
	if req.Price != 0 {
		product.Price = req.Price
	}
	if req.OriginalPrice != 0 {
		product.OriginalPrice = req.OriginalPrice
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Status != 0 {
		product.Status = req.Status
	}

	if err := models.UpdateProduct(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
		"data":    product,
	})
}

func DeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteProduct(uint(id)); err != nil {
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

func AddToCart(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var req struct {
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	product, err := models.GetProductByID(req.ProductID)
	if err != nil || product == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "产品不存在",
		})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "库存不足",
		})
		return
	}

	cartItem := &models.ShoppingCart{
		UserID:    userID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if err := models.CreateShoppingCart(cartItem); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "添加失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "添加成功",
	})
}

func GetCart(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	carts, err := models.GetShoppingCartByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取购物车失败",
		})
		return
	}

	for i := range carts {
		product, _ := models.GetProductByID(carts[i].ProductID)
		if product != nil {
			carts[i].Product = *product
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": carts,
	})
}

func RemoveFromCart(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := models.DeleteShoppingCart(uint(id)); err != nil {
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

func CreateOrder(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var req struct {
		CartItems       []uint `json:"cart_items"`
		ReceiverName    string `json:"receiver_name" binding:"required"`
		ReceiverPhone   string `json:"receiver_phone" binding:"required"`
		ReceiverAddress string `json:"receiver_address" binding:"required"`
		Remark          string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	user, _ := models.GetUserByID(userID)

	carts, err := models.GetShoppingCartByUserID(userID)
	if err != nil || len(carts) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "购物车为空",
		})
		return
	}

	orderNo := fmt.Sprintf("ORD%s%d", time.Now().Format("20060102150405"), userID)

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, cart := range carts {
		product, _ := models.GetProductByID(cart.ProductID)
		if product != nil {
			itemTotal := float64(cart.Quantity) * product.Price
			totalAmount += itemTotal

			orderItems = append(orderItems, models.OrderItem{
				ProductID:    product.ID,
				ProductName:  product.Name,
				ProductImage: product.Image,
				Price:        product.Price,
				Quantity:     cart.Quantity,
				TotalPrice:   itemTotal,
			})
		}
	}

	if user.Balance < totalAmount {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "余额不足，请先充值",
		})
		return
	}

	order := &models.Order{
		OrderNo:         orderNo,
		UserID:          userID,
		TotalAmount:     totalAmount,
		PayAmount:       totalAmount,
		ReceiverName:    req.ReceiverName,
		ReceiverPhone:   req.ReceiverPhone,
		ReceiverAddress: req.ReceiverAddress,
		Remark:          req.Remark,
		PayStatus:       1,
		OrderStatus:     1,
	}

	if err := models.CreateOrder(order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建订单失败",
		})
		return
	}

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
		models.DB.Create(&orderItems[i])
	}

	if err := models.UpdateUserBalance(userID, -totalAmount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "扣款失败",
		})
		return
	}

	for _, cart := range carts {
		models.DeleteShoppingCart(cart.ID)
	}

	now := time.Now()
	payment := &models.Payment{
		OrderID:   order.ID,
		OrderNo:   orderNo,
		UserID:    userID,
		Amount:    totalAmount,
		PayMethod: "balance",
		PayStatus: 1,
		PayTime:   &now,
	}
	models.CreatePayment(payment)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "下单成功",
		"data": gin.H{
			"order_id":   order.ID,
			"order_no":   orderNo,
			"pay_amount": totalAmount,
		},
	})
}

func GetOrders(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))

	orders, err := models.GetOrdersByUserID(userID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取订单失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": orders,
	})
}

func GetOrder(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	order, err := models.GetOrderByID(uint(id))
	if err != nil || order == nil || order.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "订单不存在",
		})
		return
	}

	var orderItems []models.OrderItem
	models.DB.Where("order_id = ?", order.ID).Find(&orderItems)
	order.OrderItems = orderItems

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": order,
	})
}

func ConfirmReceive(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	order, err := models.GetOrderByID(uint(id))
	if err != nil || order == nil || order.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "订单不存在",
		})
		return
	}

	if order.OrderStatus != 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "订单状态不正确",
		})
		return
	}

	order.OrderStatus = 3
	models.UpdateOrder(order)

	logistics, _ := models.GetLogisticsByOrderID(order.ID)
	if logistics != nil {
		now := time.Now()
		logistics.Status = 2
		logistics.ReceiveTime = &now
		models.UpdateLogistics(logistics)
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "确认收货成功",
	})
}

func ApplyRefund(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	var req struct {
		OrderID uint   `json:"order_id" binding:"required"`
		Reason  string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	order, err := models.GetOrderByID(req.OrderID)
	if err != nil || order == nil || order.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "订单不存在",
		})
		return
	}

	refund := &models.Refund{
		OrderID: order.ID,
		OrderNo: order.OrderNo,
		UserID:  userID,
		Amount:  order.PayAmount,
		Reason:  req.Reason,
		Status:  0,
	}

	if err := models.CreateRefund(refund); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "申请退款失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "申请退款成功",
	})
}
