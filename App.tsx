import React, { useState } from 'react';
import { Search, ShoppingBag, User, Store, Percent, Tag, Mail, Phone } from 'lucide-react';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
            <style>{`
                .hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
            `}</style>

            {/* HEADER CON LOGO PROFESIONAL */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Esta ruta busca el logo que acabas de subir a la carpeta public */}
                        <img src="/logo-bazar.png" alt="Logo El Gran Bazar" className="h-12 w-auto object-contain" />
                        <span className="text-xl font-bold text-gray-800 tracking-tight uppercase">El Gran Bazar</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <User className="text-gray-600 w-6 h-6 cursor-pointer hover:text-blue-600 transition-colors" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow">
                {/* HERO SECTION */}
                <div className="hero-gradient text-center p-8 md:p-16 text-white rounded-3xl shadow-2xl mb-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Bienvenido a <br/> El Gran Bazar
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
                        Conectando Pymes y Microempresas contigo, a un solo click.
                    </p>
                    
                    <div className="max-w-xl mx-auto relative group">
                        <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar productos en todo el bazar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-lg"
                        />
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 transform hover:scale-105">
                            <Percent className="w-5 h-5" />
                            Productos con Descuento
                        </button>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 transform hover:scale-105">
                            <Tag className="w-5 h-5" />
                            Venta de Garage
                        </button>
                    </div>
                </div>

                {/* VISTA PREVIA DE PRODUCTOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <Store className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Cargando Catálogo...</h3>
                            <p className="text-gray-500">Sincronizando productos de Pymes locales.</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* FOOTER RESCATADO DE VS CODE */}
            <footer className="bg-[#2D3748] text-gray-400 mt-12">
                <div className="container mx-auto py-8 px-4">
                    <div className="text-center text-sm border-b border-gray-700 pb-6">
                        <p>&copy; 2025 - {new Date().getFullYear()} El Gran Bazar. Todos los derechos reservados.</p>
                        <p className="mt-1 font-semibold text-blue-400">Pymes y Microempresas a un Click</p>
                    </div>
                    <div className="mt-6 flex justify-center items-center space-x-8 text-sm flex-wrap">
                        <a href="mailto:microempresasaunclick@gmail.com" className="flex items-center space-x-2 hover:text-white transition-colors my-2">
                            <Mail className="h-5 w-5 text-blue-400" />
                            <span>microempresasaunclick@gmail.com</span>
                        </a>
                        <a href="tel:+56931761901" className="flex items-center space-x-2 hover:text-white transition-colors my-2">
                            <Phone className="h-5 w-5 text-green-400" />
                            <span>+569-31761901 / +569-47436919</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
