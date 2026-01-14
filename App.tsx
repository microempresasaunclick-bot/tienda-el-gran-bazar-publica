import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Store, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- CONEXIÓN HÍBRIDA (SEGURA Y EFECTIVA) ---
    useEffect(() => {
        const iniciarBazar = async () => {
            setLoading(true);
            
            // 1. URL PÚBLICA (Directa en el código para evitar errores de Netlify)
            // Esta dirección es pública, así que es seguro tenerla aquí.
            const url = "https://lsifmouszhweotcbljck.supabase.co";

            // 2. LLAVE PRIVADA (Oculta en Netlify)
            // Esta sigue protegida y NO se verá en GitHub.
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

            // Verificación de seguridad
            if (!key) {
                console.error("Error: Falta la VITE_SUPABASE_ANON_KEY en Netlify");
                setErrorMsg("Falta configurar la llave de seguridad del sistema.");
                setLoading(false);
                return;
            }

            try {
                // Intentamos conectar
                const supabase = createClient(url, key);
                const { data, error } = await supabase.from('productos').select('*');
                
                if (error) throw error;
                setProductos(data || []);
            } catch (err: any) {
                console.error("Error de conexión:", err);
                // Si falla, mostramos mensaje pero la app no se cae
                setErrorMsg("No se pudo conectar con el catálogo de productos.");
            }
            setLoading(false);
        };

        iniciarBazar();
    }, []);

    // Lógica de Filtros
    const productosVisibles = productos.filter(p => {
        const coincideBusqueda = p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false;
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
