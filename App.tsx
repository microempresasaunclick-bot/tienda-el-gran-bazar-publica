import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const iniciarBazar = async () => {
            setLoading(true);
            
            // ✅ CORREGIDO: Esta es tu dirección NUEVA (sacada de tu foto)
            const url = "https://dcssdiohhbmbqwuzuhda.supabase.co";

            // La llave la lee de Netlify (Asegúrate que pusiste la 'anon public')
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!key) {
                setErrorMsg("Error: Falta la clave en Netlify.");
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient(url, key);
                // Busca en la tabla 'productos'
                const { data, error } = await supabase.from('productos').select('*');
                
                if (error) throw error;
                setProductos(data || []);
            } catch (err: any) {
                console.error("Error:", err);
                setErrorMsg("Error de conexión. Verifica la llave en Netlify.");
            }
            setLoading(false);
        };

        iniciarBazar();
    }, []);

    const productosVisibles = productos.filter(p => 
        p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-8">
            <h1 className="text-4xl font-black text-center mb-8 text-blue-600">El Gran Bazar</h1>
            
            {/* Buscador */}
            <div className="max-w-md mx-auto mb-8 relative">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-3 rounded-lg shadow-md"
                />
            </div>

            {/* Mensajes */}
            {errorMsg && <div className="bg-red-100 text-red-700 p-4 rounded text-center mb-4">{errorMsg}</div>}
            {loading && <div className="text-center text-gray-500">Cargando productos...</div>}

            {/* Lista de Productos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productosVisibles.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                        <img src={p.imagen_url || "https://via.placeholder.com/150"} alt={p.nombre} className="w-full h-48 object-cover rounded mb-4"/>
                        <h3 className="font-bold text-lg">{p.nombre}</h3>
                        <p className="text-gray-500 text-sm">{p.descripcion}</p>
                        <p className="text-blue-600 font-bold mt-2 text-xl">${p.precio}</p>
                    </div>
                ))}
            </div>
            
            {/* Botón Chat */}
            <button onClick={() => alert("Hola!")} className="fixed bottom-5 right-5 bg-yellow-500 text-white p-4 rounded-full shadow-xl">
                <MessageCircle />
            </button>
        </div>
    );
};

export default App;
