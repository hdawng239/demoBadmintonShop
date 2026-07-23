const VariantRepository = require('../repositories/variantRepository');
const { formatVariantName, generateSKU } = require('../models/variantModel');
const AppError = require('../utils/AppError');

// Nhận string hoặc object, trả object
const parseAttrs = (attrs) => {
    if (!attrs) return null;
    return typeof attrs === 'string' ? JSON.parse(attrs) : attrs;
};

const isDefaultName = (name) => !name || name === 'Mặc định' || /^Phiên bản\s+\d+$/i.test(name);

const VariantService = {
    getVariantsByProduct: (productId) => VariantRepository.findByProductId(productId),

    createVariant: async (data) => {
        let { variant_name, product_id, attributes, sku } = data;
        const parsedAttrs = parseAttrs(attributes);
        const category_id = await VariantRepository.findProductCategoryId(product_id);

        // Tự đặt tên và sinh SKU nếu client không truyền
        if (isDefaultName(variant_name)) {
            variant_name = formatVariantName(category_id, parsedAttrs);
        }
        if (!sku) {
            const existingColors = await VariantRepository.findExistingColors(product_id);
            if (parsedAttrs) {
                const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
                if (c) existingColors.add(c);
            }
            sku = generateSKU(product_id, category_id, parsedAttrs, existingColors);
        }

        return VariantRepository.create({
            product_id,
            variant_name,
            stock_quantity: data.stock_quantity,
            price_modifier: data.price_modifier,
            attributes,
            sku,
        });
    },

    updateVariant: async (id, data) => {
        const current = await VariantRepository.findById(id);
        if (!current) throw new AppError(404, 'Không tìm thấy phân loại');

        let { variant_name, attributes, sku } = data;
        const product_id = current.product_id;
        const category_id = await VariantRepository.findProductCategoryId(product_id);

        const parsedCurrentAttrs = parseAttrs(current.attributes);
        const parsedAttrs = parseAttrs(attributes);

        // Attributes không đổi thì giữ nguyên tên và SKU cũ
        const currentKeys = parsedCurrentAttrs ? Object.keys(parsedCurrentAttrs).sort() : [];
        const newKeys = parsedAttrs ? Object.keys(parsedAttrs).sort() : [];
        const attrsChanged =
            currentKeys.length !== newKeys.length ||
            (parsedAttrs && currentKeys.some((k) => parsedCurrentAttrs[k] !== parsedAttrs[k]));

        if (!attrsChanged) {
            variant_name = current.variant_name;
            sku = current.sku;
        } else {
            if (attributes && isDefaultName(variant_name)) {
                variant_name = formatVariantName(category_id, parsedAttrs);
            }
            if (attributes && !sku) {
                const existingColors = await VariantRepository.findExistingColors(product_id, id);
                if (parsedAttrs) {
                    const c = parsedAttrs['Màu sắc'] || parsedAttrs['color'];
                    if (c) existingColors.add(c);
                }
                sku = generateSKU(product_id, category_id, parsedAttrs, existingColors);
            }
        }

        return VariantRepository.update(id, {
            variant_name,
            stock_quantity: data.stock_quantity,
            price_modifier: data.price_modifier,
            attributes,
            sku,
        });
    },

    deleteVariant: async (id) => {
        // Đã có người đặt mua thì không cho xóa
        const hasOrders = await VariantRepository.hasOrderItems(id);
        if (hasOrders) {
            throw new AppError(400, 'Không thể xóa phân loại này vì đã có người đặt mua.');
        }
        await VariantRepository.removeFromCart(id);
        const deleted = await VariantRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy phân loại');
        return deleted;
    },
};

module.exports = VariantService;
