import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Percent, Tag, Mail, Phone, LogIn, UserPlus, MessageCircle, X, Plus, Package, Settings, LogOut, Save, Image as ImageIcon, UploadCloud, FileText, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'descuento' | 'garage'>('todos');
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Auth & User
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [user, setUser] = useState<any>(null);
    
    // MEMORIA DE TIENDA (Persistencia)
    const [perfilTienda, setPerfilTienda] = useState<any>(() => {
        const guardado = localStorage.getItem('perfil_vendedor_local');
        return guardado ? JSON.parse(guardado) : null;
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Formulario Registro
    const [regNombre, setRegNombre] = useState('');
    const [regTelefono, setRegTelefono] = useState('');
    const [regEmpresa, setRegEmpresa] = useState('');
    const [regRut, setRegRut] = useState('');
    const [regDireccion, setRegDireccion] = useState('');
    const [regLogo, setRegLogo] = useState<File | null>(null);
    const [regLogoPreview, setRegLogoPreview] = useState('');

    // Vistas & Modales
    const [vistaActual, setVistaActual] = useState<'home' | 'panel'>('home');
    const [showPublicarModal, setShowPublicarModal] = useState(false);
    
    // Cotización
    const [productoACotizar, setProductoACotizar] = useState<any>(null);
    const [datosCotizacion, setDatosCotizacion] = useState({
        cantidad: 12, rutEmpresa: '', razonSocial: '', emailContacto: '', telefono: '', direccionCliente: ''
    });

    // Edición
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

    const actualizarPerfilTienda = (metadata: any) => {
        if (metadata) {
            localStorage.setItem('perfil_vendedor_local', JSON.stringify(metadata));
            setPerfilTienda(metadata);
        }
    };

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
            if (session?.user) { 
                setUser(session.user);
                actualizarPerfilTienda(session.user.user_metadata);
            }
        });
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (session?.user) actualizarPerfilTienda(session.user.user_metadata);
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
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.user) actualizarPerfilTienda(data.user.user_metadata);
                limpiarFormularioRegistro(); 
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
                
                let publicUrl = '';
                if (regLogo && authData.user) {
                    const fileName = `logos/${authData.user.id}.jpg`;
                    await supabase.storage.from('imagenes').upload(fileName, regLogo);
                    const res = supabase.storage.from('imagenes').getPublicUrl(fileName);
                    publicUrl = res.data.publicUrl;
                    await supabase.auth.updateUser({ data: { empresa_logo_url: publicUrl } });
                }

                const newMeta = {
                    full_name: regNombre, phone: regTelefono, empresa_nombre: regEmpresa,
                    empresa_rut: regRut, empresa_direccion: regDireccion, empresa_logo_url: publicUrl
                };
                actualizarPerfilTienda(newMeta);

                alert('¡Registro exitoso! Ya puedes ingresar.');
                setAuthMode('login');
                limpiarFormularioRegistro(); 
            }
        } catch (error: any) { setErrorMsg(error.message); } 
        finally { setLoading(false); }
    };

    const generarPDF = () => {
        if (!productoACotizar) return;

        // Recuperar datos: 1. Usuario activo, 2. Memoria de tienda
        const m = user?.user_metadata || perfilTienda;

        if (!m) {
            alert("No se encontraron datos de vendedor. Por favor, inicia sesión una vez para configurar la tienda.");
            setShowAuthModal(true);
            return;
        }

        try {
            const doc = new jsPDF();
            
            let unitarioBruto = productoACotizar.precio;
            if (datosCotizacion.cantidad >= 72) unitarioBruto = Math.round(unitarioBruto * 0.85); 
            else if (datosCotizacion.cantidad >= 12) unitarioBruto = Math.round(unitarioBruto * 0.95); 

            const totalBruto = unitarioBruto * datosCotizacion.cantidad;
            const subtotalNeto = Math.round(totalBruto / 1.19);
            const iva = totalBruto - subtotalNeto;

            if (m.empresa_logo_url) {
                try { doc.addImage(m.empresa_logo_url, 'JPEG', 14, 10, 30, 30); } catch(e) {}
            }
            
            doc.setFontSize(14); doc.setTextColor(26, 35, 126);
            doc.text(m.empresa_nombre?.toUpperCase() || "VENDEDOR", 50, 15);
            doc.setFontSize(9); doc.setTextColor(80);
            doc.text(`RUT: ${m.empresa_rut || "S/R"}`, 50, 20);
            doc.text(m.empresa_direccion || "Dirección no registrada", 50, 25);
            doc.text(`Contacto: ${m.phone || ""}`, 50, 30);

            doc.setFontSize(24); doc.setTextColor(200);
            doc.text("COTIZACIÓN", 140, 20);
            doc.setFontSize(12); doc.setTextColor(26, 35, 126);
            doc.text("FOLIO-" + Math.floor(Math.random() * 10000), 165, 30);

            doc.setFillColor(245, 247, 251); doc.rect(14, 45, 90, 25, 'F');
            doc.rect(106, 45, 90, 25, 'F');
            doc.setFontSize(8); doc.setTextColor(150);
            doc.text("CLIENTE", 18, 52); doc.text("DETALLES", 110, 52);
            doc.setFontSize(10); doc.setTextColor(0);
            doc.text(datosCotizacion.razonSocial || "Cliente General", 18, 58);
            doc.text(datosCotizacion.rutEmpresa || "", 18, 63);
            doc.text(datosCotizacion.direccionCliente || "", 18, 68);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 110, 58);
            doc.text(`Válida por: 15 días`, 110, 63);

            autoTable(doc, {
                startY: 80,
                head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO UNIT.', 'TOTAL']],
                body: [[productoACotizar.nombre, datosCotizacion.cantidad, `$${unitarioBruto.toLocaleString('es-CL')}`, `$${totalBruto.toLocaleString('es-CL')}`]],
                theme: 'striped', headStyles: { fillColor: [26, 35, 126] }, styles: { fontSize: 9 }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.text(`Subtotal:`, 140, finalY); doc.text(`$${subtotalNeto.toLocaleString('es-CL')}`, 190, finalY, { align: 'right' });
            doc.text(`IVA (19%):`, 140, finalY + 6); doc.text(`$${iva.toLocaleString('es-CL')}`, 190, finalY + 6, { align: 'right' });
            doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 35, 126);
            doc.text(`Total:`, 140, finalY + 14); doc.text(`$${totalBruto.toLocaleString('es-CL')}`, 190, finalY + 14, { align: 'right' });

            doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
            doc.text(`Autorizado por: ${m.full_name || "Vendedor"}`, 190, 285, { align: 'right' });
            
            doc.save(`Cotizacion_${m.empresa_nombre}.pdf`);
            setProductoACotizar(null);
        } catch (err) { alert("Error al generar PDF"); }
    };

    const cerrarModalEdicion = () => {
        setShowPublicarModal(false); setModoEdicion(false); setIdProductoEditar(null);
        setNuevoProducto({ nombre: '', precio: '', descripcion: '', categoria: 'general', imagen_url: '' });
        setArchivoImagen(null); setPreviewUrl('');
    };

    const abrirModalEdicion = (prod: any) => {
        setModoEdicion(true); setIdProductoEditar(prod.id);
        setNuevoProducto({ nombre: prod.nombre, precio: prod.precio, descripcion: prod.descripcion, categoria: prod.categoria, imagen_url: prod.imagen_url });
        setPreviewUrl(prod.imagen_url); setShowPublicarModal(true);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProcesandoImagen(true);
            try {
                const compressed = await comprimirImagen(e.target.files[0]);
                setArchivoImagen(compressed);
                setPreviewUrl(URL.createObjectURL(compressed));
            } catch (error) { alert("Error imagen"); } 
            finally { setProcesandoImagen(false); }
        }
    };

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await comprimirImagen(e.target.files[0]);
                setRegLogo(compressed);
                setRegLogoPreview(URL.createObjectURL(compressed));
            } catch (error) { alert("Error logo"); }
        }
    };

    const handleGuardarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            let finalImageUrl = nuevoProducto.imagen_url || "https://via.placeholder.com/300?text=Sin+Foto";
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

    const productosVisibles = productos.filter(p => {
        const match = p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        if (filtroActivo === 'descuento') return match && p.descuento;
        if (filtroActivo === 'garage') return match && p.categoria === 'garage';
        return match;
    });

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col relative">
            <style>{`.hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }`}</style>

            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="cursor-pointer" onClick={() => setVistaActual('home')}>
                        <span className="text-xl md:text-2xl font-black text-blue-800 uppercase tracking-tight">EL GRAN BAZAR</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button onClick={() => setVistaActual(vistaActual === 'home' ? 'panel' : 'home')} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${vistaActual === 'panel' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-600 border-transparent hover:bg-gray-100'}`}>
                                    {vistaActual === 'home' ? 'Mi Panel' : 'Ver Tienda'}
                                </button>
                                <button onClick={async () => { await supabase.auth.signOut(); }} className="text-red-500 font-bold px-3 py-2 text-sm hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1">
                                    <LogOut className="w-4 h-4" /> Salir
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-blue-600 px-3 py-2 font-bold border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                                    <LogIn className="w-4 h-4" /> Entrar
                                </button>
                                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-3 py-2 font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center gap-1">
                                    <UserPlus className="w-4 h-4" /> Registrarse
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {vistaActual === 'panel' && user ? (
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800">Panel de Control</h1>
                                <p className="text-gray-500">
                                    Gestionando como: <span className="font-bold text-blue-600 uppercase">{user.user_metadata?.empresa_nombre || perfilTienda?.empresa_nombre}</span>
                                </p>
                            </div>
                            <button onClick={() => { cerrarModalEdicion(); setShowPublicarModal(true); }} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 flex items-center gap-2 transition-all active:scale-95"><Plus className="w-5 h-5" /> Nuevo Producto</button>
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
                        <div className="hero-gradient text-center p-8 md:p-16 text-white rounded-3xl shadow-2xl mb-12">
                            <h1 className="text-4xl md:text-6xl font-black mb-2 leading-tight tracking-tight">Bienvenido a <br/> El Gran Bazar</h1>
                            <p className="text-blue-100 text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto">Conectando Pymes y Microempresas contigo, a un solo click.</p>
                            <div className="max-w-xl mx-auto relative mb-10">
                                <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                                <input type="text" placeholder="¿Qué estás buscando hoy?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 text-lg"/>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button onClick={() => setFiltroActivo(filtroActivo === 'descuento' ? 'todos' : 'descuento')} className={`font-bold py-3 px-8 rounded-xl shadow-lg transition-all ${filtroActivo === 'descuento' ? 'bg-white text-green-600' : 'bg-green-500 text-white'}`}>Ofertas</button>
                                <button onClick={() => setFiltroActivo(filtroActivo === 'garage' ? 'todos' : 'garage')} className={`font-bold py-3 px-8 rounded-xl shadow-lg transition-all ${filtroActivo === 'garage' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'}`}>Venta de Garage</button>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-8 px-2 border-l-4 border-blue-600 ml-2">Novedades</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {productosVisibles.map((producto) => (
                                <div key={producto.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group">
                                    <div className="h-64 bg-gray-200 relative overflow-hidden"><img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>{producto.categoria === 'garage' && <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">GARAGE</span>}</div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{producto.nombre}</h3>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-2xl font-black text-blue-600">${producto.precio?.toLocaleString('es-CL')}</span>
                                            <button onClick={() => setProductoACotizar(producto)} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold text-sm shadow-md flex items-center gap-2 transition-all"><FileText className="w-4 h-4"/> Cotizar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {productoACotizar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-fade-in overflow-y-auto max-h-[90vh] relative">
                        <button onClick={() => setProductoACotizar(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Solicitud de Cotización</h2>
                        <p className="text-gray-500 mb-6 text-sm">Ingresa los datos para tu documento formal profesional.</p>
                        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 flex items-center gap-4">
                            <img src={productoACotizar.imagen_url} className="w-16 h-16 rounded-lg object-cover bg-white border" alt="" />
                            <div><p className="font-bold text-gray-800">{productoACotizar.nombre}</p><p className="text-blue-600 font-bold">${productoACotizar.precio.toLocaleString('es-CL')}</p></div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Cantidad</label><input type="number" min="1" value={datosCotizacion.cantidad} onChange={e => setDatosCotizacion({...datosCotizacion, cantidad: parseInt(e.target.value) || 0})} className="w-full p-3 border rounded-xl outline-none"/></div>
                                <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">RUT Empresa</label><input type="text" value={datosCotizacion.rutEmpresa} onChange={e => setDatosCotizacion({...datosCotizacion, rutEmpresa: e.target.value})} className="w-full p-3 border rounded-xl outline-none" placeholder="76.xxx.xxx-k"/></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Razón Social</label><input type="text" value={datosCotizacion.razonSocial} onChange={e => setDatosCotizacion({...datosCotizacion, razonSocial: e.target.value})} className="w-full p-3 border rounded-xl outline-none" placeholder="Nombre cliente"/></div>
                            <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Dirección</label><input type="text" value={datosCotizacion.direccionCliente} onChange={e => setDatosCotizacion({...datosCotizacion, direccionCliente: e.target.value})} className="w-full p-3 border rounded-xl outline-none" placeholder="Dirección cliente"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Email Contacto</label><input type="email" value={datosCotizacion.emailContacto} onChange={e => setDatosCotizacion({...datosCotizacion, emailContacto: e.target.value})} className="w-full p-3 border rounded-xl outline-none"/></div>
                                <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Teléfono</label><input type="tel" value={datosCotizacion.telefono} onChange={e => setDatosCotizacion({...datosCotizacion, telefono: e.target.value})} className="w-full p-3 border rounded-xl outline-none" placeholder="+569..."/></div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">💡 <b>Descuentos:</b> 5% desde 12 unidades, 15% desde 72 unidades.</div>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    generarPDF();
                                }} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg transition-all active:scale-95"
                            >
                                <FileText className="w-6 h-6"/> Generar Cotización Estructurada
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPublicarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in overflow-y-auto max-h-[90vh] relative">
                        <button onClick={cerrarModalEdicion} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-gray-800 mb-6">{modoEdicion ? 'Editar Producto' : 'Publicar Producto'}</h2>
                        <form onSubmit={handleGuardarProducto} className="space-y-4">
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label><input type="text" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Precio</label><input type="number" required value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label><select value={nuevoProducto.categoria} onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full p-3 border rounded-xl bg-white"><option value="general">Nuevo</option><option value="garage">Garage (Usado)</option></select></div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Foto</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 relative h-32 flex items-center justify-center cursor-pointer">
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                    {procesandoImagen ? <span className="animate-pulse text-blue-500 font-bold">Optimización...</span> : previewUrl ? <img src={previewUrl} className="h-full object-contain rounded-lg" alt=""/> : <div className="text-gray-400"><UploadCloud className="w-8 h-8 mx-auto mb-1"/><span className="text-sm">Subir Foto</span></div>}
                                </div>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label><textarea rows={3} value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <button type="submit" disabled={loading || procesandoImagen} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex justify-center items-center gap-2 transition-all shadow-md">{loading ? 'Procesando...' : (modoEdicion ? 'Actualizar Producto' : 'Publicar Ahora')}</button>
                        </form>
                    </div>
                </div>
            )}

            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in overflow-y-auto max-h-[90vh] relative">
                        <button onClick={() => { setShowAuthModal(false); limpiarFormularioRegistro(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-blue-800 mb-2 text-center tracking-tight">{authMode === 'login' ? 'Bienvenido' : 'Registro de Empresa'}</h2>
                        <p className="text-gray-500 text-center mb-6">{authMode === 'login' ? 'Ingresa a tu cuenta para gestionar productos' : 'Configura tu perfil comercial único'}</p>
                        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold text-center">{errorMsg}</div>}
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div><label className="text-sm font-bold text-gray-700 mb-1 block">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="vendedor@empresa.cl"/></div>
                            <div><label className="text-sm font-bold text-gray-700 mb-1 block">Contraseña</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="••••••••"/></div>
                            {authMode === 'register' && (
                                <div className="space-y-4 pt-2 border-t border-gray-100 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Representante</label><input type="text" required value={regNombre} onChange={(e) => setRegNombre(e.target.value)} className="w-full p-3 border rounded-xl outline-none"/></div>
                                        <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Teléfono</label><input type="tel" required value={regTelefono} onChange={(e) => setRegTelefono(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="+569..."/></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Razón Social</label><input type="text" required value={regEmpresa} onChange={(e) => setRegEmpresa(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="Nombre Legal Empresa"/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">RUT Empresa</label><input type="text" required value={regRut} onChange={(e) => setRegRut(e.target.value)} className="w-full p-3 border rounded-xl outline-none" placeholder="77.xxx.xxx-k"/></div>
                                        <div><label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Dirección Comercial</label><input type="text" required value={regDireccion} onChange={(e) => setRegDireccion(e.target.value)} className="w-full p-3 border rounded-xl outline-none"/></div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Logo Corporativo</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 relative flex items-center justify-center h-24 cursor-pointer transition-colors">
                                            <input type="file" accept="image/*" onChange={handleLogoSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                            {regLogoPreview ? <div className="flex items-center gap-4"><img src={regLogoPreview} className="h-16 w-16 object-contain border bg-white rounded-lg shadow-sm" alt=""/><span className="text-green-600 text-xs font-bold">Logo OK</span></div> : <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-6 h-6 mb-1"/><span className="text-xs">Subir Logo (JPG/PNG)</span></div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg mt-6 active:scale-95 transition-all">{loading ? 'Cargando...' : (authMode === 'login' ? 'Entrar Ahora' : 'Crear Perfil Empresa')}</button>
                        </form>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            {authMode === 'login' ? <p>¿No tienes cuenta? <button onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline transition-all">Regístrate como Empresa</button></p> : <p>¿Ya eres parte? <button onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline transition-all">Ingresa aquí</button></p>}
                        </div>
                    </div>
                </div>
            )}

            <footer className="bg-[#2D3748] text-gray-400 mt-12 pb-8 text-center text-sm border-t border-gray-700">
                <div className="container mx-auto py-8 px-4">
                    <p className="mb-2">&copy; 2025 - 2026 - El Gran Bazar. Pymes y Microempresas a un Click.</p>
                    <div className="flex justify-center items-center space-x-8 text-sm flex-wrap px-4">
                        <a href="mailto:microempresasaunclick@gmail.com" className="flex items-center space-x-2 my-2 hover:text-white transition-all"><Mail className="h-5 w-5 text-blue-400" /><span>microempresasaunclick@gmail.com</span></a>
                        <a href="tel:+56931761901" className="flex items-center space-x-2 my-2 hover:text-white transition-all"><Phone className="h-5 w-5 text-green-400" /><span>+569 3176 1901</span></a>
                        <a href="tel:+56947436919" className="flex items-center space-x-2 my-2 hover:text-white transition-all"><Phone className="h-5 w-5 text-green-400" /><span>+569 4743 6919</span></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
