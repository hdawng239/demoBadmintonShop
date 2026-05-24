const pool = require('./config/db');

async function addShippingDimensions() {
  try {
    console.log("Đang thêm kích thước vận chuyển vào bảng products...");

    // Vợt Cầu Lông (category_id = 1)
    await pool.query(`
      UPDATE products 
      SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"length": 66, "width": 25, "height": 1, "weight_g": 500}'::jsonb 
      WHERE category_id = 1;
    `);

    // Giày Cầu Lông (category_id = 2)
    await pool.query(`
      UPDATE products 
      SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"length": 35, "width": 20, "height": 15, "weight_g": 1000}'::jsonb 
      WHERE category_id = 2;
    `);

    // Quần áo nam và nữ (category_id = 6, 8)
    await pool.query(`
      UPDATE products 
      SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"length": 30, "width": 20, "height": 5, "weight_g": 300}'::jsonb 
      WHERE category_id IN (6, 8);
    `);

    // Túi/Balo (category_id = 7)
    await pool.query(`
      UPDATE products 
      SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"length": 75, "width": 30, "height": 20, "weight_g": 1500}'::jsonb 
      WHERE category_id = 7;
    `);

    // Các phụ kiện nhỏ (Cước, Tất, Quấn cán, Phụ kiện chung - category_id = 5, 9, 10, 11)
    await pool.query(`
      UPDATE products 
      SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"length": 15, "width": 10, "height": 5, "weight_g": 100}'::jsonb 
      WHERE category_id IN (5, 9, 10, 11);
    `);

    console.log("Cập nhật thành công thông số GHN cho 30 sản phẩm!");
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    process.exit(0);
  }
}

addShippingDimensions();
