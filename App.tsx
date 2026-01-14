import React, { useState } from 'react';
import { FileText, Plus, Trash2, Download, Save } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState([{ id: 1, desc: '', cant: 1, precio: 0 }]);
  const [cliente, setCliente] = useState('');

  const total = items.reduce((sum, item) => sum + (item.cant * item.precio), 0);

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', cant: 1, precio: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb' }}>
          <FileText /> Docuflow
        </h1>
        <p style={{ color: '#666' }}>Generador de Cotizaciones</p>
      </header>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cliente / Empresa:</label>
        <input 
          type="text" 
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre del cliente..."
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Descripción</th>
              <th style={{ padding: '10px', width: '80px' }}>Cant.</th>
              <th style={{ padding: '10px', width: '120px' }}>Precio</th>
              <th style={{ padding: '10px', width: '100px' }}>Total</th>
              <th style={{ padding: '10px', width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  <input 
                    type="text" 
                    value={item.desc}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].desc = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Producto o servicio..."
                    style={{ width: '100%', padding: '5px' }}
                  />
                </td>
                <td style={{ padding: '10px' }}>
                  <input 
                    type="number" 
                    value={item.cant}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].cant = Number(e.target.value);
                      setItems(newItems);
                    }}
                    style={{ width: '100%', padding: '5px' }}
                  />
                </td>
                <td style={{ padding: '10px' }}>
                  <input 
                    type="number" 
                    value={item.precio}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].precio = Number(e.target.value);
                      setItems(newItems);
                    }}
                    style={{ width: '100%', padding: '5px' }}
                  />
                </td>
                <td style={{ padding: '10px' }}>${(item.cant * item.precio).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => removeItem(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button onClick={addItem} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          <Plus size={18} /> Agregar Ítem
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h2 style={{ margin: 0 }}>Total: ${total.toLocaleString()}</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          <Save size={18} /> Guardar Cotización
        </button>
      </div>
    </div>
  );
}
