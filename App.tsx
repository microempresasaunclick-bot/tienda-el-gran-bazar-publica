import React, { useState, useMemo, useEffect } from 'react';
import type { Product, OrderItem, Order, Category, User, PublicRequest, Rating, Variant, AnalyticsData, Message } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginPanel';
import RegisterModal from './components/RegisterModal';
import SellerProfileModal from './components/SellerProfileModal';
import CartModal from './components/CartModal';
import SellerSelectionModal from './components/SellerSelectionModal';
import OrderDetailModal from './components/OrderDetailModal';
import CustomerPanel from './components/customer/CustomerPanel';
import PublicRequestBoard from './components/PublicRequestBoard';
import PublicRequestModal from './components/PublicRequestModal';
import QuoteManagementModal from './components/admin/QuoteManagementModal';
import RatingModal from './components/RatingModal';
import ProductDetailModal from './components/ProductDetailModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import ChatModal from './components/ChatModal';
import PaymentStepModal from './components/PaymentStepModal';
import config from './config';
import { supabase } from './supabaseClient';
import { generateAntuResponse, ANTU_ASSISTANT_ID } from './lib/aiAssistant';
import { mockProducts, mockCategories, mockUsers, mockRatings, mockOrders, mockPublicRequests } from './mockData';

const USE_MOCK_DATA = false;

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [publicRequests, setPublicRequests] = useState<PublicRequest[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'customer' | 'admin' | 'user_panel' | 'public_requests'>('customer');
    const [filterDiscounted, setFilterDiscounted] = useState(false);
    const [filterGarageSale, setFilterGarageSale] = useState(false);
    const [configWarnings, setConfigWarnings] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [contactChatMessages, setContactChatMessages] = useState<Message[]>([]);
    const [credits, setCredits] = useState(10);
    const [initialAdminView, setInitialAdminView] = useState<'dashboard' | 'categories' | 'products' | 'analytics' | 'profile'>('dashboard');
    const [viewingSeller, setViewingSeller] = useState<User | null>(null);
    const [sellerSelectionOpen, setSellerSelectionOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [isPublicRequestModalOpen, setIsPublicRequestModalOpen] = useState(false);
    const [managingOrder, setManagingOrder] = useState<Order | null>(null);
    const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
    const [viewingProductDetail, setViewingProductDetail] = useState<Product | null>(null);
    const [orderForPayment, setOrderForPayment] = useState<Order | null>(null);

    useEffect(() => {
        if (USE_MOCK_DATA) {
            setProducts(mockProducts);
            setCategories(mockCategories);
            setUsers(mockUsers);
            setRatings(mockRatings);
            setOrders(mockOrders);
            setPublicRequests(mockPublicRequests);
            setAuthLoading(false);
            return;
        }

        const fetchAllData = async () => {
             const [
                { data: productsData },
                { data: categoriesData },
                { data: profilesData },
                { data: requestsData },
                { data: ratingsData },
            ] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('profiles').select('*'),
                supabase.from('public_requests').select('*'),
                supabase.from('ratings').select('*'),
            ]);

            if (productsData) {
                setProducts(productsData.map((p: any) => ({
                    ...p, sellerId: p.seller_id, isGarageSale: p.is_garage_sale
                })));
            }
            if (categoriesData) setCategories(categoriesData as Category[]);
            if (profilesData) setUsers(profilesData as User[]);
        };

        fetchAllData();
        setAuthLoading(false);
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesFilter = true;
            if (filterDiscounted) {
                matchesFilter = Array.isArray(product.variants) && product.variants.some(v => v.discount && v.discount > 0);
            } else if (filterGarageSale) {
                matchesFilter = product.isGarageSale === true;
            }
            return matchesSearch && matchesFilter;
        });
    }, [products, searchTerm, filterDiscounted, filterGarageSale]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('customer');
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header 
                orderItemCount={orderItems.length}
                onOrderClick={() => setIsOrderModalOpen(true)}
                currentUser={currentUser}
                onLoginClick={() => setIsLoginModalOpen(true)}
                onRegisterClick={() => setIsRegisterModalOpen(true)}
                onLogoutClick={handleLogout}
                onAdminClick={() => { setInitialAdminView('dashboard'); setView('admin'); }}
                onUserPanelClick={() => setView('user_panel')}
                onViewPublicRequestsClick={() => setView('public_requests')}
                onContactClick={() => setIsChatModalOpen(true)}
                onGoHome={() => setView('customer')}
            />
            <main className="container mx-auto px-4 py-8">
                <div className="text-center p-12 bg-blue-700 text-white rounded-lg shadow-lg">
                    <h1 className="text-4xl font-extrabold">Bienvenido a El Gran Bazar</h1>
                    <p className="mt-4 text-lg text-blue-200">Conectando microempresas contigo, a un solo click.</p>
                    <div className="mt-8 max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 rounded-lg text-gray-800"
                        />
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onContactSeller={() => {}}
                            onAddToOrder={() => {}}
                            ratings={ratings}
                            onViewOptions={setViewingProductDetail}
                        />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
