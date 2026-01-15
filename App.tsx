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
                limpiarFormularioRegistro(); // Limpiar al entrar
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
                limpiarFormularioRegistro(); // <--- AQUÍ SE LIMPIA EL FORMULARIO
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
                            <div className="flex items-center
