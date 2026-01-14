import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Docuflow() {
  const [cliente, setCliente] = useState('');
  const [items, setItems] = useState([{ descripcion: '', cantidad: 1, precio: 0 }]);
  const [loading, setLoading] = useState(false);

  const agregarItem = () => {
    setItems([...items, { descripcion: '', cantidad: 1, precio: 0 }]);
  };

  const actualizarItem = (index: number, campo: string, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  const calcularTotal = () => {
    return items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
  };

  const generarDocumento = async () => {
    setLoading(true);
    // Aquí iría la lógica para guardar en Supabase o generar PDF
    alert(`Generando Cotización para: ${cliente}\nTotal: $${calcularTotal()}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900">Docuflow</h1>
          <span className="text-gray-500">Generador de Documentos</span>
        </div>

        {/* Datos del Cliente */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Cliente / Empresa</label>
          <input 
            type="text" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            placeholder="Nombre del cliente..."
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
        </div>

        {/* Tabla de Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Detalle</h3>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input 
                placeholder="Descripción" 
                className="flex-1 border p-2 rounded"
                value={item.descripcion}
                onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Cant." 
                className="w-20 border p-2 rounded"
                value={item.cantidad}
                onChange={(e) => actualizarItem(index, 'cantidad', Number(e.target.value))}
              />
              <input 
                type="number" 
                placeholder="Precio" 
                className="w-32 border p-2 rounded"
                value={item.precio}
                onChange={(e) => actualizarItem(index, 'precio', Number(e.target.value))}
              />
            </div>
          ))}
          <button onClick={agregarItem} className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
            + Agregar Línea
          </button>
        </div>

        {/* Total y Acciones */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded">
          <div className="text-2xl font-bold">Total: ${calcularTotal().toLocaleString()}</div>
          <button 
            onClick={generarDocumento}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow"
          >
            {loading ? 'Procesando...' : 'Generar PDF / Cotización'}
          </button>
        </div>
      </div>
    </div>
  );
}
