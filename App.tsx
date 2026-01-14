import React from 'react';
import { ShoppingCart, Store, Package, Info } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Tienda El Gran Bazar</h1>
        <p className="text-gray-600">¡Próximamente todos nuestros productos aquí!</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
          <Store className="text-blue-500 w-10 h-10" />
          <div>
            <h2 className="font-semibold text-lg">Catálogo</h2>
            <p className="text-sm text-gray-500">Explora nuestros productos disponibles.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
          <ShoppingCart className="text-green-500 w-10 h-10" />
          <div>
            <h2 className="font-semibold text-lg">Carrito</h2>
            <p className="text-sm text-gray-500">Gestiona tus pedidos fácilmente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
