const pool = require('./config/db');

async function seedNinePosts() {
  try {
    console.log("Thêm 9 bài viết mới với nội dung chi tiết...");
    // Lấy user_id đầu tiên
    const userRes = await pool.query('SELECT id FROM users LIMIT 1');
    const authorId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
    
    if (!authorId) {
       console.log("Không có user nào trong DB!");
       return;
    }

    const posts = [
      {
        author_id: authorId,
        title: "Bí quyết chọn vợt cầu lông Yonex phù hợp cho người chơi phong trào",
        slug: "chon-vot-yonex-phong-trao",
        content: `
          <p>Thương hiệu Yonex luôn là lựa chọn hàng đầu của các tín đồ cầu lông trên toàn thế giới. Tuy nhiên, với hàng trăm dòng vợt khác nhau, việc chọn một cây vợt phù hợp không hề đơn giản, đặc biệt là với người chơi phong trào.</p>
          <h2>1. Hiểu về các dòng vợt cơ bản của Yonex</h2>
          <p>Yonex chia vợt của họ thành nhiều dòng chính để phục vụ các phong cách đánh khác nhau. Nổi bật nhất là:</p>
          <ul>
            <li><strong>Astrox:</strong> Dành cho người thích tấn công mạnh mẽ, đập cầu áp đảo. Khung vợt nặng đầu (head-heavy).</li>
            <li><strong>Nanoflare:</strong> Dành cho người thích lối chơi tốc độ, phản tạt nhanh. Khung vợt nhẹ đầu (head-light).</li>
            <li><strong>Arcsaber:</strong> Dành cho lối đánh kiểm soát, điều cầu và phòng thủ phản công. Cân bằng hoàn hảo.</li>
          </ul>
          <h2>2. Chú ý đến thông số U và G</h2>
          <p>Trọng lượng (U) và kích thước cán (G) là hai yếu tố cực kỳ quan trọng. Đối với người chơi phong trào ở Việt Nam, thông số 4U (80-84g) và cán G5 là sự lựa chọn phổ biến và dễ thuần nhất. Tránh chọn vợt 3U nếu bạn chưa có lực cổ tay thật sự tốt vì nó sẽ khiến bạn nhanh chóng mệt mỏi và dễ dính chấn thương.</p>
          <h2>3. Độ cứng của đũa vợt</h2>
          <p>Đừng vội chạy theo các tay vợt chuyên nghiệp mà chọn đũa vợt siêu cứng (extra stiff). Người chơi phong trào nên bắt đầu với đũa dẻo (flexible) hoặc cứng trung bình (medium) để được trợ lực tốt nhất khi phông cầu và đập cầu.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Kỹ thuật di chuyển bước chân (Footwork) - Chìa khóa để làm chủ sân đấu",
        slug: "ky-thuat-di-chuyen-footwork",
        content: `
          <p>Bạn có thể sở hữu cú đập uy lực, nhưng nếu không có kỹ thuật di chuyển tốt, bạn sẽ không bao giờ chạm tới được quả cầu để thực hiện cú đánh đó. Bước chân (Footwork) chính là nền tảng tối thượng trong môn cầu lông.</p>
          <h2>1. Tầm quan trọng của tư thế chuẩn bị</h2>
          <p>Tư thế chuẩn bị đúng là hai chân dang rộng bằng vai, gối hơi khuỵu, gót chân nhón nhẹ và trọng tâm dồn vào mũi chân. Tư thế này giúp bạn sẵn sàng bứt tốc về bất kỳ hướng nào một cách nhanh nhất.</p>
          <h2>2. Bước chéo chân (Chassé Step)</h2>
          <p>Đây là kỹ thuật di chuyển phổ biến nhất. Khi di chuyển ngang hoặc chéo, chân sau sẽ bước chéo theo sát chân trước, tạo lực đẩy cơ thể trượt đi trên mặt sân. Kỹ thuật này giúp bạn vừa di chuyển nhanh vừa giữ được sự thăng bằng để sẵn sàng tung cú đánh.</p>
          <h2>3. Kỹ thuật lùi bắt chéo chân</h2>
          <p>Khi cần lùi sâu về góc sân cuối, việc lùi thẳng sẽ rất chậm và dễ vấp. Bạn cần xoay hông, lùi bắt chéo chân ra phía sau để tối ưu hóa tốc độ. Sau khi thực hiện cú đánh, hãy dùng lực bật của chân để nhanh chóng lao về vị trí trung tâm sân.</p>
          <h2>4. Bài tập cải thiện Footwork</h2>
          <p>Hãy tập di chuyển 6 góc sân không có cầu mỗi ngày trong 15 phút. Khi bước chân của bạn trở thành phản xạ tự nhiên, bạn sẽ thấy việc đón những quả cầu khó trở nên dễ dàng đến kinh ngạc.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "So sánh toàn diện: Cước cầu lông BG65, BG65Ti, BG66 Ultimax và Exbolt",
        slug: "so-sanh-cuoc-cau-long-yonex",
        content: `
          <p>Dây cước là linh hồn của cây vợt. Một cây vợt đắt tiền đan sai loại cước cũng sẽ mất đi phần lớn giá trị. Bài viết này sẽ phân tích chi tiết các loại cước quốc dân từ Yonex để bạn có lựa chọn tốt nhất.</p>
          <h2>1. Yonex BG65 - Huyền thoại độ bền</h2>
          <p>Với đường kính 0.70mm, BG65 nổi tiếng với độ bền vô địch. Bạn có thể đánh hàng tháng trời mà không lo đứt. Tuy nhiên, nhược điểm của nó là lực nảy (repulsion) khá lì và âm thanh không được đã tai. Phù hợp cho học sinh, sinh viên và người chơi chú trọng tính kinh tế.</p>
          <h2>2. Yonex BG65 Titanium - Bản nâng cấp hoàn hảo</h2>
          <p>Vẫn giữ đường kính 0.70mm nhưng được phủ thêm lớp Titanium, loại cước này mang lại tiếng nổ to hơn và lực nảy tốt hơn một chút so với BG65 thường, trong khi độ bền vẫn cực kỳ ấn tượng.</p>
          <h2>3. Yonex BG66 Ultimax - Sức mạnh và âm thanh tuyệt đỉnh</h2>
          <p>Đường kính chỉ 0.65mm, BG66U mang lại lực nảy cực mạnh, cảm giác cầu tuyệt vời và tiếng nổ đanh chói tai. Đây là loại cước được giới phong trào yêu thích nhất. Đổi lại, độ bền của nó rất thấp, dễ đứt nếu bạn đánh sai điểm ngọt hoặc đập cầu với lực lớn.</p>
          <h2>4. Yonex Exbolt 63 & 65 - Công nghệ tương lai</h2>
          <p>Dòng Exbolt sử dụng vật liệu rèn mới giúp tăng cường độ bền dù đường kính dây siêu mỏng (0.63mm và 0.65mm). Nó khắc phục được điểm yếu mau đứt của BG66 Ultimax mà vẫn giữ được tiếng nổ lớn và lực nảy đáng sợ. Nếu ngân sách cho phép, đây là dòng cước đáng thử nhất hiện nay.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Chiến thuật đánh đôi nam: Làm sao để phối hợp ăn ý với đồng đội?",
        slug: "chien-thuat-danh-doi-nam",
        content: `
          <p>Đánh đôi trong cầu lông không chỉ là kỹ năng cá nhân mà còn là bài toán về chiến thuật và sự thấu hiểu đồng đội. Việc đứng sai vị trí có thể tạo ra những khoảng trống chết người cho đối thủ khai thác.</p>
          <h2>1. Đội hình Tấn công (Trước - Sau)</h2>
          <p>Khi bạn hoặc đồng đội thực hiện một cú đập cầu (smash) hoặc chém cầu (drop shot), đội hình phải lập tức chuyển sang trạng thái tấn công: Một người đứng sát lưới để bắt bài những pha tạt cầu lỗi hoặc bỏ nhỏ của đối thủ, người còn lại lùi về nửa sau sân để liên tục duy trì áp lực bằng những cú đập bồi.</p>
          <h2>2. Đội hình Phòng thủ (Ngang - Ngang)</h2>
          <p>Ngược lại, khi bạn buộc phải hất cầu cao sâu về cuối sân đối phương, hãy lập tức tách ra hai bên (đội hình song song ngang). Mỗi người sẽ chịu trách nhiệm phòng thủ một nửa sân dọc. Hãy hạ thấp trọng tâm, đưa vợt ra phía trước để sẵn sàng đỡ những cú smash cháy máy từ đối thủ.</p>
          <h2>3. Giao tiếp là chìa khóa</h2>
          <p>Sự im lặng là kẻ thù của đánh đôi. Hãy liên tục giao tiếp với đồng đội bằng những khẩu lệnh ngắn gọn như "Để tôi!", "Của tôi!", "Lên lưới đi!". Việc này giúp tránh được những pha va chạm vợt đáng tiếc hoặc bỏ cầu vì tưởng người kia sẽ đánh.</p>
          <h2>4. Tuyệt đối không đứng ngoái nhìn đồng đội đánh</h2>
          <p>Nhiều người có thói quen ngoái đầu lại phía sau để xem đồng đội đánh gì. Đây là sai lầm chết người vì bạn sẽ mất thời gian quay lại và không kịp phản xạ nếu đối phương tạt cầu nhanh qua lưới. Hãy luôn hướng mắt về phía đối thủ, lắng nghe tiếng vợt của đồng đội để phán đoán đường cầu.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Hướng dẫn bảo quản vợt cầu lông đúng cách giúp tăng tuổi thọ",
        slug: "huong-dan-bao-quan-vot-cau-long",
        content: `
          <p>Một cây vợt tốt có giá trị không hề nhỏ. Tuy nhiên, nhiều người chơi lại chưa biết cách chăm sóc "vũ khí" của mình, dẫn đến việc vợt nhanh hỏng, sập khung hoặc đứt cước một cách lãng phí.</p>
          <h2>1. Tránh để vợt ở nơi có nhiệt độ quá cao</h2>
          <p>Khung vợt được làm từ carbon graphite. Khi tiếp xúc với nhiệt độ cao (như bỏ trong cốp xe máy, để ngoài trời nắng gắt), cấu trúc carbon có thể bị biến dạng, làm giảm độ bền của vợt và làm căng cước gây nứt khung. Hãy luôn để vợt trong bao và bảo quản ở nơi thoáng mát.</p>
          <h2>2. Cắt cước ngay khi bị đứt</h2>
          <p>Đây là quy tắc sống còn! Khi một sợi cước bị đứt, lực căng trên toàn bộ mặt vợt sẽ mất cân bằng nghiêm trọng. Lực kéo lệch này có thể làm méo hoặc sập khung vợt ngay lập tức. Hãy dùng kéo cắt đứt chữ thập (dấu X) ngay giữa mặt vợt ngay khi có một sợi cước bị đứt.</p>
          <h2>3. Thay quấn cán định kỳ</h2>
          <p>Quấn cán vợt sau nhiều buổi đánh sẽ thấm đẫm mồ hôi, sinh ra vi khuẩn và nấm mốc. Không chỉ gây mùi khó chịu, độ ẩm này nếu để lâu có thể thấm vào cốt gỗ bên trong làm mục cán vợt. Hãy thay quấn cán ít nhất 2 tuần một lần và phơi vợt ở nơi thoáng gió sau khi đánh xong.</p>
          <h2>4. Tránh các pha cạch cầu và va chạm vợt</h2>
          <p>Dù khung vợt có cứng đến đâu, những cú đánh trúng khung (cạch cầu) bằng lực mạnh đều có thể tạo ra những vết nứt ngầm. Hãy cố gắng tập trung bắt cầu bằng điểm ngọt (sweet spot). Trong đánh đôi, hãy giao tiếp tốt để tránh những cú "đấu kiếm" nảy lửa khiến cả hai cây vợt đều gãy.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Làm thế nào để tăng lực cổ tay cho những cú Smash sấm sét?",
        slug: "tang-luc-co-tay-dap-cau",
        content: `
          <p>Cú đập cầu (smash) uy lực là niềm khao khát của bất kỳ dân chơi cầu lông nào. Nhiều người lầm tưởng đập cầu mạnh là do sức mạnh của cánh tay, nhưng thực tế, sự bùng nổ nằm ở cổ tay và cẳng tay.</p>
          <h2>1. Cơ chế của lực cổ tay trong cầu lông</h2>
          <p>Lực đánh trong cầu lông không đến từ sự gồng cứng cơ bắp, mà đến từ tốc độ vung vợt và độ linh hoạt. Khi đập cầu, bạn cần giữ cơ tay thư giãn, và chỉ siết chặt tay nắm (grip) vào khoảnh khắc vợt chạm cầu, kết hợp với việc gập cổ tay thật nhanh về phía trước (snap wrist).</p>
          <h2>2. Tập luyện với tạ tay nhẹ hoặc chai nước</h2>
          <p>Bạn không cần tạ nặng. Hãy dùng tạ tay 1-2kg hoặc một chai nước. Gác cẳng tay lên bàn, để bàn tay vươn ra ngoài mép bàn. Cầm tạ và thực hiện động tác gập/duỗi cổ tay lên xuống liên tục 30-40 lần mỗi hiệp. Điều này giúp tăng sức bền và sức mạnh cho gân cổ tay.</p>
          <h2>3. Sử dụng vợt tập lực (Training Racket) hoặc bọc vợt</h2>
          <p>Sử dụng những cây vợt nặng hơn bình thường (khoảng 120g - 150g) hoặc bọc bao vợt lại để tạo lực cản không khí. Tập vung vợt (swing) chay với thiết bị này 100 lần mỗi ngày. Sau khi tháo bao vợt ra, bạn sẽ cảm thấy tay mình vung nhanh như chớp lướt trong gió.</p>
          <h2>4. Bài tập bóp kìm hoặc bóp bóng cao su</h2>
          <p>Lực bóp của các ngón tay cũng quyết định độ chắc chắn khi bạn siết cán vợt lúc chạm cầu. Hãy mang theo một quả bóng cao su hoặc dụng cụ bóp kìm và tập bất cứ khi nào bạn rảnh rỗi (khi xem TV, ngồi xe bus). Lực siết càng tốt, cú đập càng có độ đầm và tiếng nổ lớn.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Đánh giá chi tiết mẫu giày cầu lông Lining Halberd Lite siêu nhẹ",
        slug: "danh-gia-giay-lining-halberd-lite",
        content: `
          <p>Giày cầu lông là món đồ bảo hộ quan trọng nhất. Một đôi giày tốt không chỉ giúp bạn di chuyển lanh lẹ mà còn bảo vệ khớp gối và mắt cá chân khỏi chấn thương. Hôm nay chúng ta sẽ đánh giá Lining Halberd Lite - một siêu phẩm tầm trung đang làm mưa làm gió.</p>
          <h2>1. Thiết kế và ngoại hình</h2>
          <p>Lining Halberd Lite sở hữu form dáng thon gọn, khí động học với những đường nét góc cạnh nam tính. Màu sắc chủ đạo là Trắng kết hợp những đường vân đỏ sắc lẹm, mang lại cảm giác cực kỳ thể thao và nổi bật trên sân. Chất liệu da PU kết hợp lưới thoáng khí ở mũi giày giúp hạn chế tình trạng bí bách chân.</p>
          <h2>2. Cảm giác mang và trọng lượng</h2>
          <p>Đúng như tên gọi "Lite", đôi giày cực kỳ nhẹ. Khi lên chân, bạn gần như không cảm thấy sức nặng, giúp những pha bứt tốc lên lưới lấy cầu trở nên thanh thoát hơn rất nhiều. Lớp đệm lót êm ái, ôm khít lòng bàn chân nhưng không gây tức mũi chân nhờ form giày được tối ưu cho người châu Á.</p>
          <h2>3. Công nghệ đế và độ bám sân</h2>
          <p>Đế giày sử dụng vật liệu cao su non đặc nguyên khối với hoa văn tổ ong Hexagrip đặc trưng của Lining. Độ bám trên mặt sân thảm cao su là tuyệt đối, những cú phanh gấp hay đổi hướng đột ngột đều được xử lý gọn gàng không trơn trượt. Lớp đệm BounSe+ ở gót giúp hấp thụ lực chấn động cực tốt khi bạn tiếp đất sau cú nhảy đập.</p>
          <h2>4. Kết luận</h2>
          <p>Với mức giá loanh quanh 1.5 triệu đồng, Lining Halberd Lite thực sự là một món hời. Giày vừa nhẹ, bám sân tốt, thiết kế đẹp, rất phù hợp cho những người có lối chơi đánh đơn linh hoạt hoặc đánh đôi ở vị trí bao lưới.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Lỗi giao cầu thường gặp trong đánh đôi và cách khắc phục",
        slug: "loi-giao-cau-danh-doi-nam",
        content: `
          <p>Giao cầu là cú đánh duy nhất trong cầu lông mà bạn hoàn toàn làm chủ tình huống không chịu sự tác động của đối thủ. Tuy nhiên, giao cầu hỏng hoặc giao cầu bổng sẽ khiến bạn lập tức rơi vào thế bị động phòng thủ.</p>
          <h2>1. Lỗi giao cầu quá cao (Bổng lưới)</h2>
          <p>Đây là lỗi kinh điển nhất. Khi cầu đi quá cao so với mép lưới, đối thủ sẽ dễ dàng lao lên vồ cầu hoặc đẩy cầu sát người khiến bạn không kịp trở tay. <br/><strong>Cách khắc phục:</strong> Hãy tập trung vào lực của ngón cái. Khi giao, mặt vợt phải hơi chúc xuống và đẩy cầu đi ngang sượt mép lưới. Điểm rơi cầu phải rơi vừa đủ qua vạch giao cầu ngắn.</p>
          <h2>2. Lỗi giao cầu sai luật (Cao tay)</h2>
          <p>Theo luật BWF mới, toàn bộ quả cầu khi tiếp xúc với mặt vợt phải nằm dưới thắt lưng (hoặc quy chuẩn dưới 1.15m). Nhiều người chơi phong trào hay có thói quen cầm cầu quá cao để dễ qua lưới, điều này nếu đi thi đấu sẽ bị trọng tài bắt lỗi ngay lập tức.</p>
          <h2>3. Nhịp giao cầu dễ đoán</h2>
          <p>Nếu bạn luôn giao cầu ngay lập tức khi vừa đưa tay lên, đối thủ sẽ bắt được nhịp và sẵn sàng bứt tốc. <br/><strong>Cách khắc phục:</strong> Hãy thay đổi nhịp điệu. Đôi khi giữ cầu lại 1-2 giây để phá vỡ sự tập trung của đối thủ, hoặc bất ngờ giao một quả cầu dài (flick serve) qua đầu đối thủ nếu họ đứng quá sát vạch.</p>
          <h2>4. Tư thế cầm cầu không ổn định</h2>
          <p>Bạn nên cầm vào phần lông vũ của quả cầu, để mũi đế cầu hướng thẳng vào mặt vợt. Khi giao, hãy thả tự do quả cầu và đánh chứ không nên tung cầu lên không trung, vì tung cầu lên sẽ khiến điểm tiếp xúc bị lệch.</p>
        `,
        thumbnail_url: ""
      },
      {
        author_id: authorId,
        title: "Chế độ dinh dưỡng hoàn hảo trước và sau khi thi đấu cầu lông",
        slug: "dinh-duong-cho-nguoi-choi-cau-long",
        content: `
          <p>Cầu lông là môn thể thao đốt cháy lượng calo khổng lồ với cường độ vận động ngắt quãng cao. Việc bổ sung dinh dưỡng đúng cách không chỉ giúp bạn duy trì thể lực sung mãn trong suốt 2 tiếng đánh cầu mà còn giúp cơ bắp phục hồi nhanh chóng.</p>
          <h2>1. Trước khi ra sân (Trước 1-2 tiếng)</h2>
          <p>Nguyên tắc vàng: Không để bụng đói móp, nhưng cũng không được ăn quá no. Bạn cần nạp carbohydrate phức tạp để cung cấp năng lượng bền bỉ. Một số gợi ý tuyệt vời: 1-2 quả chuối, một lát bánh mì đen với bơ đậu phộng, hoặc một củ khoai lang luộc. Hạn chế đồ ăn nhiều dầu mỡ vì nó mất nhiều thời gian tiêu hóa, gây nặng bụng và xóc hông khi chạy.</p>
          <h2>2. Trong khi thi đấu (Bổ sung nước và khoáng chất)</h2>
          <p>Mồ hôi tiết ra sẽ mang theo rất nhiều chất điện giải (Natri, Kali). Nếu chỉ uống nước lọc, bạn rất dễ bị chuột rút. Hãy chuẩn bị các loại nước bù điện giải (Revive, Pocari Sweat, hoặc nước dừa tươi thêm chút muối). Nhớ uống từng ngụm nhỏ vào các thời điểm nghỉ giải lao giữa hiệp, không nên tu ừng ực một chai lớn.</p>
          <h2>3. Sau khi kết thúc buổi đánh (Trong vòng 45 phút)</h2>
          <p>Đây là "Cửa sổ vàng" để cơ bắp phục hồi. Lúc này cơ bắp đang cạn kiệt glycogen và cần protein để tái tạo vi tổn thương. Hãy nạp ngay một bữa ăn giàu Protein và carb hấp thụ nhanh. Bạn có thể uống một ly Whey Protein, ăn 2 quả trứng luộc, ức gà, hoặc một hộp sữa chua Hy Lạp trộn ngũ cốc.</p>
          <h2>4. Tầm quan trọng của giấc ngủ</h2>
          <p>Dinh dưỡng chỉ chiếm 50%, 50% còn lại của sự phục hồi nằm ở giấc ngủ. Cơ bắp không phát triển trong lúc bạn đánh cầu, nó phát triển trong lúc bạn ngủ. Hãy đảm bảo ngủ đủ 7-8 tiếng vào đêm sau ngày đánh cầu cường độ cao để cơ thể tự dọn dẹp các gốc tự do và axit lactic gây mỏi cơ.</p>
        `,
        thumbnail_url: ""
      }
    ];

    for (const p of posts) {
      await pool.query(
        `INSERT INTO posts (author_id, title, slug, content, thumbnail_url) VALUES ($1, $2, $3, $4, $5)`,
        [p.author_id, p.title, p.slug, p.content, p.thumbnail_url]
      );
    }
    
    console.log("Xong! Đã thêm 9 bài viết.");
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    process.exit();
  }
}

seedNinePosts();
