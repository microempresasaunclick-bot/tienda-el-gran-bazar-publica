import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Store, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- CONEXIÓN DIRECTA Y LIMPIA ---
    useEffect(() => {
        const iniciarBazar = async () => {
            setLoading(true);
            
            // 1. URL FIJA (Para eliminar cualquier error de configuración)
            const url = "https://dcssdiohhbmbqwuzuhda.supabase.co";

            // 2. LLAVE (Lee desde Netlify)
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!key) {
                console.error("Falta la KEY en Netlify");
                setErrorMsg("Error técnico: Falta configuración de seguridad.");
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient(url, key);
                // Consulta simple a la tabla 'productos'
                const { data, error } = await supabase.from('productos').select('*');
                
                if (error) throw error;
                setProductos(data || []);
            } catch (err: any) {
                console.error("Error REAL de conexión:", err);
                setErrorMsg("No se pudo cargar el catálogo. Intenta recargar.");
            }
            setLoading(false);
        };

        iniciarBazar();
    }, []);

    // Filtros visuales
    const productosVisibles = productos.filter(p => {
        const coincideBusqueda = p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        let coincideBoton = true;
        if (filtroActivo === 'descuento') coincideBoton = p.descuento === true;
        if (filtroActivo === 'garage') coincideBoton = p.categoria === 'garage';
        return coincideBusqueda && coincideBoton;
    });

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col relative">
            {/* ESTILOS SIMPLES */}
            <style>{`
                .hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
                .antü-gold { background: #b19149; }
            `}</style>

            {/* HEADER */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setFiltroActivo('todos'); setSearchTerm('');}}>
                        <img src="/logo-bazar.png" alt="Logo" className="h-10 w-auto object-contain" 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=Logo'; }} />
                        <span className="hidden sm:inline text-lg font-bold text-gray-800 uppercase">El Gran Bazar</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow">
                {/* HERO SECTION */}
                <div className="hero-gradient text-center p-10 text-white rounded-3xl shadow-xl mb-12">
                    <h1 className="text-4xl font-black mb-4">Bienvenido a El Gran Bazar</h1>
                    <div className="max-w-xl mx-auto relative group mb-8">
                        <Search className="absolute left-4 top-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-lg focus:outline-none"
                        />
                    </div>
                </div>

                {/* AREA DE PRODUCTOS */}
                <div className="text-center mb-8">
                    {errorMsg && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 border border-red-300">
                            {errorMsg}
                        </div>
                    )}
                    <p className="text-gray-500">
                        {loading ? 'Cargando...' : `${productosVisibles.length} productos disponibles`}
                    </p>
                </div>

                {/* GRILLA */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productosVisibles.map((producto) => (
                            <div key={producto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                                <div className="h-64 bg-gray-200 relative">
                                    <img src={producto.imagen_url || "https://via.placeholder.com/400"} 
                                         alt={producto.nombre} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800">{producto.nombre}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{producto.descripcion}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black text-blue-600">${producto.precio?.toLocaleString('es-CL')}</span>
                                        <button className="p-2 bg-blue-50 text-blue-600 rounded-full"><ShoppingBag size={20}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* CHAT */}
            <button className="fixed bottom-6 right-6 antü-gold text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
                    onClick={() => alert('Hola soy Antü!')}>
                <MessageCircle /> <span>Chat</span>
            </button>
        </div>
    );
};

export default App;
