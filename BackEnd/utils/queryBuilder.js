// utils/queryBuilder.js

const generateDynamicUpdate = (tableName, updateData, id) => {
    // 1. Lọc bỏ trường 'id' nếu Frontend lỡ gửi lên (Tuyệt đối không cho sửa Primary Key)
    const data = { ...updateData };
    delete data.id;

    const keys = Object.keys(data);
    
    if (keys.length === 0) {
        return { query: null, values: null };
    }

    // 2. Tự động sinh chuỗi SET. VD: "status = $1, shipping_name = $2, base_price = $3"
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // 3. Lấy mảng giá trị tương ứng
    const values = Object.values(data);
    
    // 4. Nhét cái ID vào cuối mảng để dùng cho mệnh đề WHERE
    values.push(id); 

    // 5. Ráp thành câu lệnh SQL hoàn chỉnh
    // ID sẽ là tham số cuối cùng (ví dụ có 3 trường update thì ID sẽ là $4)
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    return { query, values };
};

module.exports = { generateDynamicUpdate };