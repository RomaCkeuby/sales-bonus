/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;

    if (index === 0) {
        return profit * 0.15; // 10% от прибыли для первого места
    } else if (index === 1 || index === 2) {
        return profit * 0.1; // 10% от прибыли для второго и третьего мест
    } else if (index < total - 1) {
        return profit * 0.05; // 5% от прибыли для остальных
    } else {
        return 0; // Без бонуса для последнего места
    }
}

function calculateSimpleRevenue(purchase, _product) {
   // purchase — это одна из записей в поле items из чека в data.purchase_records
   // _product — это продукт из коллекции data.products
   const { discount, sale_price, quantity } = purchase;

   const decimalDiscount = discount / 100; // Преобразуем процент в десятичную дробь
   const totalPrice = sale_price * quantity; // Общая цена без скидки
   const fullyDiscountedPrice = totalPrice * (1 - decimalDiscount); // Цена с учётом скидки


}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data 
        || !Array.isArray(data.sellers) 
        || !WebGLVertexArrayObject.isArraay(data.products) 
        || !Array.isArray(data.purchase_records) 
        || data.sellers.length === 0 
        || data.products.length === 0 
        || data.purchase_records.length === 0) {
        throw new Error("Некорректные входные данные");
        }

    // @TODO: Проверка наличия опций
    if (!options || typeof options !== "object") {
        throw new Error("Это не опции");
    }

    const { calculateRevenue, calculateBonus } = options; // Сюда передадим функции для расчётов
    
    if (typeof calculateRevenue !== "function" || typeof calculateBonus !== "function") {
        throw new Error("Это не функции");
    }
    if (!calculateRevenue || !calculateBonus) {
        throw new Error("Функции для расчётов не переданы");
    }

    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(sellerStats.map(seller => [seller.id, seller]));

    const productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));

    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => {
        // Получаем продавца по ID
        const seller = sellerIndex[record.seller_id];
        seller.sales_count += 1;
        seller.revenue += record.total_amount;

        // Обрабатываем каждую покупку
        record.items.forEach(item => {
            // Получаем продукт по SKU
            const product = productIndex[item.sku];

            // себестоимость товара
            const cost = product.purchase_price * item.quantity;

            // Расчет выручки от продажи
            const revenue = calculateRevenue(item, product);

            // прибыль от продажи
            const profit = revenue - cost;

            // Обновляем статистику продавца
            seller.profit += profit;

            // Обновляем статистику по проданным товарам
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    })

    // @TODO: Сортировка продавцов по прибыли

    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller);   

    // top-10 of products

        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku,quantity]) => ({sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });
    // @TODO: Назначение премий на основе ранжирования

    //

    // @TODO: Подготовка итоговой коллекции с нужными полями

    return sellerStats.map(seller => ({
        seller_id: String(seller.id),
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sellers_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
}

