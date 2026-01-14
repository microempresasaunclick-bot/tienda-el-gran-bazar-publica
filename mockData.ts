import type { Product, Category, User, Rating, PublicRequest, Order } from './types';

export const mockUsers: User[] = [
    {
        id: 'user-1-comprador',
        email: 'comprador@test.com',
        role: 'user',
        name: 'Ana la Compradora',
        accountType: 'natural',
    },
    {
        id: 'user-2-vendedor-natural',
        email: 'vendedor.natural@test.com',
        role: 'user',
        name: 'Carlos el Artesano',
        accountType: 'natural',
        rut: '15.123.456-7',
        address: 'Calle Falsa 123, Santiago',
        whatsapp: '+56987654321',
        bio: 'Apasionado por la artesanía en cuero. Todos mis productos son hechos a mano con amor y dedicación.',
        isVerified: false,
    },
    {
        id: 'user-3-vendedor-juridico',
        email: 'vendedor.juridico@test.com',
        role: 'user',
        name: 'Tienda "El Sabor de Casa"',
        accountType: 'juridica',
        legalName: 'Conservas y Delicias Ltda.',
        rut: '76.123.456-K',
        address: 'Avenida Siempre Viva 742, Valparaíso',
        whatsapp: '+56912345678',
        logoUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/logo-sabor-de-casa.png',
        bio: 'Somos una microempresa familiar dedicada a la elaboración de mermeladas y conservas gourmet. Usamos solo fruta de temporada de agricultores locales.',
        isVerified: true,
    },
    {
        id: 'user-4-admin',
        email: 'admin@elgranbazar.com',
        role: 'admin',
        name: 'Super Admin',
        accountType: 'juridica',
    }
];

export const mockCategories: Category[] = [
    {
        id: 'cat-1',
        name: 'Alimentos y Bebidas',
        subcategories: ['Conservas', 'Mermeladas', 'Chocolates', 'Cervezas Artesanales']
    },
    {
        id: 'cat-2',
        name: 'Artesanía',
        subcategories: ['Cuero', 'Madera', 'Cerámica', 'Textiles']
    },
    {
        id: 'cat-3',
        name: 'Ropa y Accesorios',
        subcategories: ['Poleras', 'Gorros', 'Joyas']
    },
    {
        id: 'cat-4',
        name: 'Hogar y Decoración',
        subcategories: ['Velas', 'Muebles Pequeños']
    }
];

export const mockProducts: Product[] = [
    {
        id: 'prod-1',
        sellerId: 'user-3-vendedor-juridico',
        name: 'Mermelada de Frutilla Premium',
        category: 'Alimentos y Bebidas',
        subcategory: 'Mermeladas',
        description: 'Deliciosa mermelada casera hecha con frutillas frescas de la Patagonia. Endulzada con jugo de manzana, sin azúcar añadida. Perfecta para tus desayunos.',
        variants: [
            {
                id: 'var-1-1',
                productId: 'prod-1',
                attributes: { "Tamaño": "250g" },
                price: 4500,
                stock: 15,
                imageUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/mermelada-frutilla.jpg',
                discount: 10
            },
            {
                id: 'var-1-2',
                productId: 'prod-1',
                attributes: { "Tamaño": "500g" },
                price: 8000,
                stock: 8,
                imageUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/mermelada-frutilla.jpg'
            }
        ]
    },
    {
        id: 'prod-2',
        sellerId: 'user-2-vendedor-natural',
        name: 'Billetera de Cuero Genuino',
        category: 'Artesanía',
        subcategory: 'Cuero',
        description: 'Billetera clásica para hombre, hecha a mano con cuero de curtido vegetal. Costuras reforzadas para máxima durabilidad. Un regalo que dura toda la vida.',
        variants: [
            {
                id: 'var-2-1',
                productId: 'prod-2',
                attributes: { "Color": "Café Moro" },
                price: 25000,
                stock: 5,
                imageUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/billetera-cuero.jpg'
            },
            {
                id: 'var-2-2',
                productId: 'prod-2',
                attributes: { "Color": "Negro" },
                price: 25000,
                stock: 3,
                imageUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/billetera-cuero-negra.jpg'
            }
        ]
    },
    {
        id: 'prod-3',
        sellerId: 'user-3-vendedor-juridico',
        name: 'Pack Cerveza Artesanal IPA',
        category: 'Alimentos y Bebidas',
        subcategory: 'Cervezas Artesanales',
        description: 'Pack de 4 cervezas IPA (Indian Pale Ale) de nuestra cervecería local. Notas cítricas y amargor equilibrado. Perfecta para los amantes del lúpulo.',
        isGarageSale: true,
        variants: [
            {
                id: 'var-3-1',
                productId: 'prod-3',
                attributes: {},
                price: 12000,
                stock: 20,
                imageUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/cerveza-ipa.jpg',
                discount: 15
            }
        ]
    },
    {
        id: 'prod-4',
        sellerId: 'user-2-vendedor-natural',
        name: 'Tabla de Cortar de Maderas Nativas',
        category: 'Hogar y Decoración',
        subcategory: 'Muebles Pequeños',
        description: 'Robusta tabla de cortar hecha con una mezcla de maderas nativas chilenas como raulí y lenga. Curada con aceite mineral y cera de abeja.',
        variants: [
            {
                id: 'var-4-1',
                productId: 'prod-4',
                attributes: { "Tamaño": "Mediano" },
                price: 18000,
                stock: 10,
                imageUrl: 'https://storage.googleapis.com/aai-web-samples/el-gran-bazar/tabla-madera.jpg'
            }
        ]
    }
];

export const mockRatings: Rating[] = [
    {
        id: 'rating-1',
        orderId: 'order-1',
        sellerId: 'user-3-vendedor-juridico',
        buyerId: 'user-1-comprador',
        buyerName: 'Ana la Compradora',
        value: 5,
        comment: '¡La mermelada es exquisita! Llegó muy rápido y bien embalada. Totalmente recomendado.',
        date: '2025-01-15'
    },
    {
        id: 'rating-2',
        orderId: 'order-2',
        sellerId: 'user-3-vendedor-juridico',
        buyerId: 'user-x-comprador',
        buyerName: 'Pedro P.',
        value: 4,
        comment: 'Buen producto, aunque la caja llegó un poco abollada.',
        date: '2025-01-18'
    }
];

export const mockPublicRequests: PublicRequest[] = [];
export const mockOrders: Order[] = [];
