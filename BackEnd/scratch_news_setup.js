const pool = require('./config/db');

async function cleanupAndSeed() {
  try {
    console.log("Xóa bảng post_comments...");
    await pool.query(`DROP TABLE IF EXISTS post_comments CASCADE;`);
    
    console.log("Xóa dữ liệu posts cũ...");
    await pool.query(`DELETE FROM posts;`);
    
    console.log("Thêm bài viết mẫu...");
    // Lấy user_id đầu tiên
    const userRes = await pool.query('SELECT id FROM users LIMIT 1');
    const authorId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
    
    if (!authorId) {
       console.log("Không có user nào, tạo 1 user tạm...");
       const newUser = await pool.query(`INSERT INTO users (full_name, email, password, role) VALUES ('Admin', 'admin@news.com', '123', 'admin') RETURNING id`);
       authorId = newUser.rows[0].id;
    }

    const posts = [
      {
        author_id: authorId,
        title: "VNB Premium tung chương trình siêu khuyến mãi chào hè",
        slug: "vnb-premium-khuyen-mai-chao-he",
        content: "<p>Đón chào mùa hè sôi động, hệ thống cửa hàng VNB Premium mang đến chương trình siêu khuyến mãi giảm giá lên đến 50% cho tất cả các dòng vợt Yonex và Lining.</p><p>Đặc biệt, khách hàng mua sắm với hóa đơn trên 2 triệu đồng sẽ được tặng ngay một túi vợt hoặc balo cao cấp trị giá 500.000đ.</p><p>Chương trình áp dụng từ nay đến hết tháng 6. Hãy nhanh chân đến các cửa hàng VNB gần nhất nhé!</p>",
        thumbnail_url: "https://shopvnb.com/uploads/gallery/khuyen-mai-vnb.jpg"
      },
      {
        author_id: authorId,
        title: "Cách chọn vợt cầu lông phù hợp cho người mới bắt đầu",
        slug: "cach-chon-vot-cau-long-cho-nguoi-moi",
        content: "<p>Việc chọn vợt cầu lông phù hợp là vô cùng quan trọng đối với người mới chơi. Nó ảnh hưởng trực tiếp đến kỹ thuật và khả năng phát triển của bạn sau này.</p><h2>1. Trọng lượng vợt (U)</h2><p>Người mới nên chọn vợt có trọng lượng 4U (80-84g) hoặc 5U. Vợt nhẹ giúp bạn dễ dàng xoay sở và không bị mỏi tay.</p><h2>2. Độ cứng của đũa vợt</h2><p>Đũa vợt dẻo sẽ trợ lực tốt hơn cho người mới chơi vì khả năng uốn cong và bật nảy tốt.</p>",
        thumbnail_url: "https://shopvnb.com/uploads/gallery/vot-cau-long-cho-nguoi-moi.jpg"
      },
      {
        author_id: authorId,
        title: "Kỹ thuật đập cầu (Smash) uy lực như vận động viên chuyên nghiệp",
        slug: "ky-thuat-dap-cau-smash-uy-luc",
        content: "<p>Cú đập cầu (smash) là kỹ thuật tấn công mạnh mẽ nhất trong cầu lông, nhằm ghi điểm trực tiếp.</p><h3>Các bước thực hiện cú smash hoàn hảo:</h3><ul><li><strong>Chuẩn bị:</strong> Di chuyển nhanh ra phía sau cầu, cơ thể hơi nghiêng về phía sau, dồn trọng tâm vào chân trụ.</li><li><strong>Điểm mù và vung vợt:</strong> Vung vợt từ phía sau lên cao, cổ tay gập mạnh khi tiếp xúc cầu ở điểm cao nhất.</li><li><strong>Theo đà:</strong> Sau khi đánh trúng cầu, để vợt đi theo quán tính xuống dưới và nhanh chóng trở về vị trí trung tâm chuẩn bị phòng thủ.</li></ul>",
        thumbnail_url: "https://shopvnb.com/uploads/gallery/ky-thuat-smash.jpg"
      }
    ];

    for (const p of posts) {
      await pool.query(
        `INSERT INTO posts (author_id, title, slug, content, thumbnail_url) VALUES ($1, $2, $3, $4, $5)`,
        [p.author_id, p.title, p.slug, p.content, p.thumbnail_url]
      );
    }
    
    console.log("Xong!");
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    process.exit();
  }
}

cleanupAndSeed();
