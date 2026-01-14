import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, User, Store, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* HEADER INTEGRADO */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-blue-600 w-8 h-8" />
                        <span className="text-xl font-bold text-gray-800">El Gran Bazar</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
                        <a href="#" className="hover:text-blue-600">Inicio</a>
                        <a href="#" className="hover:text-blue-600">Categorías</a>
                        <a href="#" className="hover:text-blue-600">Ofertas</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <User className="text-gray-600 w-6 h-6 cursor-pointer hover:text-blue-600" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* HERO SECTION AZUL (Tu diseño original) */}
                <div className="text-center p-12 bg-blue-600 text-white rounded-2xl shadow-xl mb-12">
                    <h1 className="text-5xl font-extrabold mb-4">Bienvenido a El Gran Bazar</h1>
                    <p className="text-xl text-blue-100 mb-8">Conectando microempresas contigo, a un solo click.</p>
                    
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar productos en todo el bazar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md">
                            % Productos con Descuento
                        </button>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md">
                            🏷️ Venta de Garage
                        </button>
                    </div>
                </div>

                {/* CONTENIDO TEMPORAL DE PRODUCTOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <Store className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold">Cargando Catálogo...</h3>
                        <p className="text-gray-500 text-sm">Estamos conectando con la base de datos.</p>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t mt-20 py-10">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© 2026 El Gran Bazar. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;
