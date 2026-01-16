import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle, X, Plus, Package, Settings, LogOut, Save, Image as ImageIcon, UploadCloud, FileText, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
    // --- ESTADOS GENERALES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // --- AUTH & USER ---
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [regNombre, setRegNombre] = useState('');
    const [regTelefono, setRegTelefono] = useState('');
    const [regEmpresa, setRegEmpresa] = useState('');
    const [regRut, setRegRut] = useState('');
    const [regDireccion, setRegDireccion] = useState('');
    const [regLogo, setRegLogo] = useState<File | null>(null);
    const [regLogoPreview, setRegLogoPreview] = useState('');

    // --- VISTAS ---
    const [vistaActual, setVistaActual] = useState<'home' | 'panel'>('home'); 
    const [showPublicarModal, setShowPublicarModal] = useState(false);
    const [productoACotizar, setProductoACotizar] = useState<any>(null);
    const [datosCotizacion, setDatosCotizacion] = useState({
        cantidad: 12, rutEmpresa: '', razonSocial: '', emailContacto: '', telefono: '', direccionCliente: ''
    });

    // --- EDICIÓN ---
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idProductoEditar, setIdProductoEditar] = useState<number | null>(null);
    const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [procesandoImagen, setProcesandoImagen] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '', precio: '', descripcion: '', categoria: 'general', imagen_url: '' 
    });

    const url = "https://dcssdiohhbmbqwuzuhda.supabase.co";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key || '');

    // --- FUNCIONES ---
    const limpiarFormularioRegistro = () => {
        setEmail(''); setPassword(''); setRegNombre(''); setRegTelefono('');
        setRegEmpresa(''); setRegRut(''); setRegDireccion('');
        setRegLogo(null); setRegLogoPreview(''); setErrorMsg('');
    };

    const comprimirImagen = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; 
                    const scaleSize = MAX_WIDTH / img.width;
                    const newWidth = (scaleSize < 1) ? MAX_WIDTH : img.width;
                    const newHeight = (scaleSize < 1) ? (img.height * scaleSize) : img.height;
                    canvas.width = newWidth; canvas.height = newHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                        canvas.toBlob((blob) => {
                            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                            else reject(new Error("Error al comprimir"));
                        }, 'image/jpeg', 0.7);
                    }
                };
            };
        });
    };

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProductos(data || []);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        cargarDatos();
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) setUser(session.user);
        });
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (event === 'SIGNED_OUT') setVistaActual('home');
        });
        return () => { authListener.subscription.unsubscribe(); };
    }, []);

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
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email, password,
                    options: {
                        data: {
                            full_name: regNombre, phone: regTelefono, empresa_nombre: regEmpresa,
                            empresa_rut: regRut, empresa_direccion: regDireccion
                        }
                    }
                });
                if (authError) throw authError;
                if (regLogo && authData.user) {
                    const fileName = `logos/${authData.user.id}.jpg`;
                    await supabase.storage.from('imagenes').upload(fileName, regLogo);
                    const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
                    await supabase.auth.updateUser({ data: { empresa_logo_url: publicUrl } });
                }
                alert('¡Registro exitoso! Ya puedes entrar.');
                setAuthMode('login');
                limpiarFormularioRegistro();
            }
        } catch (error: any) { setErrorMsg(error.message); } 
        finally { setLoading(false); }
    };

    const generarPDF = () => {
        if (!productoACotizar) return;
        if (!user) {
            alert("Para que tus datos salgan en el PDF, debes estar logueado.");
            setShowAuthModal(true);
            return;
        }

        try {
            const doc = new jsPDF();
            const m = user.user_metadata;
            let pUnit = productoACotizar.precio;
            if (datosCotizacion.cantidad >= 72) pUnit = Math.round(pUnit * 0.85); 
            else if (datosCotizacion.cantidad >= 12) pUnit = Math.round(pUnit * 0.95); 

            const total = pUnit * datosCotizacion.cantidad;
            const neto = Math.round(total / 1.19);
            const iva = total - neto;

            if (m.empresa_logo_url) {
                try { doc.addImage(m.empresa_logo_url, 'JPEG', 14, 10, 30, 30); } catch(e) {}
            }
            
            doc.setFontSize(14); doc.setTextColor(26, 35, 126);
            doc.text(m.empresa_nombre?.toUpperCase() || "VENDEDOR", 50, 15);
            doc.setFontSize(9); doc.setTextColor(80);
            doc.text(`RUT: ${m.empresa_rut || ""}`, 50, 20);
            doc.text(m.empresa_direccion || "", 50, 25);
            doc.text(`Contacto: ${m.phone || user.email}`, 50, 30);

            doc.setFontSize(24); doc.setTextColor(200);
            doc.text("COTIZACIÓN", 140, 20);

            doc.setFillColor(245, 247, 251); doc.rect(14, 45, 90, 25, 'F');
            doc.rect(106, 45, 90, 25, 'F');
            doc.setFontSize(8); doc.setTextColor(150);
            doc.text("CLIENTE", 18, 52); doc.text("DETALLES", 110, 52);
            doc.setFontSize(10); doc.setTextColor(0);
            doc.text(datosCotizacion.razonSocial || "Cliente", 18, 58);
            doc.text(`RUT: ${datosCotizacion.rutEmpresa}`, 18, 63);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 110, 58);
            doc.text(`Válido: 30 días`, 110, 63);

            autoTable(doc, {
                startY: 75,
                head: [['PRODUCTO', 'CANT.', 'UNITARIO', 'TOTAL']],
                body: [[productoACotizar.nombre, datosCotizacion.cantidad, `$${pUnit.toLocaleString('es-CL')}`, `$${total.toLocaleString('es-CL')}`]],
                theme: 'striped', headStyles: { fillColor: [26, 35, 126] }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.text(`Neto: $${neto.toLocaleString('es-CL')}`, 140, finalY);
            doc.text(`IVA: $${iva.toLocaleString('es-CL')}`, 140, finalY + 6);
            doc.setFont("helvetica", "bold");
            doc.text(`TOTAL: $${total.toLocaleString('es-CL')}`, 140, finalY + 14);

            doc.save(`Cotizacion_${m.empresa_nombre}.pdf`);
            setProductoACotizar(null);
        } catch (err) { alert("Error al generar PDF"); }
    };

    const handleGuardarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            let finalImageUrl = nuevoProducto.imagen_url || "https://via.placeholder.com/300";
            if (archivoImagen) {
                setSubiendoImagen(true);
                const fileName = `productos/${Date.now()}.jpg`;
                await supabase.storage.from('imagenes').upload(fileName, archivoImagen);
                const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
                setSubiendoImagen(false);
            }
            const precioInt = parseInt(nuevoProducto.precio.toString().replace(/\D/g, '')) || 0;
            const d = { nombre: nuevoProducto.nombre, descripcion: nuevoProducto.descripcion, precio: precioInt, imagen_url: finalImageUrl, categoria: nuevoProducto.categoria };
            if (modoEdicion && idProductoEditar) await supabase.from('productos').update(d).eq('id', idProductoEditar);
            else await supabase.from('productos').insert([d]);
            cerrarModalEdicion(); cargarDatos();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    const abrirModalEdicion = (prod: any) => {
        setModoEdicion(true); setIdProductoEditar(prod.id);
        setNuevoProducto({ nombre: prod.nombre, precio: prod.precio, descripcion: prod.descripcion, categoria: prod.categoria, imagen_url: prod.imagen_url });
        setPreviewUrl(prod.imagen_url); setShowPublicarModal(true);
    };

    const cerrarModalEdicion = () => {
        setShowPublicarModal(false); setModoEdicion(false); setIdProductoEditar(null);
        setNuevoProducto({ nombre: '', precio: '', descripcion: '', categoria: 'general', imagen_url: '' });
        setArchivoImagen(null); setPreviewUrl('');
    };

    const productosVisibles = productos.filter(p => {
        const match = p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        if (filtroActivo === 'descuento') return match && p.descuento;
        if (filtroActivo === 'garage') return match && p.categoria === 'garage';
        return match;
    });

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="cursor-pointer" onClick={() => setVistaActual('home')}>
                        <span className="text-xl md:text-2xl font-black text-blue-800">EL GRAN BAZAR</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button onClick={() => setVistaActual(vistaActual === 'home' ? 'panel' : 'home')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    {vistaActual === 'home' ? 'Mi Panel' : 'Ver Tienda'}
                                </button>
                                <button onClick={() => supabase.auth.signOut()} className="text-red-500 font-bold text-sm">Salir</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-blue-600 font-bold text-sm px-3 py-2 border border-blue-600 rounded-lg">Entrar</button>
                                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="bg-blue-600 text-white font-bold text-sm px-3 py-2 rounded-lg">Registrarse</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {vistaActual === 'panel' && user ? (
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-black">Panel de Control</h1>
                            <button onClick={() => { cerrarModalEdicion(); setShowPublicarModal(true); }} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus /> Nuevo</button>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase"><tr><th className="p-4">Producto</th><th className="p-4">Precio</th><th className="p-4 text-right">Acciones</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {productos.map((prod) => (
                                        <tr key={prod.id} className="hover:bg-gray-50">
                                            <td className="p-4 flex items-center gap-3"><img src={prod.imagen_url} className="w-10 h-10 rounded-lg object-cover bg-gray-200" /><span className="font-medium">{prod.nombre}</span></td>
                                            <td className="p-4 font-bold text-gray-600">${prod.precio?.toLocaleString('es-CL')}</td>
                                            <td className="p-4 text-right"><button onClick={() => abrirModalEdicion(prod)} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold border border-blue-200">Editar</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="container mx-auto px-4 py-8">
                        <div className="bg-blue-700 text-center p-16 text-white rounded-3xl shadow-2xl mb-12">
                            <h1 className="text-6xl font-black mb-4">Bienvenido a <br/> El Gran Bazar</h1>
                            <p className="text-blue-100 text-xl mb-8">Conectando Pymes y Microempresas contigo, a un solo click.</p>
                            <div className="max-w-xl mx-auto relative">
                                <Search className="absolute left-4 top-4 text-gray-400" />
                                <input type="text" placeholder="¿Qué buscas?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {productosVisibles.map((producto) => (
                                <div key={producto.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all p-4">
                                    <div className="h-64 bg-gray-200 rounded-xl overflow-hidden mb-4"><img src={producto.imagen_url} className="w-full h-full object-cover"/></div>
                                    <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black text-blue-600">${producto.precio?.toLocaleString('es-CL')}</span>
                                        <button onClick={() => setProductoACotizar(producto)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><FileText size={18}/> Cotizar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL COTIZACION */}
            {productoACotizar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-fade-in relative">
                        <button onClick={() => setProductoACotizar(null)} className="absolute top-4 right-4 text-gray-400"><X /></button>
                        <h2 className="text-2xl font-black mb-6">Solicitud de Cotización</h2>
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold uppercase block mb-1">Cantidad</label><input type="number" min="1" value={datosCotizacion.cantidad} onChange={e => setDatosCotizacion({...datosCotizacion, cantidad: parseInt(e.target.value) || 0})} className="w-full p-3 border rounded-xl"/></div>
                            <div><label className="text-xs font-bold uppercase block mb-1">Tu Razón Social</label><input type="text" value={datosCotizacion.razonSocial} onChange={e => setDatosCotizacion({...datosCotizacion, razonSocial: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <div><label className="text-xs font-bold uppercase block mb-1">Tu RUT</label><input type="text" value={datosCotizacion.rutEmpresa} onChange={e => setDatosCotizacion({...datosCotizacion, rutEmpresa: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="76.xxx.xxx-k"/></div>
                            <div><label className="text-xs font-bold uppercase block mb-1">Email</label><input type="email" value={datosCotizacion.emailContacto} onChange={e => setDatosCotizacion({...datosCotizacion, emailContacto: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <button onClick={generarPDF} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">Generar Cotización Formal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PUBLICAR */}
            {showPublicarModal && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
                        <button onClick={cerrarModalEdicion} className="absolute top-4 right-4"><X /></button>
                        <h2 className="text-2xl font-black mb-6">{modoEdicion ? 'Editar' : 'Publicar'}</h2>
                        <form onSubmit={handleGuardarProducto} className="space-y-4">
                            <input type="text" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Nombre del producto"/>
                            <input type="number" required value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Precio"/>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer relative h-24 flex items-center justify-center">
                                <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) { comprimirImagen(e.target.files[0]).then(f => { setArchivoImagen(f); setPreviewUrl(URL.createObjectURL(f)); }) } }} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                {previewUrl ? <img src={previewUrl} className="h-full object-contain"/> : "Toca para subir foto"}
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-md">{loading ? 'Procesando...' : 'Guardar Producto'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL AUTH */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => { setShowAuthModal(false); limpiarFormularioRegistro(); }} className="absolute top-4 right-4"><X /></button>
                        <h2 className="text-2xl font-black mb-6 text-center">{authMode === 'login' ? 'Bienvenido' : 'Registro Empresa'}</h2>
                        {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}
                        <form onSubmit={handleAuth} className="space-y-4">
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Email corporativo"/>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Contraseña"/>
                            {authMode === 'register' && (
                                <div className="space-y-4">
                                    <input type="text" required value={regNombre} onChange={e => setRegNombre(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Representante"/>
                                    <input type="tel" required value={regTelefono} onChange={e => setRegTelefono(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="+569..."/>
                                    <input type="text" required value={regEmpresa} onChange={e => setRegEmpresa(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Razón Social Empresa"/>
                                    <input type="text" required value={regRut} onChange={e => setRegRut(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="77.xxx.xxx-k"/>
                                    <input type="text" required value={regDireccion} onChange={e => setRegDireccion(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Dirección Comercial"/>
                                    <div className="border-2 border-dashed rounded-xl p-4 text-center relative h-20 flex items-center justify-center">
                                        <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) { comprimirImagen(e.target.files[0]).then(f => { setRegLogo(f); setRegLogoPreview(URL.createObjectURL(f)); }) } }} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                        {regLogoPreview ? <img src={regLogoPreview} className="h-full object-contain"/> : "Subir Logo Empresa"}
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-6">{loading ? 'Cargando...' : 'Confirmar'}</button>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            {authMode === 'login' ? <button onClick={() => setAuthMode('register')} className="text-blue-600 font-bold">Crear Perfil Empresa</button> : <button onClick={() => setAuthMode('login')} className="text-blue-600 font-bold">Ya tengo cuenta</button>}
                        </div>
                    </div>
                </div>
            )}

            <footer className="bg-[#2D3748] text-gray-400 mt-12 py-10">
                <div className="container mx-auto px-4 text-center">
                    <p className="mb-4">&copy; 2025 - 2026 - El Gran Bazar. Pymes y Microempresas a un Click.</p>
                    <div className="flex justify-center gap-8 text-sm flex-wrap">
                        <span className="flex items-center gap-2"><Mail size={16}/> microempresasaunclick@gmail.com</span>
                        <span className="flex items-center gap-2"><Phone size={16}/> +569 3176 1901</span>
                        <span className="flex items-center gap-2"><Phone size={16}/> +569 4743 6919</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
