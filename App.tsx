import React, { useState } from 'react';
import { Search, ShoppingBag, User, Store, Percent, Tag, Mail, Phone, LogIn, UserPlus } from 'lucide-react';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
            <style>{`
                .hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
            `}</style>

            {/* HEADER MEJORADO - PC Y MÓVIL */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                    {/* LOGO */}
                    <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setFiltroActivo('todos')}>
                        <img 
                            src="/logo-bazar.png" 
                            alt="Logo" 
                            className="h-8 md:h-12 w-auto object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('/public/')) target.src = '/logo-bazar.png';
                            }}
                        />
                        <span className="hidden sm:inline text-lg font-bold text-gray-800 tracking-tight uppercase">
                            El Gran Bazar
                        </span>
                    </div>

                    {/* BOTONES DE ACCESO (Visibles en todo tamaño) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-bold border border-blue-100">
                            <LogIn className="w-4 h-4" />
                            <span>Entrar</span>
                        </button>
                        <button className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg transition-all text-sm font-bold shadow-sm">
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden xs:inline">Registrarse</span>
                        </button>
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
                    
                    {/* BUSCADOR */}
                    <div className="max-w-xl mx-auto relative group mb-10">
                        <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-lg"
                        />
                    </div>

                    {/* BOTONES CON VIDA */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => setFiltroActivo(filtroActivo === 'descuento' ? 'todos' : 'descuento')}
                            className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg transform hover:scale-105 ${
                                filtroActivo === 'descuento' 
                                ? 'bg-white text-green-600 ring-4 ring-green-400' 
                                : 'bg-green-500 text-white'
                            }`}
                        >
                            <Percent className="w-5 h-5" />
                            {filtroActivo === 'descuento' ? 'Viendo Descuentos' : 'Productos con Descuento'}
                        </button>

                        <button 
                            onClick={() => setFiltroActivo(filtroActivo === 'garage' ? 'todos' : 'garage')}
                            className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg transform hover:scale-105 ${
                                filtroActivo === 'garage' 
                                ? 'bg-white text-orange-600 ring-4 ring-orange-400' 
                                : 'bg-orange-500 text-white'
                            }`}
                        >
                            <Tag className="w-5 h-5" />
                            {filtroActivo === 'garage' ? 'Viendo Garage' : 'Venta de Garage'}
                        </button>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {filtroActivo === 'todos' ? 'Catálogo de Pymes' : `Mostrando: ${filtroActivo}`}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <Store className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-gray-800">Pronto Productos Reales</h3>
                        </div>
                    ))}
                </div>
            </main>

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
