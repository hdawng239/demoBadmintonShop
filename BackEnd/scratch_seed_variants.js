const pool = require('./config/db');

async function seedVariants() {
  try {
    console.log("Bắt đầu xử lý dữ liệu...");
    
    // 1. Thêm cột attributes nếu chưa có
    await pool.query(`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS attributes JSONB;`);
    
    // 2. Xóa dữ liệu giỏ hàng và biến thể cũ
    await pool.query(`DELETE FROM cart_items;`);
    await pool.query(`DELETE FROM product_variants;`);
    
    // 3. Lấy tất cả products
    const res = await pool.query(`SELECT id, category_id FROM products`);
    const products = res.rows;
    
    const randomColors2 = ['Màu Xanh', 'Màu Cam'];
    const shoeColors = ['Màu Trắng', 'Màu Đen', 'Màu Đỏ'];
    const accessoryColors = ['Màu Xanh Lá', 'Màu Hồng', 'Màu Vàng'];
    
    let variantsToInsert = [];
    
    for (const p of products) {
      let baseSku = `PR-${p.id}`;
      
      // Áo (Category 6, 8) -> Size (M, L, XL), NO COLOR
      if (p.category_id === 6 || p.category_id === 8) {
        const sizes = ['M', 'L', 'XL'];
        for (const size of sizes) {
          variantsToInsert.push({
            product_id: p.id,
            sku: `${baseSku}-SZ${size}`,
            variant_name: `Size ${size}`,
            stock_quantity: Math.floor(Math.random() * 20) + 10,
            price_modifier: 0,
            attributes: JSON.stringify({"Kích cỡ": size})
          });
        }
      }
      // Giày (Category 2) -> Size 38-44, 3 Màu (Trắng, Đen, Đỏ)
      else if (p.category_id === 2) {
        const sizes = ['38', '39', '40', '41', '42', '43', '44'];
        for (const size of sizes) {
          for (let i = 0; i < shoeColors.length; i++) {
            const color = shoeColors[i];
            variantsToInsert.push({
              product_id: p.id,
              sku: `${baseSku}-SZ${size}-CL${i}`,
              variant_name: `Size ${size} - ${color}`,
              stock_quantity: Math.floor(Math.random() * 10) + 5,
              price_modifier: 0,
              attributes: JSON.stringify({"Kích cỡ": size, "Màu sắc": color})
            });
          }
        }
      }
      // Vợt (Category 1) -> 3U/4U, 2 màu ngẫu nhiên
      else if (p.category_id === 1) {
        const weights = ['3U', '4U'];
        for (const weight of weights) {
          for (let i = 0; i < randomColors2.length; i++) {
            const color = randomColors2[i];
            variantsToInsert.push({
              product_id: p.id,
              sku: `${baseSku}-${weight}-CL${i}`,
              variant_name: `${weight} - ${color}`,
              stock_quantity: Math.floor(Math.random() * 15) + 5,
              price_modifier: 0,
              attributes: JSON.stringify({"Trọng lượng": weight, "Màu sắc": color})
            });
          }
        }
      }
      // Phụ kiện, túi, cước... (Category 5, 7, 9, 10, 11) -> 3 màu ngẫu nhiên
      else {
        for (let i = 0; i < accessoryColors.length; i++) {
          const color = accessoryColors[i];
          variantsToInsert.push({
            product_id: p.id,
            sku: `${baseSku}-CL${i}`,
            variant_name: `${color}`,
            stock_quantity: Math.floor(Math.random() * 30) + 10,
            price_modifier: 0,
            attributes: JSON.stringify({"Màu sắc": color})
          });
        }
      }
    }
    
    // Insert array
    if (variantsToInsert.length > 0) {
      const values = variantsToInsert.map(v => 
        `(${v.product_id}, '${v.sku}', '${v.variant_name}', ${v.stock_quantity}, ${v.price_modifier}, '${v.attributes}'::jsonb)`
      ).join(',');
      
      const insertQuery = `
        INSERT INTO product_variants (product_id, sku, variant_name, stock_quantity, price_modifier, attributes)
        VALUES ${values}
      `;
      await pool.query(insertQuery);
      console.log(`Đã chèn thành công ${variantsToInsert.length} biến thể!`);
    } else {
      console.log("Không có sản phẩm nào để thêm biến thể.");
    }
    
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    process.exit(0);
  }
}

seedVariants();
