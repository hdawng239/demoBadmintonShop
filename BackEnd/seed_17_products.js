const pool = require('./config/db');

const productsToInsert = [
  // VỢT (Cat 1) - Variants: 3U/4U x 2 màu
  {
    category_id: 1, brand_id: 1, name: "Vợt Cầu Lông Yonex Astrox 88D Pro", base_price: 3500000, 
    description: "Vợt tấn công thiên hậu, đập cầu cháy sân",
    type: 'vot', colors: ['Trắng', 'Đen']
  },
  {
    category_id: 1, brand_id: 1, name: "Vợt Cầu Lông Yonex Nanoflare 1000Z", base_price: 3900000, 
    description: "Vợt tốc độ cao, phản tạt đỉnh",
    type: 'vot', colors: ['Vàng', 'Đen']
  },
  {
    category_id: 1, brand_id: 2, name: "Vợt Cầu Lông Lining Aeronaut 9000", base_price: 2800000, 
    description: "Vợt cân bằng, trợ lực tốt",
    type: 'vot', colors: ['Đỏ', 'Trắng']
  },
  {
    category_id: 1, brand_id: 5, name: "Vợt Cầu Lông Victor Brave Sword 12", base_price: 2500000, 
    description: "Huyền thoại phản tạt và phòng thủ",
    type: 'vot', colors: ['Xanh', 'Trắng']
  },
  {
    category_id: 1, brand_id: 4, name: "Vợt Cầu Lông Kumpoo Power Control", base_price: 800000, 
    description: "Vợt giá rẻ cho người mới chơi",
    type: 'vot', colors: ['Hồng', 'Trắng']
  },

  // GIÀY (Cat 2) - Variants: 38-44 x Trắng, Đen, Đỏ
  {
    category_id: 2, brand_id: 1, name: "Giày Cầu Lông Yonex Power Cushion 65Z3", base_price: 2900000, 
    description: "Giày êm ái bậc nhất của Yonex",
    type: 'giay'
  },
  {
    category_id: 2, brand_id: 2, name: "Giày Cầu Lông Lining Sonic 11", base_price: 1500000, 
    description: "Giày thiết kế thon gọn, bám sân cực tốt",
    type: 'giay'
  },
  {
    category_id: 2, brand_id: 5, name: "Giày Cầu Lông Victor P9200", base_price: 2200000, 
    description: "Giày form bè ngang, rất thoải mái",
    type: 'giay'
  },
  {
    category_id: 2, brand_id: 4, name: "Giày Cầu Lông Kumpoo K520 Pro", base_price: 700000, 
    description: "Giày siêu bền bỉ cho sinh viên",
    type: 'giay'
  },

  // QUẦN ÁO (Cat 6, 8) - Variants: M, L, XL
  {
    category_id: 6, brand_id: 1, name: "Áo Thi Đấu Yonex Nam 2024", base_price: 450000, 
    description: "Áo công nghệ làm mát VeryCool",
    type: 'ao'
  },
  {
    category_id: 6, brand_id: 2, name: "Quần Đùi Thể Thao Lining Nam", base_price: 350000, 
    description: "Quần co giãn 4 chiều",
    type: 'ao'
  },
  {
    category_id: 8, brand_id: 5, name: "Váy Thể Thao Victor Nữ", base_price: 400000, 
    description: "Váy có quần bảo hộ bên trong",
    type: 'ao'
  },
  {
    category_id: 8, brand_id: 4, name: "Áo Phông Kumpoo Nữ", base_price: 250000, 
    description: "Áo thấm hút mồ hôi siêu tốt",
    type: 'ao'
  },

  // PHỤ KIỆN (Cat 7, 9, 10, 11) - Variants: 3 colors
  {
    category_id: 9, brand_id: 1, name: "Cước Cầu Lông Yonex BG65", base_price: 120000, 
    description: "Cước siêu bền bỉ",
    type: 'phukien', colors: ['Trắng', 'Đen', 'Vàng']
  },
  {
    category_id: 7, brand_id: 1, name: "Balo Cầu Lông Yonex 2 Ngăn", base_price: 650000, 
    description: "Đựng vừa 2 vợt và 1 đôi giày",
    type: 'phukien', colors: ['Xanh Navy', 'Đen', 'Đỏ']
  },
  {
    category_id: 10, brand_id: 2, name: "Tất Cầu Lông Lining Dày Dặn", base_price: 80000, 
    description: "Tất chống phồng rộp",
    type: 'phukien', colors: ['Trắng', 'Đen', 'Xám']
  },
  {
    category_id: 11, brand_id: 1, name: "Quấn Cán Yonex AC102EX (Vỉ 3 Cuộn)", base_price: 150000, 
    description: "Quấn cán bám tay, thấm mồ hôi",
    type: 'phukien', colors: ['Trắng', 'Đen', 'Đỏ']
  }
];

async function seedProducts() {
  try {
    for (const prod of productsToInsert) {
      // 1. Insert Product
      const pRes = await pool.query(
        `INSERT INTO products (category_id, brand_id, name, base_price, description, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [prod.category_id, prod.brand_id, prod.name, prod.base_price, prod.description, true]
      );
      const productId = pRes.rows[0].id;
      
      let variants = [];
      const stock = 10;
      
      // 2. Generate variants based on type
      if (prod.type === 'vot') {
        const weights = ['3U', '4U'];
        const colors = prod.colors;
        for (const w of weights) {
          for (const c of colors) {
            variants.push({
              variant_name: `${w} - ${c}`,
              attributes: { weight: w, color: c },
              price_modifier: 0,
              stock_quantity: stock
            });
          }
        }
      } 
      else if (prod.type === 'giay') {
        const sizes = ['38', '39', '40', '41', '42', '43', '44'];
        const colors = ['Trắng', 'Đen', 'Đỏ'];
        for (const s of sizes) {
          for (const c of colors) {
            variants.push({
              variant_name: `${s} - ${c}`,
              attributes: { size: s, color: c },
              price_modifier: 0,
              stock_quantity: stock
            });
          }
        }
      }
      else if (prod.type === 'ao') {
        const sizes = ['M', 'L', 'XL'];
        for (const s of sizes) {
          variants.push({
            variant_name: s,
            attributes: { size: s },
            price_modifier: 0,
            stock_quantity: stock
          });
        }
      }
      else if (prod.type === 'phukien') {
        const colors = prod.colors;
        for (const c of colors) {
          variants.push({
            variant_name: c,
            attributes: { color: c },
            price_modifier: 0,
            stock_quantity: stock
          });
        }
      }

      // 3. Insert Variants
      for (const v of variants) {
        await pool.query(
          `INSERT INTO product_variants (product_id, variant_name, attributes, price_modifier, stock_quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, v.variant_name, JSON.stringify(v.attributes), v.price_modifier, v.stock_quantity]
        );
      }
      console.log(`Đã thêm sản phẩm: ${prod.name} với ${variants.length} biến thể.`);
    }
    
    console.log("Hoàn thành thêm 17 sản phẩm!");
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    process.exit(0);
  }
}

seedProducts();
