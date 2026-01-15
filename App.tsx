import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // ESTADOS PARA EL LOGIN/REGISTRO
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<any>(null);

    // Inicializar Supabase
    const url = "https://dcssdiohhbmbqwuzuhda.supabase.co";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key || '');

    useEffect(() => {
        const iniciarBazar = async () => {
            setLoading(true);
            if (!key) {
                setErrorMsg("Falta la llave de seguridad en Netlify.");
                setLoading(false);
                return;
            }

            try {
                // Cargar productos
                const { data, error } = await supabase.from('productos').select('*');
                if (error) throw error;
                setProductos(data || []);

                // Revisar si ya hay usuario conectado
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user || null);

            } catch (err: any) {
                console.error("Error:", err);
                setErrorMsg("Hubo un problema cargando los datos.");
            }
            setLoading(false);
        };

        iniciarBazar();

        // Escuchar cambios en la sesión (Login/Logout)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // FUNCIÓN PARA MANEJAR EL LOGIN / REGISTRO
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                setShowAuthModal(false); // Cerrar modal al entrar
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo para confirmar.');
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
        alert('Sesión cerrada correctamente');
    };

    // Lógica de Filtros
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
                .antü-gold { background: #b19149; }
                .antü-gold:hover { background: #967a3d; }
            `}</style>

            {/* HEADER */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => {setFiltroActivo('todos'); setSearchTerm('');}}>
                        <span className="text-xl md:text-2xl font-black text-blue-800 tracking-tight uppercase">
                            EL GRAN BAZAR
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            // SI EL USUARIO ESTÁ LOGUEADO
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-700 hidden md:block">Hola, {user.email?.split('@')[0]}</span>
                                <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:underline">
                                    Salir
                                </button>
                            </div>
                        ) : (
                            // SI NO ESTÁ LOGUEADO (BOTONES ACTIVADOS)
                            <>
                                <button 
                                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                                    className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-bold border border-blue-100"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Entrar</span>
                                </button>
                                <button 
                                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                                    className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg transition-all text-sm font-bold shadow-sm"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span className="hidden xs:inline">Registrarse</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
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
                            placeholder="¿Qué estás buscando hoy?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-lg"
                        />
                    </div>

                    {/* FILTROS */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => setFiltroActivo(filtroActivo === 'descuento' ? 'todos' : 'descuento')}
                            className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-lg transform hover:scale-105 ${
                                filtroActivo === 'descuento' ? 'bg-white text-green-600 ring-4 ring-green-400' : 'bg-green-500 text-white'
                            }`}
                        >
                            <Percent className="w-5 h-5" />
                            {filtroActivo === 'descuento' ? 'Viendo Ofertas' : 'Ofertas'}
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

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {filtroActivo === 'todos' ? 'Novedades' : `Sección: ${filtroActivo}`}
                    </h2>
                    {errorMsg && !showAuthModal && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mt-4 max-w-lg mx-auto border border-red-200">
                            ⚠️ {errorMsg}
                        </div>
                    )}
                </div>

                {/* GRILLA PRODUCTOS */}
                {loading && !showAuthModal ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 font-bold">Cargando catálogo...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productosVisibles.map((producto) => (
                            <div key={producto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                                <div className="h-64 bg-gray-200 relative overflow-hidden">
                                    <img 
                                        src={producto.imagen_url || "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&q=80"} 
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {producto.descuento && (
                                        <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">OFERTA</span>
                                    )}
                                    {producto.categoria === 'garage' && (
                                        <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">GARAGE</span>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{producto.nombre}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{producto.descripcion}</p>
                                    
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-2xl font-black text-blue-600">
                                            ${producto.precio?.toLocaleString('es-CL')}
                                        </span>
                                        <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                                            <ShoppingBag className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* CHAT FLOTANTE */}
            <button 
                className="fixed bottom-6 right-6 antü-gold text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-3 z-50"
                onClick={() => alert('¡Hola! Soy Antü, tu asistente virtual.')}
            >
                <MessageCircle className="w-6 h-6" />
                <span className="font-bold hidden md:inline">Chat con Antü</span>
            </button>

            {/* MODAL DE LOGIN / REGISTRO */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
                        <button 
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-blue-800 mb-2">
                                {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                            </h2>
                            <p className="text-gray-500">
                                {authMode === 'login' 
                                    ? 'Ingresa tus datos para continuar' 
                                    : 'Únete a El Gran Bazar gratis'}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                                <div className="relative">
                                    <LogIn className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="******"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : (authMode === 'login' ? 'Ingresar' : 'Registrarse')}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            {authMode === 'login' ? (
                                <p>¿No tienes cuenta? <button onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline">Regístrate aquí</button></p>
                            ) : (
                                <p>¿Ya tienes cuenta? <button onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline">Ingresa aquí</button></p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="bg-[#2D3748] text-gray-400 mt-12">
                <div className="container mx-auto py-8 px-4">
                    <div className="text-center text-sm border-b border-gray-700 pb-6">
                        <p>&copy; 2025 - El Gran Bazar. Todos los derechos reservados.</p>
                        <p className="mt-1 font-semibold text-blue-400">Pymes y Microempresas a un Click</p>
                    </div>
                    <div className="mt-6 flex justify-center items-center space-x-8 text-sm flex-wrap">
                        <a href="mailto:microempresasaunclick@gmail.com" className="flex items-center space-x-2 hover:text-white transition-colors my-2">
                            <Mail className="h-5 w-5 text-blue-400" />
                            <span>microempresasaunclick@gmail.com</span>
                        </a>
                        <a href="tel:+56931761901" className="flex items-center space-x-2 hover:text-white transition-colors my-2">
                            <Phone className="h-5 w-5 text-green-400" />
                            <span>+569-31761901</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
