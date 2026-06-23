// utils/queryBuilder.js

// Sinh câu lệnh UPDATE động cho 1 bảng.
// allowedFields: danh sách cột được phép cập nhật (allowlist). Bắt buộc truyền vào
// để chống mass-assignment (client tự ý sửa cột nhạy cảm như user_id, payment_status...).
const generateDynamicUpdate = (tableName, updateData, id, allowedFields = null) => {
    // 1. Lọc bỏ trường 'id' nếu Frontend lỡ gửi lên (Tuyệt đối không cho sửa Primary Key)
    const data = { ...updateData };
    delete data.id;

    let keys = Object.keys(data);

    // 2. Nếu có allowlist thì CHỈ giữ lại các cột được phép cập nhật.
    if (Array.isArray(allowedFields)) {
        keys = keys.filter((key) => allowedFields.includes(key));
    }

    if (keys.length === 0) {
        return { query: null, values: null };
    }

    // 3. Tự động sinh chuỗi SET. VD: "name" = $1, "logo_url" = $2
    const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(', ');

    // 4. Lấy mảng giá trị tương ứng ĐÚNG THEO keys đã lọc (tránh lệch index với values).
    const values = keys.map((key) => data[key]);

    // 5. Nhét ID vào cuối mảng để dùng cho mệnh đề WHERE.
    values.push(id);

    // 6. Ráp thành câu lệnh SQL hoàn chỉnh. ID là tham số cuối cùng.
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    return { query, values };
};

module.exports = { generateDynamicUpdate };