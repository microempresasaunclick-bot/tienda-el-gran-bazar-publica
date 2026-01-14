import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Store, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle } from 'lucide-react';
// IMPORTANTE: Importamos la librería de Supabase directamente aquí
import { createClient } from '@supabase/supabase-js';

// --- CONEXIÓN DIRECTA (Para evitar errores de archivo no encontrado) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan las llaves, esto evitará que la app explote, pero avisará en la consola
const supabase = createClient(
  supabaseUrl || 'https://falta-url.supabase.co', 
  supabaseAnonKey || 'falta-key'
);
// -----------------------------------------------------------------------

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    
    // Estados para guardar los datos reales de Supabase
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ESTO CARGA LOS PRODUCTOS APENAS SE ABRE LA PÁGINA
    useEffect(() => {
        const fetchProductos = async () => {
            if (!supabaseUrl || !supabaseAnonKey) {
                console.error("FALTAN LAS LLAVES DE SUPABASE EN NETLIFY");
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('productos')
                .select('*');
            
            if (error) {
                console.log('Error cargando:', error);
            } else {
                setProductos(data || []);
            }
            
            setLoading(false);
        };

        fetchProductos();
    }, []);

    // Lógica para filtrar los productos reales
    const productosVisibles = productos.filter(p => {
        // 1. Filtro por buscador (texto)
        const coincideBusqueda = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Filtro por botones (Categoría/Descuento)
        let coincideBoton = true;
        if (filtroActivo === 'descuento') coincideBoton = p.descuento === true;
        if (filtroActivo === 'garage') coincideBoton = p.categoria === 'garage';

        return coincideBusqueda && coincideBoton;
    });

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col relative">
            <style>{`
                .hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
                .antü-gold { background: #b19149; }
                .antü-gold:hover { background: #967a3d; }
            `}</style>

            {/* HEADER */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => {setFiltroActivo('todos'); setSearchTerm('');}}>
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
                    
                    {/* BUSCADOR REAL */}
                    <div className="max-w-xl mx-auto relative group mb-10">
                        <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Ej: Zapatillas, Audífonos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-lg"
                        />
                    </div>

                    {/* BOTONES DE FILTRO */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => setFiltroActivo(filtroActivo === 'descuento' ? 'todos' : 'descuento')}
                            className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg transform hover:scale-105 ${
                                filtroActivo === 'descuento' ? 'bg-white text-green-600 ring-4 ring-green-400' : 'bg-green-500 text-white'
                            }`}
                        >
                            <Percent className="w-5 h-5" />
                            {filtroActivo === 'descuento' ? 'Viendo Descuentos' : 'Productos con Descuento'}
                        </button>

                        <button 
                            onClick={() => setFiltroActivo(filtroActivo === 'garage' ? 'todos' : 'garage')}
                            className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg transform hover:scale-105 ${
                                filtroActivo === 'garage' ? 'bg-white text-orange-600 ring-4 ring-orange-400' : 'bg-orange-500 text-white'
                            }`}
                        >
                            <Tag className="w-5 h-5" />
                            {filtroActivo === 'garage' ? 'Viendo Garage' : 'Venta de Garage'}
                        </button>
                    </div>
                </div>

                {/* TÍTULO DINÁMICO */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {filtroActivo === 'todos' ? 'Catálogo Completo' : `Mostrando: ${filtroActivo}`}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {loading ? 'Buscando productos...' : `${productosVisibles.length} productos encontrados`}
                    </p>
                </div>

                {/* GRILLA DE PRODUCTOS REALES */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando catálogo...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productosVisibles.map((producto) => (
                            <div key={producto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                {/* Imagen del Producto */}
                                <div className="h-64 bg-gray-200 relative overflow-hidden">
                                    <img 
                                        src={producto.imagen_url || "https://via.placeholder.com/400"} 
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {producto.descuento && (
                                        <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            OFERTA
                                        </span>
                                    )}
                                    {producto.categoria === 'garage' && (
                                        <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            GARAGE
                                        </span>
                                    )}
                                </div>
                                
                                {/* Info del Producto */}
                                <div className="p-6">
                                    <h3 className="
