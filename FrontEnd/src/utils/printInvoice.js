export const printInvoice = (order) => {
    // Generate HTML string for the invoice
    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>Hóa đơn #${order.id}</title>
        <style>
            @page { margin: 0; }
            body { 
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 40px; 
                line-height: 1.6; 
                color: #1f2937; 
                background: #fff;
                max-width: 800px;
                margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: 800; margin: 10px 0; text-transform: uppercase; color: #111827; }
            .shop-name { font-size: 24px; font-weight: 900; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; }
            .shop-info { font-size: 14px; color: #4b5563; margin-top: 5px; }
            .order-meta { font-size: 14px; color: #6b7280; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .info-box h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            .info-box p { margin: 5px 0; font-size: 14px; }
            .info-box b { color: #374151; display: inline-block; width: 100px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px 15px; text-align: left; font-size: 14px; }
            th { background-color: #f3f4f6; font-weight: 600; color: #374151; text-transform: uppercase; font-size: 12px; }
            td { color: #4b5563; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; color: #111827; }
            
            .summary { display: flex; justify-content: flex-end; }
            .summary-box { width: 300px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .summary-total { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: bold; color: #ea580c; }
            
            .status-banner { text-align: center; margin-top: 30px; font-weight: bold; font-size: 18px; padding: 15px; border-radius: 8px; border: 2px dashed; text-transform: uppercase; letter-spacing: 1px; }
            .status-banner.paid { color: #16a34a; border-color: #16a34a; background: #f0fdf4; }
            .status-banner.unpaid { color: #dc2626; border-color: #dc2626; background: #fef2f2; }
            
            .footer { text-align: center; margin-top: 50px; font-size: 13px; color: #6b7280; padding-top: 20px; border-top: 1px solid #f3f4f6; }
            
            @media print {
                @page { margin: 1cm; size: A4; }
                body { padding: 0; background: #fff; max-width: 100%; }
                .info-box, .summary-box { border: 1px solid #ddd; background: transparent !important; }
                th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .status-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="shop-name">NARO SHOP</div>
            <div class="shop-info">Hệ Thống Cửa Hàng Cầu Lông Số 1 Việt Nam</div>
            <div class="shop-info">Hotline: 0977 508 430 | Website: naroshop.com</div>
            <h1 class="title">HÓA ĐƠN BÁN HÀNG</h1>
            <div class="order-meta">
                Mã đơn: <b>#NARO-${order.id}</b> | Ngày in: ${new Date().toLocaleString('vi-VN')}
            </div>
        </div>
        
        <div class="info-grid">
            <div class="info-box">
                <h3>Thông Tin Giao Hàng</h3>
                <p><b>Người nhận:</b> ${order.shipping_name || ''}</p>
                <p><b>Điện thoại:</b> ${order.shipping_phone || ''}</p>
                <p><b>Địa chỉ:</b> ${order.shipping_address || ''}</p>
            </div>
            <div class="info-box">
                <h3>Thông Tin Đơn Hàng</h3>
                <p><b>Ngày đặt:</b> ${new Date(order.created_at).toLocaleString('vi-VN')}</p>
                <p><b>Phương thức:</b> ${order.payment_method?.toUpperCase() || 'COD'}</p>
                <p><b>Trạng thái TT:</b> ${order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="text-center" width="40">STT</th>
                    <th class="text-center" width="50">ẢNH</th>
                    <th>TÊN SẢN PHẨM</th>
                    <th>PHÂN LOẠI</th>
                    <th class="text-center" width="50">SL</th>
                    <th class="text-right" width="110">ĐƠN GIÁ</th>
                    <th class="text-right" width="110">THÀNH TIỀN</th>
                </tr>
            </thead>
            <tbody>
                ${order.items && order.items.length > 0 ? order.items.map((item, index) => `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">
                        ${item.image_url ? `<img src="${item.image_url}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb;" />` : ''}
                    </td>
                    <td class="font-bold">${item.product_name}</td>
                    <td>${item.variant_name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_time)}</td>
                    <td class="text-right font-bold">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_time * item.quantity)}</td>
                </tr>
                `).join('') : '<tr><td colspan="7" class="text-center">Không có chi tiết sản phẩm</td></tr>'}
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-box">
                <div class="summary-row">
                    <span>Tổng tiền hàng:</span>
                    <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</span>
                </div>
                <div class="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span>0 đ</span>
                </div>
                <div class="summary-total">
                    <span>TỔNG CỘNG:</span>
                    <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</span>
                </div>
            </div>
        </div>

        <div class="status-banner ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}">
            ${order.payment_status === 'paid' 
                ? 'ĐƠN HÀNG ĐÃ THANH TOÁN - KHÔNG THU TIỀN' 
                : `SỐ TIỀN CẦN THU (COD): ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}`
            }
        </div>

        <div class="footer">
            <strong>Cảm ơn quý khách đã mua sắm tại Naro Shop!</strong><br/>
            Vui lòng giữ lại hóa đơn để đối chiếu khi có nhu cầu đổi trả sản phẩm trong vòng 7 ngày.<br/>
            Mọi thắc mắc xin liên hệ Hotline: 0977 508 430
        </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for styles to apply before printing
        printWindow.setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    } else {
        alert("Vui lòng cho phép popup để mở cửa sổ in hóa đơn!");
    }
};
