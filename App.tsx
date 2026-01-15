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

    // Campos Login/Registro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // CAMPOS ADICIONALES REGISTRO EMPRESA
    const [regNombre, setRegNombre] = useState('');
    const [regTelefono, setRegTelefono] = useState('');
    const [regEmpresa, setRegEmpresa] = useState('');
    const [regRut, setRegRut] = useState('');
    const [regDireccion, setRegDireccion] = useState('');
    const [regLogo, setRegLogo] = useState<File | null>(null);
    const [regLogoPreview, setRegLogoPreview] = useState('');

    // --- VISTAS & MODALES ---
    const [vistaActual, setVistaActual] = useState<'home' | 'panel'>('home');
    const [showPublicarModal, setShowPublicarModal] = useState(false);
    
    // --- COTIZACIÓN (PDF) ---
    const [productoACotizar, setProductoACotizar] = useState<any>(null);
    const [datosCotizacion, setDatosCotizacion] = useState({
        cantidad: 12,
        rutEmpresa: '',
        razonSocial: '',
        emailContacto: '',
        telefono: ''
    });

    // --- EDICIÓN PRODUCTO ---
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idProductoEditar, setIdProductoEditar] = useState<number | null>(null);

    // --- IMÁGENES (PRODUCTOS) ---
    const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [procesandoImagen, setProcesandoImagen] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    // Formulario Nuevo/Editar Producto
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        precio: '',
        descripcion: '',
        categoria: 'general',
        imagen_url: '' 
    });

    // --- SUPABASE CONFIG ---
    const url = "https://dcssdiohhbmbqwuzuhda.supabase.co";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key || '');

    // --- FUNCIONES AUXILIARES ---

    const limpiarFormularioRegistro = () => {
        setEmail('');
        setPassword('');
        setRegNombre('');
        setRegTelefono('');
        setRegEmpresa('');
        setRegRut('');
        setRegDireccion('');
        setRegLogo(null);
        setRegLogoPreview('');
        setErrorMsg('');
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
                    canvas.width = newWidth;
                    canvas.height = newHeight;
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
            if (session?.user) { setUser(session.user); setVistaActual('panel'); }
        });
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (event === 'SIGNED_IN') setVistaActual('panel');
            if (event === 'SIGNED_OUT') setVistaActual('home');
        });
        return () => { authListener.subscription.unsubscribe(); };
    }, []);

    // Manejo de imagen de producto
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProcesandoImagen(true);
            try {
                const compressed = await comprimirImagen(e.target.files[0]);
                setArchivoImagen(compressed);
                setPreviewUrl(URL.createObjectURL(compressed));
            } catch (error) { alert("Error en imagen"); } 
            finally { setProcesandoImagen(false); }
        }
    };

    // Manejo de Logo de Empresa (Registro)
    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await comprimirImagen(e.target.files[0]);
                setRegLogo(compressed);
                setRegLogoPreview(URL.createObjectURL(compressed));
            } catch (error) { alert("Error al procesar logo"); }
        }
    };

    // --- AUTH (LOGIN / REGISTRO COMPLETO) ---
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                limpiarFormularioRegistro(); 
                setShowAuthModal(false);
            } else {
                // REGISTRO CON DATOS EMPRESARIALES
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: regNombre,
                            phone: regTelefono,
                            empresa_nombre: regEmpresa,
                            empresa_rut: regRut,
                            empresa_direccion: regDireccion
                        }
                    }
                });

                if (authError) throw authError;

                if (regLogo && authData.user) {
                    const fileName = `logos/${authData.user.id}_${Date.now()}.jpg`;
                    const { error: upErr } = await supabase.storage.from('imagenes').upload(fileName, regLogo);
                    
                    if (!upErr) {
                        const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
                        await supabase.auth.updateUser({
                            data: { empresa_logo_url: publicUrl }
                        });
                    }
                }

                alert('¡Registro exitoso! Bienvenido a El Gran Bazar.');
                limpiarFormularioRegistro(); 
                setShowAuthModal(false);
            }
        } catch (error: any) { 
            setErrorMsg(error.message); 
        } finally { 
            setLoading(false); 
        }
    };

    // --- CRUD PRODUCTOS ---
    const handleGuardarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            let finalImageUrl = nuevoProducto.imagen_url || "https://via.placeholder.com/300?text=Sin+Foto";
            
            if (archivoImagen) {
                setSubiendoImagen(true);
                const fileName = `${Date.now()}.jpg`;
                const { error: upErr } = await supabase.storage.from('imagenes').upload(fileName, archivoImagen);
                if (upErr) throw upErr;
                const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
                setSubiendoImagen(false);
            }
            
            const precioInt = parseInt(nuevoProducto.precio.toString().replace(/\D/g, '')) || 0;
            const datosAEnviar = {
                nombre: nuevoProducto.nombre,
                descripcion: nuevoProducto.descripcion,
                precio: precioInt,
                imagen_url: finalImageUrl,
                categoria: nuevoProducto.categoria,
            };

            if (modoEdicion && idProductoEditar) {
                const { error } = await supabase.from('productos').update(datosAEnviar).eq('id', idProductoEditar);
                if (error) throw error;
                alert('¡Producto actualizado!');
            } else {
                const { error } = await supabase.from('productos').insert([datosAEnviar]);
                if (error) throw error;
                alert('¡Producto publicado!');
            }
            cerrarModalEdicion();
            cargarDatos();
        } catch (error: any) { alert('Error: ' + error.message); } 
        finally { setLoading(false); }
    };

    const abrirModalEdicion = (prod: any) => {
        setModoEdicion(true);
        setIdProductoEditar(prod.id);
        setNuevoProducto({
            nombre: prod.nombre,
            precio: prod.precio,
            descripcion: prod.descripcion,
            categoria: prod.categoria,
            imagen_url: prod.imagen_url
        });
        setPreviewUrl(prod.imagen_url);
        setShowPublicarModal(true);
    };

    const cerrarModalEdicion = () => {
        setShowPublicarModal(false);
        setModoEdicion(false);
        setIdProductoEditar(null);
        setNuevoProducto({ nombre: '', precio: '', descripcion: '', categoria: 'general', imagen_url: '' });
        setArchivoImagen(null);
        setPreviewUrl('');
    };

    // --- PDF GENERATOR (B2B) ---
    const generarPDF = () => {
        if (!productoACotizar) return;
        const doc = new jsPDF();
        
        let precioUnitarioFinal = productoACotizar.precio;
        if (datosCotizacion.cantidad >= 72) precioUnitarioFinal = Math.round(precioUnitarioFinal * 0.85); 
        else if (datosCotizacion.cantidad >= 12) precioUnitarioFinal = Math.round(precioUnitarioFinal * 0.95); 

        const totalFinalBruto = precioUnitarioFinal * datosCotizacion.cantidad;
        const totalNeto = Math.round(totalFinalBruto / 1.19);
        const totalIVA = totalFinalBruto - totalNeto;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text("COTIZACIÓN FORMAL", 105, 20, { align: "center" });
        
        // Datos Vendedor
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("DATOS DEL VENDEDOR / PLATAFORMA:", 14, 45);
        doc.setTextColor(0);
        doc.text("El Gran Bazar - Plataforma B2B", 14, 50);
        doc.text("Email: contacto@elgranbazar.cl", 14, 55);

        doc.setDrawColor(200);
        doc.line(14, 65, 196, 65);
        
        // Datos Comprador
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Datos del Cliente (Comprador)", 14, 75);
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 75);
        doc.text(`Razón Social: ${datosCotizacion.razonSocial}`, 14, 85);
        doc.text(`RUT: ${datosCotizacion.rutEmpresa}`, 14, 90);
        doc.text(`Email: ${datosCotizacion.emailContacto}`, 14, 95);
        doc.text(`Teléfono: ${datosCotizacion.telefono}`, 14, 100);

        // Tabla
        autoTable(doc, {
            startY: 110,
            head: [['Producto', 'Cant.', 'Precio Unit. (C/IVA)', 'Total (C/IVA)']],
            body: [[productoACotizar.nombre, datosCotizacion.cantidad, `$${precioUnitarioFinal.toLocaleString('es-CL')}`, `$${totalFinalBruto.toLocaleString('es-CL')}`]],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { halign: 'right' },
            columnStyles: { 0: { halign: 'left' } }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.text(`Total Neto:`, 140, finalY);
        doc.text(`$${totalNeto.toLocaleString('es-CL')}`, 190, finalY, { align: "right" });
        doc.text(`IVA (19%):`, 140, finalY + 7);
        doc.text(`$${totalIVA.toLocaleString('es-CL')}`, 190, finalY + 7, { align: "right" });
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text(`TOTAL FINAL:`, 140, finalY + 16);
        doc.text(`$${totalFinalBruto.toLocaleString('es-CL')}`, 190, finalY + 16, { align: "right" });

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);
        doc.text("Documento generado vía El Gran Bazar.", 105, 280, { align: "center" });
        
        doc.save(`Cotizacion_${datosCotizacion.rutEmpresa}.pdf`);
        alert("¡PDF Generado!");
        
        // Limpiar formulario de cotización también
        setDatosCotizacion({
            cantidad: 12,
            rutEmpresa: '',
            razonSocial: '',
            emailContacto: '',
            telefono: ''
        });
        setProductoACotizar(null);
    };

    const productosVisibles = productos.filter(p => {
        const coincideBusqueda = p.nombre ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        let coincideBoton = true;
        if (filtroActivo === 'descuento') coincideBoton = p.descuento === true;
        if (filtroActivo === 'garage') coincideBoton = p.categoria === 'garage';
        return coincideBusqueda && coincideBoton;
    });
    return (
        <div className="min-h-screen bg-white font-sans flex flex-col relative">
            <style>{`.hero-gradient { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }`}</style>

            {/* HEADER */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setVistaActual('home')}>
                        <span className="text-xl md:text-2xl font-black text-blue-800 tracking-tight uppercase">EL GRAN BAZAR</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button onClick={() => setVistaActual(vistaActual === 'home' ? 'panel' : 'home')} className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${vistaActual === 'panel' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-600 border-transparent'}`}>
                                    {vistaActual === 'home' ? 'Ir a mi Panel' : 'Ver Tienda'}
                                </button>
                                <button onClick={async () => { await supabase.auth.signOut(); setVistaActual('home'); }} className="flex items-center gap-1 text-red-500 text-sm font-bold px-3 py-2"><LogOut className="w-4 h-4" /> <span className="hidden md:inline">Salir</span></button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="flex items-center gap-1 text-blue-600 px-3 py-2 font-bold border border-blue-100 rounded-lg"><LogIn className="w-4 h-4" /> <span>Entrar</span></button>
                                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 font-bold rounded-lg"><UserPlus className="w-4 h-4" /> <span className="hidden xs:inline">Registrarse</span></button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-grow">
                {vistaActual === 'panel' && user ? (
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800">Panel de Control</h1>
                                <p className="text-gray-500">Bienvenido, {user.user_metadata?.full_name || user.email}</p>
                                {user.user_metadata?.empresa_logo_url && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={user.user_metadata.empresa_logo_url} className="w-12 h-12 object-contain border rounded bg-white" alt="Logo Empresa" />
                                        <span className="text-sm font-bold text-gray-600">{user.user_metadata.empresa_nombre}</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => { cerrarModalEdicion(); setShowPublicarModal(true); }} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Nuevo Producto
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase">
                                        <tr><th className="p-4">Producto</th><th className="p-4">Precio</th><th className="p-4 text-right">Acciones</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productos.map((prod) => (
                                            <tr key={prod.id} className="hover:bg-gray-50">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={prod.imagen_url} className="w-10 h-10 rounded-lg object-cover bg-gray-200"/>
                                                    <span className="font-medium text-gray-800">{prod.nombre}</span>
                                                </td>
                                                <td className="p-4 font-bold text-gray-600">${prod.precio?.toLocaleString('es-CL')}</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => abrirModalEdicion(prod)} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold border border-blue-200">Editar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
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
                                            <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                            {producto.descuento && <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">OFERTA</span>}
                                            {producto.categoria === 'garage' && <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">GARAGE</span>}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{producto.nombre}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-2xl font-black text-blue-600">${producto.precio?.toLocaleString('es-CL')}</span>
                                                <button onClick={() => setProductoACotizar(producto)} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold text-sm shadow-md transition-all flex items-center gap-2">
                                                    <FileText className="w-4 h-4"/> Cotizar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL COTIZACION */}
            {productoACotizar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setProductoACotizar(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Solicitud de Cotización</h2>
                        <p className="text-gray-500 mb-6 text-sm">Ingresa los datos de tu empresa para generar el PDF formal.</p>
                        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 flex items-center gap-4">
                            <img src={productoACotizar.imagen_url} className="w-16 h-16 rounded-lg object-cover bg-white"/>
                            <div><p className="font-bold text-gray-800">{productoACotizar.nombre}</p><p className="text-blue-600 font-bold">${productoACotizar.precio.toLocaleString('es-CL')}</p></div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-600">Cantidad</label><input type="number" min="1" value={datosCotizacion.cantidad} onChange={e => setDatosCotizacion({...datosCotizacion, cantidad: parseInt(e.target.value) || 0})} className="w-full p-3 border rounded-xl"/></div>
                                <div><label className="text-xs font-bold text-gray-600">RUT Empresa</label><input type="text" value={datosCotizacion.rutEmpresa} onChange={e => setDatosCotizacion({...datosCotizacion, rutEmpresa: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="76.xxx.xxx-k"/></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-600">Razón Social</label><input type="text" value={datosCotizacion.razonSocial} onChange={e => setDatosCotizacion({...datosCotizacion, razonSocial: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <div><label className="text-xs font-bold text-gray-600">Email Contacto</label><input type="email" value={datosCotizacion.emailContacto} onChange={e => setDatosCotizacion({...datosCotizacion, emailContacto: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <div><label className="text-xs font-bold text-gray-600">Teléfono</label><input type="tel" value={datosCotizacion.telefono} onChange={e => setDatosCotizacion({...datosCotizacion, telefono: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                            <button onClick={generarPDF} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"><FileText className="w-6 h-6"/> Generar PDF Formal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PUBLICAR/EDITAR PRODUCTO */}
            {showPublicarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                        <button onClick={cerrarModalEdicion} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-gray-800 mb-6">{modoEdicion ? 'Editar Producto' : 'Publicar Nuevo Producto'}</h2>
                        <form onSubmit={handleGuardarProducto} className="space-y-4">
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label><input type="text" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Ej: Mesa"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Precio</label><input type="number" required value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} className="w-full p-3 border rounded-xl"/></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label><select value={nuevoProducto.categoria} onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full p-3 border rounded-xl bg-white"><option value="general">Nuevo</option><option value="garage">Garage (Usado)</option></select></div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Foto {modoEdicion && '(Opcional)'}</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        {procesandoImagen ? <span className="animate-pulse text-blue-500">Optimizando...</span> : previewUrl ? <img src={previewUrl} className="h-32 object-contain rounded"/> : <div className="flex flex-col items-center"><UploadCloud className="w-8 h-8 text-gray-400"/><span className="text-sm">Toca para subir</span></div>}
                                    </div>
                                </div>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label><textarea rows={3} value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Detalles..."/></div>
                            <button type="submit" disabled={loading || procesandoImagen} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg flex justify-center items-center gap-2"><Save className="w-5 h-5"/> {loading || subiendoImagen ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Publicar')}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL LOGIN / REGISTRO COMPLETO EMPRESA */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                        
                        {/* BOTÓN CERRAR CON LIMPIEZA AUTOMÁTICA */}
                        <button onClick={() => { setShowAuthModal(false); limpiarFormularioRegistro(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-blue-800 mb-2">{authMode === 'login' ? 'Bienvenido de nuevo' : 'Registro de Empresa'}</h2>
                            <p className="text-gray-500">{authMode === 'login' ? 'Ingresa a tu cuenta' : 'Configura tu perfil de vendedor'}</p>
                        </div>
                        
                        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{errorMsg}</div>}
                        
                        <form onSubmit={handleAuth} className="space-y-4">
                            {/* DATOS COMUNES */}
                            <div><label className="text-sm font-bold text-gray-700">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
                            <div><label className="text-sm font-bold text-gray-700">Contraseña</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
                            
                            {/* DATOS EXTRA SOLO PARA REGISTRO */}
                            {authMode === 'register' && (
                                <>
                                    <div className="border-t border-gray-200 my-4 pt-4"><p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Datos del Representante</p></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-600">Nombre Completo</label><input type="text" required value={regNombre} onChange={(e) => setRegNombre(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
                                        <div><label className="text-xs font-bold text-gray-600">Teléfono</label><input type="tel" required value={regTelefono} onChange={(e) => setRegTelefono(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
                                    </div>

                                    <div className="border-t border-gray-200 my-4 pt-4"><p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Datos de la Empresa</p></div>
                                    <div><label className="text-xs font-bold text-gray-600">Razón Social (Nombre Empresa)</label><input type="text" required value={regEmpresa} onChange={(e) => setRegEmpresa(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-600">RUT Empresa</label><input type="text" required value={regRut} onChange={(e) => setRegRut(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="76.xxx.xxx-k"/></div>
                                        <div><label className="text-xs font-bold text-gray-600">Dirección</label><input type="text" required value={regDireccion} onChange={(e) => setRegDireccion(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
                                    </div>

                                    {/* LOGO UPLOAD */}
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-gray-600 mb-2">Logo de la Empresa</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center justify-center h-24">
                                            <input type="file" accept="image/*" onChange={handleLogoSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                            {regLogoPreview ? (
                                                <div className="flex items-center gap-4">
                                                    <img src={regLogoPreview} className="h-16 w-16 object-contain rounded border bg-white"/>
                                                    <span className="text-green-600 text-xs font-bold">¡Logo listo!</span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 flex flex-col items-center">
                                                    <ImageIcon className="w-6 h-6 mb-1"/>
                                                    <span className="text-xs">Subir Logo (JPG/PNG)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg mt-6">
                                {loading ? 'Procesando...' : (authMode === 'login' ? 'Ingresar' : 'Crear Cuenta Empresa')}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            {authMode === 'login' ? (
                                <p>¿Eres nuevo vendedor? <button onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline">Registra tu Pyme aquí</button></p>
                            ) : (
                                <p>¿Ya tienes cuenta? <button onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline">Ingresa aquí</button></p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER - RECUPERADO */}
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
