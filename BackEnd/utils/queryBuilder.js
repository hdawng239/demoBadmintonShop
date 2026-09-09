// Chỉ cho phép sửa các cột trong allowedFields.
const generateDynamicUpdate = (tableName, updateData, id, allowedFields = null) => {
    const data = { ...updateData };
    delete data.id;

    let keys = Object.keys(data);

    if (Array.isArray(allowedFields)) {
        keys = keys.filter((key) => allowedFields.includes(key));
    }

    if (keys.length === 0) {
        return { query: null, values: null };
    }

    const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(', ');
    const values = keys.map((key) => data[key]);
    values.push(id);

    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    return { query, values };
};

module.exports = { generateDynamicUpdate };
