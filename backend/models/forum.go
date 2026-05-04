package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type ForumPost struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `gorm:"index" json:"user_id"`
	Title     string     `gorm:"not null;size:200" json:"title"`
	Content   string     `gorm:"type:text" json:"content"`
	Images    string     `gorm:"type:text" json:"images"`
	IsTop     int        `gorm:"default:0" json:"is_top"`
	Status    int        `gorm:"default:1" json:"status"`
	ViewCount int        `gorm:"default:0" json:"view_count"`
	LikeCount int        `gorm:"default:0" json:"like_count"`
	ReplyCount int       `gorm:"default:0" json:"reply_count"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
	User      User       `gorm:"-" json:"user"`
}

func (ForumPost) TableName() string {
	return "forum_posts"
}

type ForumComment struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	PostID    uint       `gorm:"index" json:"post_id"`
	UserID    uint       `gorm:"index" json:"user_id"`
	ParentID  uint       `gorm:"default:0;index" json:"parent_id"`
	Content   string     `gorm:"type:text" json:"content"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
	User      User       `gorm:"-" json:"user"`
}

func (ForumComment) TableName() string {
	return "forum_comments"
}

func CreateForumPost(post *ForumPost) error {
	return DB.Create(post).Error
}

func GetForumPostByID(id uint) (*ForumPost, error) {
	var post ForumPost
	err := DB.First(&post, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &post, nil
}

func GetForumPosts(page, pageSize int) ([]ForumPost, int64, error) {
	var posts []ForumPost
	var total int64

	DB.Model(&ForumPost{}).Where("status = ?", 1).Count(&total)

	offset := (page - 1) * pageSize
	err := DB.Where("status = ?", 1).Order("is_top desc, created_at desc").
		Offset(offset).Limit(pageSize).Find(&posts).Error
	if err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}

func UpdateForumPost(post *ForumPost) error {
	return DB.Save(post).Error
}

func DeleteForumPost(id uint) error {
	return DB.Delete(&ForumPost{}, id).Error
}

func CreateForumComment(comment *ForumComment) error {
	return DB.Create(comment).Error
}

func GetForumCommentsByPostID(postID uint, page, pageSize int) ([]ForumComment, int64, error) {
	var comments []ForumComment
	var total int64

	DB.Model(&ForumComment{}).Where("post_id = ? AND status = ?", postID, 1).Count(&total)

	offset := (page - 1) * pageSize
	err := DB.Where("post_id = ? AND status = ?", postID, 1).Order("created_at desc").
		Offset(offset).Limit(pageSize).Find(&comments).Error
	if err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

func DeleteForumComment(id uint) error {
	return DB.Delete(&ForumComment{}, id).Error
}
