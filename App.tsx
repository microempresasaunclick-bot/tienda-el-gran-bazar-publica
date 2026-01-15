import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle, X, Plus, Package, Settings, LogOut, Save, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
    // ESTADOS GENERALES
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // ESTADOS DE USUARIO
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<any>(null);

    // VISTAS
    const [vistaActual, setVistaActual] = useState<'home' | 'panel'>('home');
    const [showPublicarModal, setShowPublicarModal] = useState(false);

    // FORMULARIO NUEVO PRODUCTO
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        precio: '',
        descripcion: '',
        imagen_url: '',
        categoria: 'general', // general, garage, oferta
        descuento: false
    });

    // INICIALIZAR SUPABASE
    const url = "https://dcssdiohhbmbqwuzuhda.supabase.co";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key || '');

    // CARGAR DATOS
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProductos(data || []);
        } catch (err) {
            console.error("Error cargando productos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();

        // Revisar sesión
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                setVistaActual('panel');
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (event === 'SIGNED_IN') setVistaActual('panel');
            if (event === 'SIGNED_OUT') setVistaActual('home');
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // MANEJO DE LOGIN
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                setShowAuthModal(false);
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo.');
                setShowAuthModal(false);
            }
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setVistaActual('home');
    };

    // MANEJO DE PUBLICACIÓN DE PRODUCTO
    const handlePublicar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            // Limpiar el precio (quitar puntos y signos)
            const precioLimpio = parseInt(nuevoProducto.precio.replace(/\D/g, '')) || 0;

            const { error } = await supabase.from('productos').insert([
                {
                    nombre: nuevoProducto.nombre,
                    descripcion: nuevoProducto.descripcion,
                    precio: precioLimpio,
                    imagen_url: nuevoProducto.imagen_url || 'https://via.placeholder.com/300?text=Sin+Foto',
                    categoria: nuevoProducto.categoria,
                    descuento: nuevoProducto.descuento,
                    // user_id: user.id (Opcional: si tu tabla tiene columna user_id)
                }
            ]);

            if (error) throw error;

            alert('¡Producto publicado con éxito!');
            setShowPublicarModal(false);
            setNuevoProducto({ nombre: '', precio: '', descripcion: '', imagen_url: '', categoria: 'general', descuento: false });
            cargarDatos(); // Recargar la lista

        } catch (error: any) {
            alert('Error al publicar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // LÓGICA DE FILTROS (TIENDA)
    const productosVisibles = productos.filter(p => {
        const coincideBusqueda = p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        let coincideBoton = true;
        if (filtroActivo === 'descuento') coincideBoton = p.descuento === true;
        if (filtroActivo === 'garage') coincideBoton = p.categoria === 'garage';
        return coincideBusqueda && coincideBoton;
    });

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col relative">
            <style>{`
                .hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
                .panel-gradient { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
            `}</style>

            {/* HEADER */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setVistaActual('home')}>
                        <span className="text-xl md:text-2xl font-black text-blue-800 tracking-tight uppercase">
                            EL GRAN BAZAR
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setVistaActual(vistaActual === 'home' ? 'panel' : 'home')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${vistaActual === 'panel' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {vistaActual === 'home' ? 'Ir a mi Panel' : 'Ver Tienda'}
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg">
                                    <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Salir</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg font-bold border border-blue-100">
                                    <LogIn className="w-4 h-4" /> <span>Entrar</span>
                                </button>
                                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg font-bold shadow-sm">
                                    <UserPlus className="w-4 h-4" /> <span className="hidden xs:inline">Registrarse</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow">
                {vistaActual === 'panel' && user ? (
                    // VISTA PANEL
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800">Panel de Control</h1>
                                <p className="text-gray-500">Gestiona tus productos y ventas</p>
                            </div>
                            <button 
                                onClick={() => setShowPublicarModal(true)}
                                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Publicar Nuevo Producto
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-500 text-white rounded-lg"><Package className="w-6 h-6"/></div>
                                <div><p className="text-sm text-blue-600 font-bold">Mis Productos</p><p className="text-2xl font-black text-gray-800">{productos.length}</p></div>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-center gap-4">
                                <div className="p-3 bg-purple-500 text-white rounded-lg"><ShoppingBag className="w-6 h-6"/></div>
                                <div><p className="text-sm text-purple-600 font-bold">Ventas</p><p className="text-2xl font-black text-gray-800">0</p></div>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800">Inventario</h2></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase">
                                        <tr><th className="p-4">Producto</th><th className="p-4">Precio</th><th className="p-4">Categoría</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productos.map((prod) => (
                                            <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={prod.imagen_url || "https://via.placeholder.com/50"} className="w-10 h-10 rounded-lg object-cover bg-gray-200"/>
                                                    <span className="font-medium text-gray-800">{prod.nombre}</span>
                                                </td>
                                                <td className="p-4 text-gray-600 font-bold">${prod.precio?.toLocaleString('es-CL')}</td>
                                                <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">{prod.categoria}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    // VISTA TIENDA (HOME)
                    <div className="container mx-auto px-4 py-8">
                        <div className="hero-gradient text-center p-8 md:p-16 text-white rounded-3xl shadow-2xl mb-12">
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Bienvenido a <br/> El Gran Bazar</h1>
                            <div className="max-w-xl mx-auto relative group mb-10 mt-8">
                                <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                                <input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-lg"/>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button onClick={() => setFiltroActivo(filtroActivo === 'descuento' ? 'todos' : 'descuento')} className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg ${filtroActivo === 'descuento' ? 'bg-white text-green-600' : 'bg-green-500 text-white'}`}><Percent className="w-5 h-5"/> Ofertas</button>
                                <button onClick={() => setFiltroActivo(filtroActivo === 'garage' ? 'todos' : 'garage')} className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg ${filtroActivo === 'garage' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'}`}><Tag className="w-5 h-5"/> Garage</button>
                            </div>
                        </div>
                        
                        {loading ? <div className="text-center py-20">Cargando...</div> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {productosVisibles.map((producto) => (
                                    <div key={producto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                                        <div className="h-64 bg-gray-200 relative overflow-hidden">
                                            <img src={producto.imagen_url || "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80"} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                            {producto.descuento && <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">OFERTA</span>}
                                            {producto.categoria === 'garage' && <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">GARAGE</span>}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{producto.nombre}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-2xl font-black text-blue-600">${producto.precio?.toLocaleString('es-CL')}</span>
                                                <button className="p-2 bg-blue-50 text-blue-600 rounded-full"><ShoppingBag className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL PUBLICAR PRODUCTO */}
            {showPublicarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setShowPublicarModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-gray-800 mb-6">Publicar Producto</h2>
                        
                        <form onSubmit={handlePublicar} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                                <input type="text" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Ej: Mesa de Centro"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio</label>
                                    <input type="number" required value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Ej: 50000"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                                    <select value={nuevoProducto.categoria} onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="general">Nuevo / General</option>
                                        <option value="garage">Garage (Usado)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Link de la Imagen (URL)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5"/>
                                    <input type="url" value={nuevoProducto.imagen_url} onChange={e => setNuevoProducto({...nuevoProducto, imagen_url: e.target.value})} className="w-full pl-10 pr-4 p-3 border rounded-xl" placeholder="https://..."/>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Copia y pega el link de la foto aquí.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea rows={3} value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Detalles del producto..."/>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="desc" checked={nuevoProducto.descuento} onChange={e => setNuevoProducto({...nuevoProducto, descuento: e.target.checked})} className="w-5 h-5 text-blue-600 rounded"/>
                                <label htmlFor="desc" className="text-gray-700 font-medium">¿Marcar como Oferta?</label>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg flex justify-center items-center gap-2">
                                <Save className="w-5 h-5"/> {loading ? 'Guardando...' : 'Publicar Ahora'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL LOGIN */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-blue-800 mb-6 text-center">{authMode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}</h2>
                        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{errorMsg}</div>}
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div><label className="text-sm font-bold text-gray-700">Correo</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="tu@correo.com"/></div>
                            <div><label className="text-sm font-bold text-gray-700">Contraseña</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="******"/></div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">{loading ? '...' : (authMode === 'login' ? 'Ingresar' : 'Registrarse')}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
