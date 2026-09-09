const VariantRepository = require('../repositories/variantRepository');
const { formatVariantName, generateSKU } = require('../models/variantModel');
const AppError = require('../utils/AppError');

const parseAttrs = (attrs) => {
    if (!attrs) return null;
    let parsed;
    try {
        parsed = typeof attrs === 'string' ? JSON.parse(attrs) : attrs;
    } catch {
        throw new AppError(400, 'Thuộc tính phân loại phải là JSON hợp lệ.');
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new AppError(400, 'Thuộc tính phân loại phải là một object.');
    }
    const entries = Object.entries(parsed);
    if (entries.length > 20 || entries.some(([key, value]) => String(key).length > 100 || String(value).length > 200)) {
        throw new AppError(400, 'Thuộc tính phân loại vượt quá giới hạn cho phép.');
    }
    return parsed;
};

const isDefaultName = (name) => !name || name === 'Mặc định' || /^Phiên bản\s+\d+$/i.test(name);

const validateInventory = (data) => {
    if (data.stock_quantity !== undefined) {
        const stock = Number(data.stock_quantity);
        if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
            throw new AppError(400, 'Tồn kho phải là số nguyên không âm hợp lệ.');
        }
    }
    if (data.price_modifier !== undefined) {
        const modifier = Number(data.price_modifier);
        if (!Number.isFinite(modifier) || Math.abs(modifier) > 1_000_000_000) {
            throw new AppError(400, 'Phần điều chỉnh giá không hợp lệ.');
        }
    }
};

const VariantService = {
    getVariantsByProduct: (productId, includeInactive = false) => VariantRepository.findByProductId(productId, includeInactive),

    createVariant: async (data) => {
        validateInventory(data);
        let { variant_name, product_id, attributes, sku } = data;
        const parsedAttrs = parseAttrs(attributes);
        const category_id = await VariantRepository.findProductCategoryId(product_id);

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
        validateInventory(data);
        const current = await VariantRepository.findById(id);
        if (!current) throw new AppError(404, 'Không tìm thấy phân loại');

        let { variant_name, attributes, sku } = data;
        const product_id = current.product_id;
        const category_id = await VariantRepository.findProductCategoryId(product_id);

        const parsedCurrentAttrs = parseAttrs(current.attributes);
        const parsedAttrs = parseAttrs(attributes);

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
