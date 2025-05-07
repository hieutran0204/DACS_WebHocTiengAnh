const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/admin_user.controller');

// Danh sách người dùng
router.get('/', userController.getUserList);

// Tạo người dùng
router.get('/create', userController.showCreateForm);
router.post('/create', userController.createUser);

// Sửa người dùng
router.get('/edit/:id', userController.showEditForm);
router.post('/edit/:id', userController.updateUser);

// Xóa người dùng
router.get('/delete/:id', userController.deleteUser);

module.exports = router;