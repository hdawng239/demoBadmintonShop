const { Pool } = require('pg');
require('dotenv').config();

const client = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'badminton_db',
    password: process.env.DB_PASSWORD || '1',
    port: process.env.DB_PORT || 5432,
});

const products = [
    // VỢT CẦU LÔNG (6)
    {
        name: "Vợt Cầu Lông Yonex Astrox 88D Pro",
        slug: "vot-cau-long-yonex-astrox-88d-pro",
        description: "Vợt tấn công uy lực dành cho đánh đôi.",
        base_price: 3500000,
        category_id: 1,
        brand_id: 1,
        technical_specs: { length: 66, width: 25, height: 1, weight_g: 500 },
        variants: [
            { name: "3U - Đỏ Trắng", attrs: { "Trọng lượng": "3U", "Màu sắc": "Đỏ Trắng" } },
            { name: "4U - Đỏ Trắng", attrs: { "Trọng lượng": "4U", "Màu sắc": "Đỏ Trắng" } }
        ]
    },
    {
        name: "Vợt Cầu Lông Yonex Astrox 88S Pro",
        slug: "vot-cau-long-yonex-astrox-88s-pro",
        description: "Vợt kiểm soát tốt dành cho đánh đôi.",
        base_price: 3500000,
        category_id: 1,
        brand_id: 1,
        technical_specs: { length: 66, width: 25, height: 1, weight_g: 500 },
        variants: [
            { name: "3U - Xanh", attrs: { "Trọng lượng": "3U", "Màu sắc": "Xanh" } },
            { name: "4U - Xanh", attrs: { "Trọng lượng": "4U", "Màu sắc": "Xanh" } }
        ]
    },
    {
        name: "Vợt Cầu Lông Lining Axforce 80",
        slug: "vot-cau-long-lining-axforce-80",
        description: "Vợt cao cấp của Lining.",
        base_price: 3200000,
        category_id: 1,
        brand_id: 2,
        technical_specs: { length: 66, width: 25, height: 1, weight_g: 500 },
        variants: [
            { name: "4U - Đen", attrs: { "Trọng lượng": "4U", "Màu sắc": "Đen" } },
            { name: "5U - Đen", attrs: { "Trọng lượng": "5U", "Màu sắc": "Đen" } }
        ]
    },
    {
        name: "Vợt Cầu Lông Lining Tectonic 7",
        slug: "vot-cau-long-lining-tectonic-7",
        description: "Vợt công thủ toàn diện.",
        base_price: 2800000,
        category_id: 1,
        brand_id: 2,
        technical_specs: { length: 66, width: 25, height: 1, weight_g: 500 },
        variants: [
            { name: "4U - Trắng", attrs: { "Trọng lượng": "4U", "Màu sắc": "Trắng" } }
        ]
    },
    {
        name: "Vợt Cầu Lông Victor Thruster Ryuga",
        slug: "vot-cau-long-victor-thruster-ryuga",
        description: "Vợt tấn công mạnh mẽ.",
        base_price: 3100000,
        category_id: 1,
        brand_id: 5,
        technical_specs: { length: 66, width: 25, height: 1, weight_g: 500 },
        variants: [
            { name: "3U - Cam", attrs: { "Trọng lượng": "3U", "Màu sắc": "Cam" } },
            { name: "4U - Cam", attrs: { "Trọng lượng": "4U", "Màu sắc": "Cam" } }
        ]
    },
    {
        name: "Vợt Cầu Lông Victor Jetspeed S12",
        slug: "vot-cau-long-victor-jetspeed-s12",
        description: "Vợt phản tạt cực nhanh.",
        base_price: 2900000,
        category_id: 1,
        brand_id: 5,
        technical_specs: { length: 66, width: 25, height: 1, weight_g: 500 },
        variants: [
            { name: "4U - Xanh Lá", attrs: { "Trọng lượng": "4U", "Màu sắc": "Xanh Lá" } }
        ]
    },

    // GIÀY CẦU LÔNG (6)
    {
        name: "Giày Cầu Lông Yonex 65Z3 Men",
        slug: "giay-cau-long-yonex-65z3-men",
        description: "Giày cầu lông êm ái, bám sân.",
        base_price: 2500000,
        category_id: 2,
        brand_id: 1,
        technical_specs: { length: 30, width: 20, height: 15, weight_g: 800 },
        variants: [
            { name: "Size 40 - Trắng", attrs: { "Size": "40", "Màu sắc": "Trắng" } },
            { name: "Size 41 - Trắng", attrs: { "Size": "41", "Màu sắc": "Trắng" } },
            { name: "Size 42 - Trắng", attrs: { "Size": "42", "Màu sắc": "Trắng" } }
        ]
    },
    {
        name: "Giày Cầu Lông Yonex Eclipsion Z3",
        slug: "giay-cau-long-yonex-eclipsion-z3",
        description: "Giày ổn định, chống lật cổ chân.",
        base_price: 2700000,
        category_id: 2,
        brand_id: 1,
        technical_specs: { length: 30, width: 20, height: 15, weight_g: 800 },
        variants: [
            { name: "Size 41 - Xanh", attrs: { "Size": "41", "Màu sắc": "Xanh" } },
            { name: "Size 42 - Xanh", attrs: { "Size": "42", "Màu sắc": "Xanh" } }
        ]
    },
    {
        name: "Giày Cầu Lông Lining Halberd 3.0",
        slug: "giay-cau-long-lining-halberd-3",
        description: "Giày cầu lông siêu bền.",
        base_price: 1800000,
        category_id: 2,
        brand_id: 2,
        technical_specs: { length: 30, width: 20, height: 15, weight_g: 800 },
        variants: [
            { name: "Size 40 - Đen", attrs: { "Size": "40", "Màu sắc": "Đen" } },
            { name: "Size 41 - Đen", attrs: { "Size": "41", "Màu sắc": "Đen" } }
        ]
    },
    {
        name: "Giày Cầu Lông Lining Cloud Ace",
        slug: "giay-cau-long-lining-cloud-ace",
        description: "Giày nhẹ, thoải mái.",
        base_price: 1200000,
        category_id: 2,
        brand_id: 2,
        technical_specs: { length: 30, width: 20, height: 15, weight_g: 800 },
        variants: [
            { name: "Size 39 - Đỏ", attrs: { "Size": "39", "Màu sắc": "Đỏ" } },
            { name: "Size 40 - Đỏ", attrs: { "Size": "40", "Màu sắc": "Đỏ" } }
        ]
    },
    {
        name: "Giày Cầu Lông Victor P9200",
        slug: "giay-cau-long-victor-p9200",
        description: "Giày bảo vệ bàn chân tốt.",
        base_price: 2100000,
        category_id: 2,
        brand_id: 5,
        technical_specs: { length: 30, width: 20, height: 15, weight_g: 800 },
        variants: [
            { name: "Size 41 - Trắng Xanh", attrs: { "Size": "41", "Màu sắc": "Trắng Xanh" } },
            { name: "Size 42 - Trắng Xanh", attrs: { "Size": "42", "Màu sắc": "Trắng Xanh" } }
        ]
    },
    {
        name: "Giày Cầu Lông Victor A970",
        slug: "giay-cau-long-victor-a970",
        description: "Giày di chuyển linh hoạt.",
        base_price: 2300000,
        category_id: 2,
        brand_id: 5,
        technical_specs: { length: 30, width: 20, height: 15, weight_g: 800 },
        variants: [
            { name: "Size 40 - Đen", attrs: { "Size": "40", "Màu sắc": "Đen" } },
            { name: "Size 43 - Đen", attrs: { "Size": "43", "Màu sắc": "Đen" } }
        ]
    },

    // QUẦN ÁO NAM (4)
    {
        name: "Áo Cầu Lông Nam Yonex 10492",
        slug: "ao-cau-long-nam-yonex-10492",
        description: "Áo thấm hút mồ hôi tốt.",
        base_price: 450000,
        category_id: 6,
        brand_id: 1,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size M - Đỏ", attrs: { "Size": "M", "Màu sắc": "Đỏ" } },
            { name: "Size L - Đỏ", attrs: { "Size": "L", "Màu sắc": "Đỏ" } },
            { name: "Size XL - Đỏ", attrs: { "Size": "XL", "Màu sắc": "Đỏ" } }
        ]
    },
    {
        name: "Quần Cầu Lông Nam Lining AATQ",
        slug: "quan-cau-long-nam-lining-aatq",
        description: "Quần thể thao nhẹ nhàng.",
        base_price: 350000,
        category_id: 6,
        brand_id: 2,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size L - Đen", attrs: { "Size": "L", "Màu sắc": "Đen" } },
            { name: "Size XL - Đen", attrs: { "Size": "XL", "Màu sắc": "Đen" } }
        ]
    },
    {
        name: "Áo Cầu Lông Nam Victor T-3000",
        slug: "ao-cau-long-nam-victor-t-3000",
        description: "Thiết kế thể thao mạnh mẽ.",
        base_price: 400000,
        category_id: 6,
        brand_id: 5,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size M - Xanh", attrs: { "Size": "M", "Màu sắc": "Xanh" } },
            { name: "Size L - Xanh", attrs: { "Size": "L", "Màu sắc": "Xanh" } }
        ]
    },
    {
        name: "Quần Cầu Lông Nam Victor R-3000",
        slug: "quan-cau-long-nam-victor-r-3000",
        description: "Thoải mái di chuyển.",
        base_price: 320000,
        category_id: 6,
        brand_id: 5,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size M - Xanh Đen", attrs: { "Size": "M", "Màu sắc": "Xanh Đen" } },
            { name: "Size L - Xanh Đen", attrs: { "Size": "L", "Màu sắc": "Xanh Đen" } }
        ]
    },

    // QUẦN ÁO NỮ (4)
    {
        name: "Áo Cầu Lông Nữ Yonex 20692",
        slug: "ao-cau-long-nu-yonex-20692",
        description: "Áo thiết kế vừa vặn cho nữ.",
        base_price: 450000,
        category_id: 8,
        brand_id: 1,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size S - Hồng", attrs: { "Size": "S", "Màu sắc": "Hồng" } },
            { name: "Size M - Hồng", attrs: { "Size": "M", "Màu sắc": "Hồng" } }
        ]
    },
    {
        name: "Váy Cầu Lông Nữ Yonex 26084",
        slug: "vay-cau-long-nu-yonex-26084",
        description: "Váy thể thao nữ tính.",
        base_price: 480000,
        category_id: 8,
        brand_id: 1,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size M - Trắng", attrs: { "Size": "M", "Màu sắc": "Trắng" } },
            { name: "Size L - Trắng", attrs: { "Size": "L", "Màu sắc": "Trắng" } }
        ]
    },
    {
        name: "Áo Cầu Lông Nữ Lining AVSQ",
        slug: "ao-cau-long-nu-lining-avsq",
        description: "Vải mát, mỏng nhẹ.",
        base_price: 380000,
        category_id: 8,
        brand_id: 2,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size M - Cam", attrs: { "Size": "M", "Màu sắc": "Cam" } },
            { name: "Size L - Cam", attrs: { "Size": "L", "Màu sắc": "Cam" } }
        ]
    },
    {
        name: "Váy Cầu Lông Nữ Victor K-2000",
        slug: "vay-cau-long-nu-victor-k-2000",
        description: "Thoải mái linh hoạt.",
        base_price: 420000,
        category_id: 8,
        brand_id: 5,
        technical_specs: { length: 25, width: 20, height: 2, weight_g: 250 },
        variants: [
            { name: "Size S - Xanh", attrs: { "Size": "S", "Màu sắc": "Xanh" } },
            { name: "Size M - Xanh", attrs: { "Size": "M", "Màu sắc": "Xanh" } }
        ]
    },

    // TÚI VỢT CẦU LÔNG (4)
    {
        name: "Túi Vợt Yonex BAG92231",
        slug: "tui-vot-yonex-bag92231",
        description: "Túi chứa được 6 vợt.",
        base_price: 1500000,
        category_id: 7,
        brand_id: 1,
        technical_specs: { length: 70, width: 30, height: 10, weight_g: 600 },
        variants: [
            { name: "Màu Đen Trắng", attrs: { "Màu sắc": "Đen Trắng" } }
        ]
    },
    {
        name: "Túi Vợt Yonex BAG2208",
        slug: "tui-vot-yonex-bag2208",
        description: "Balo cầu lông đa năng.",
        base_price: 1200000,
        category_id: 7,
        brand_id: 1,
        technical_specs: { length: 50, width: 30, height: 20, weight_g: 600 },
        variants: [
            { name: "Màu Xanh Đậm", attrs: { "Màu sắc": "Xanh Đậm" } }
        ]
    },
    {
        name: "Túi Vợt Lining ABJS033",
        slug: "tui-vot-lining-abjs033",
        description: "Túi 9 ngăn rộng rãi.",
        base_price: 1800000,
        category_id: 7,
        brand_id: 2,
        technical_specs: { length: 70, width: 30, height: 10, weight_g: 600 },
        variants: [
            { name: "Màu Đỏ", attrs: { "Màu sắc": "Đỏ" } }
        ]
    },
    {
        name: "Balo Vợt Victor BR9008",
        slug: "balo-vot-victor-br9008",
        description: "Gọn gàng tiện lợi.",
        base_price: 950000,
        category_id: 7,
        brand_id: 5,
        technical_specs: { length: 50, width: 30, height: 20, weight_g: 600 },
        variants: [
            { name: "Màu Đen Cam", attrs: { "Màu sắc": "Đen Cam" } }
        ]
    },

    // PHỤ KIỆN (6) (Cước: 9, Tất: 10, Quấn cán: 11)
    {
        name: "Cước Cầu Lông Yonex BG65",
        slug: "cuoc-cau-long-yonex-bg65",
        description: "Cước siêu bền bỉ.",
        base_price: 130000,
        category_id: 9,
        brand_id: 1,
        technical_specs: { length: 10, width: 10, height: 1, weight_g: 50 },
        variants: [
            { name: "Trắng", attrs: { "Màu sắc": "Trắng" } },
            { name: "Vàng", attrs: { "Màu sắc": "Vàng" } }
        ]
    },
    {
        name: "Cước Cầu Lông Yonex BG80",
        slug: "cuoc-cau-long-yonex-bg80",
        description: "Cước nảy, tấn công tốt.",
        base_price: 170000,
        category_id: 9,
        brand_id: 1,
        technical_specs: { length: 10, width: 10, height: 1, weight_g: 50 },
        variants: [
            { name: "Vàng", attrs: { "Màu sắc": "Vàng" } }
        ]
    },
    {
        name: "Cước Cầu Lông Lining No.1",
        slug: "cuoc-cau-long-lining-no1",
        description: "Cước nảy vang.",
        base_price: 150000,
        category_id: 9,
        brand_id: 2,
        technical_specs: { length: 10, width: 10, height: 1, weight_g: 50 },
        variants: [
            { name: "Trắng", attrs: { "Màu sắc": "Trắng" } }
        ]
    },
    {
        name: "Tất Cầu Lông Yonex Thể Thao",
        slug: "tat-cau-long-yonex-the-thao",
        description: "Dày dặn, êm ái.",
        base_price: 80000,
        category_id: 10,
        brand_id: 1,
        technical_specs: { length: 10, width: 10, height: 2, weight_g: 50 },
        variants: [
            { name: "Đen", attrs: { "Màu sắc": "Đen" } },
            { name: "Trắng", attrs: { "Màu sắc": "Trắng" } }
        ]
    },
    {
        name: "Quấn Cán Cầu Lông Yonex AC102",
        slug: "quan-can-cau-long-yonex-ac102",
        description: "Cuộn 3 chiếc, bám tay.",
        base_price: 120000,
        category_id: 11,
        brand_id: 1,
        technical_specs: { length: 10, width: 10, height: 2, weight_g: 50 },
        variants: [
            { name: "Vàng", attrs: { "Màu sắc": "Vàng" } },
            { name: "Cam", attrs: { "Màu sắc": "Cam" } }
        ]
    },
    {
        name: "Quấn Cán Vải Victor",
        slug: "quan-can-vai-victor",
        description: "Thấm hút mồ hôi tay cực tốt.",
        base_price: 45000,
        category_id: 11,
        brand_id: 5,
        technical_specs: { length: 10, width: 10, height: 2, weight_g: 50 },
        variants: [
            { name: "Đen", attrs: { "Màu sắc": "Đen" } }
        ]
    }
];

async function seedProducts() {
    try {
        await client.query('BEGIN');
        let count = 0;
        
        for (const p of products) {
            // Check if exist
            const check = await client.query('SELECT id FROM products WHERE name = $1', [p.name]);
            if (check.rows.length > 0) continue;

            const query = `
                INSERT INTO products (name, description, base_price, category_id, brand_id, technical_specs, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, true)
                RETURNING id
            `;
            const res = await client.query(query, [
                p.name, p.description, p.base_price, p.category_id, p.brand_id, JSON.stringify(p.technical_specs)
            ]);
            const productId = res.rows[0].id;

            // Insert variants
            for (const v of p.variants) {
                const varQuery = `
                    INSERT INTO product_variants (product_id, variant_name, attributes, stock_quantity)
                    VALUES ($1, $2, $3, $4)
                `;
                await client.query(varQuery, [
                    productId, v.name, JSON.stringify(v.attrs), 50
                ]);
            }
            count++;
        }
        
        await client.query('COMMIT');
        console.log(`Đã thêm thành công ${count} sản phẩm mới!`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Lỗi:", e);
    } finally {
        client.end();
    }
}

seedProducts();
