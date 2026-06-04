import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, ChevronRight, X, Trash2, Utensils, Facebook, Instagram, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSheetData, submitSheetData, SheetDish, SheetCategory } from './services/googleSheets';

// ==========================================
// 📋 CONFIGURACIÓN DE LA PLANTILLA DEL MENÚ
// ==========================================
const RESTAURANTE_NAME = "Real CHICKEN";
const RESTAURANTE_SLOGAN = "El verdadero pollo a la brasa";
const WHATSAPP_NUMBER = "51988145351"; // Número de WhatsApp de Real CHICKEN
const FACEBOOK_URL = "https://www.facebook.com/PolleriaRea/?locale=es_LA";
const TIKTOK_URL = "https://www.tiktok.com/@realchicken_polleria";
const INSTAGRAM_URL = "";
const MAPS_URL = "https://maps.app.goo.gl/MDtHKXYqaHrMrASPA";
const LOGO_FOOTER_PATH = "/footer.jpeg"; // Ruta de tu logo en public/
const BANNER_PATH = "/banner.jpg"; // Usar el banner subido
const MARQUEE_TEXT = "👑 EL VERDADERO POLLO A LA BRASA • 🍗 SABOR QUE REINA • 🔥 ¡PIDE TU MOSTRITO YA! • 🍟 BRASAS Y PASIÓN ";
// ==========================================

// Datos locales por defecto de Real CHICKEN (Fallback robusto si no hay Google Sheets conectado)
const LOCAL_CATEGORIES = [
  { nombre: "Brasas" },
  { nombre: "Mostritos" },
  { nombre: "Combos" },
  { nombre: "Broaster" },
  { nombre: "Parrillas" },
  { nombre: "Adicionales" },
  { nombre: "Vinos" },
  { nombre: "Bebidas" }
];

const LOCAL_DISHES = [
  { "categoría": "Brasas", "nombre del plato": "1 Pollo Entero", "descripción": "Incluye papa frita y ensalada.", "precio": "S/.75", "URL de imagen": "" },
  { "categoría": "Brasas", "nombre del plato": "1/2 Pollo", "descripción": "Incluye papa frita y ensalada.", "precio": "S/.40", "URL de imagen": "" },
  { "categoría": "Brasas", "nombre del plato": "1/4 Pollo", "descripción": "Incluye papa frita y ensalada.", "precio": "S/.22", "URL de imagen": "" },
  { "categoría": "Brasas", "nombre del plato": "1/8 Pollo", "descripción": "Incluye papa frita y ensalada.", "precio": "S/.13", "URL de imagen": "" },
  { "categoría": "Mostritos", "nombre del plato": "1 Mini Mostrito", "descripción": "1/8 de Pollo a la Brasa con arroz chaufa, papa frita y ensalada.", "precio": "S/.16", "URL de imagen": "" },
  { "categoría": "Mostritos", "nombre del plato": "1 Mostrito", "descripción": "1/4 de Pollo a la Brasa con arroz chaufa, papa frita y ensalada.", "precio": "S/.28", "URL de imagen": "" },
  { "categoría": "Mostritos", "nombre del plato": "1 Mostrito Parrillero", "descripción": "Filete de pierna a la parrilla con arroz chaufa, papa frita y ensalada.", "precio": "S/.20", "URL de imagen": "" },
  { "categoría": "Mostritos", "nombre del plato": "1 Mostrito Power Parrillero", "descripción": "Filete de pierna a la parrilla + Chorizo, acompañado de arroz chaufa, papa frita y ensalada.", "precio": "S/.25", "URL de imagen": "" },
  { "categoría": "Combos", "nombre del plato": "1 Combo Familiar", "descripción": "1 pollo entero completo + porción de chaufa y una gaseosa de 1.5 litros.", "precio": "S/.92", "URL de imagen": "" },
  { "categoría": "Combos", "nombre del plato": "Combo Bravo", "descripción": "1/2 Pollo a la brasa, 4 piezas de broaster, 1/2 porción de arroz chaufa + papas + ensalada + 1 gaseosa de 1.5 lt.", "precio": "S/.95", "URL de imagen": "" },
  { "categoría": "Combos", "nombre del plato": "Combito", "descripción": "2 piezas de broaster + papas, ensalada + 1 gaseosa de 500 ml.", "precio": "S/.26", "URL de imagen": "" },
  { "categoría": "Broaster", "nombre del plato": "8 Piezas de Pollo", "descripción": "Pollo broaster crujiente. Incluye papa frita y ensalada.", "precio": "S/.77", "URL de imagen": "" },
  { "categoría": "Broaster", "nombre del plato": "4 Piezas de Pollo", "descripción": "Pollo broaster crujiente. Incluye papa frita y ensalada.", "precio": "S/.40", "URL de imagen": "" },
  { "categoría": "Broaster", "nombre del plato": "2 Piezas de Pollo", "descripción": "Pollo broaster crujiente. Incluye papa frita y ensalada.", "precio": "S/.23", "URL de imagen": "" },
  { "categoría": "Parrillas", "nombre del plato": "1/4 de Pollo a la Parrilla", "descripción": "Incluye papas fritas y ensalada.", "precio": "S/.23", "URL de imagen": "" },
  { "categoría": "Parrillas", "nombre del plato": "1 Chuleta", "descripción": "250 gr. Incluye papas fritas y ensalada.", "precio": "S/.26", "URL de imagen": "chuleta.png" },
  { "categoría": "Parrillas", "nombre del plato": "1 Churrasco", "descripción": "250 gr. Incluye papas fritas y ensalada.", "precio": "S/.28", "URL de imagen": "churrasco.png" },
  { "categoría": "Parrillas", "nombre del plato": "1 Filete de Pierna", "descripción": "Incluye papas fritas y ensalada.", "precio": "S/.22", "URL de imagen": "" },
  { "categoría": "Parrillas", "nombre del plato": "Costilla Chica", "descripción": "450 gr. Incluye papas fritas y ensalada.", "precio": "S/.40", "URL de imagen": "" },
  { "categoría": "Parrillas", "nombre del plato": "Costillar Completo", "descripción": "950 gr. Incluye papas fritas y ensalada.", "precio": "S/.79", "URL de imagen": "" },
  { "categoría": "Parrillas", "nombre del plato": "1 Combo Parrillero Mixto", "descripción": "1/4 de pollo, 1 chuleta, 1 churrasco, 2 chorizos, papas fritas y ensalada.", "precio": "S/.80", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Porción de Papas", "descripción": "Papas fritas crujientes.", "precio": "S/.15", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Media Porción Papas", "descripción": "Media porción de papas fritas crujientes.", "precio": "S/.8", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Porción Ensalada", "descripción": "Ensalada fresca de la casa.", "precio": "S/.12", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Media Porción Ensalada", "descripción": "Media porción de ensalada fresca.", "precio": "S/.7", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Porción de Arroz Chaufa", "descripción": "Arroz chaufa al estilo de la pollería.", "precio": "S/.15", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Media Porción de Chaufa", "descripción": "Media porción de arroz chaufa.", "precio": "S/.8", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Porción de Arroz Blanco", "descripción": "Arroz blanco graneado.", "precio": "S/.10", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "Media Porción de Arroz Blanco", "descripción": "Media porción de arroz blanco graneado.", "precio": "S/.6", "URL de imagen": "" },
  { "categoría": "Adicionales", "nombre del plato": "1 Chorizo a la Parrilla", "descripción": "Chorizo jugoso cocinado a la parrilla.", "precio": "S/.5", "URL de imagen": "" },
  { "categoría": "Vinos", "nombre del plato": "Vino Tacama Rose", "descripción": "Vino rosado.", "precio": "S/.35", "URL de imagen": "" },
  { "categoría": "Vinos", "nombre del plato": "Santiago Queirolo Rose", "descripción": "Vino rosado de la casa Queirolo.", "precio": "S/.27", "URL de imagen": "" },
  { "categoría": "Vinos", "nombre del plato": "Santiago Queirolo Borgoña", "descripción": "Vino tinto dulce.", "precio": "S/.27", "URL de imagen": "" },
  { "categoría": "Vinos", "nombre del plato": "Vino Abuelo Bohemio Rosé", "descripción": "Vino rosado dulce.", "precio": "S/.22", "URL de imagen": "" },
  { "categoría": "Vinos", "nombre del plato": "Vino Bohemio Abuelo Borgoño", "descripción": "Vino tinto borgoña.", "precio": "S/.22", "URL de imagen": "" },
  { "categoría": "Vinos", "nombre del plato": "1 Jarra de Sangría", "descripción": "Refrescante jarra de sangría.", "precio": "S/.30", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa Personal", "descripción": "Gaseosa en presentación personal.", "precio": "S/.3", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa de 500 ml", "descripción": "Gaseosa de medio litro.", "precio": "S/.4", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa Gordita", "descripción": "Gaseosa en presentación clásica gordita.", "precio": "S/.5", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa de 1 Lt.", "descripción": "Gaseosa de un litro.", "precio": "S/.7", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa 1.5 Lt.", "descripción": "Gaseosa de litro y medio.", "precio": "S/.9", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa de 2 Lt.", "descripción": "Gaseosa de dos litros.", "precio": "S/.10", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Gaseosa de 3 Lt.", "descripción": "Gaseosa en presentación familiar de tres litros.", "precio": "S/.15", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1 Jarra de Chicha Morada", "descripción": "Chicha morada tradicional helada.", "precio": "S/.18", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1/2 Jarra de Chicha Morada", "descripción": "Media jarra de chicha morada tradicional.", "precio": "S/.9", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1 Vaso de Chicha", "descripción": "Vaso personal de chicha morada.", "precio": "S/.3", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1 Jarra de Limonada", "descripción": "Jarra de limonada fresca.", "precio": "S/.18", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1/2 Jarra de Limonada", "descripción": "Media jarra de limonada fresca.", "precio": "S/.9", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1 Jarra de Maracuyá", "descripción": "Jarra de refresco de maracuyá.", "precio": "S/.18", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "1/2 Jarra de Maracuyá", "descripción": "Media jarra de refresco de maracuyá.", "precio": "S/.9", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Agua Mineral Chica", "descripción": "Botella personal de agua mineral.", "precio": "S/.3", "URL de imagen": "" },
  { "categoría": "Bebidas", "nombre del plato": "Agua Mineral 2.25 Lt.", "descripción": "Agua mineral en presentación familiar.", "precio": "S/.7", "URL de imagen": "" }
];

// Mapa de imágenes locales por defecto para platos conocidos (vacío por defecto para la plantilla)
const LOCAL_IMAGES: Record<string, string> = {
  // "Nombre del Plato": "nombre_imagen.jpg",
  "1 Pollo Entero": "1 pollo.png",
  "1/2 Pollo": "medio pollo.png",
  "1/4 Pollo": "cuarto de pollo.png",
  "1/8 Pollo": "octavo pollo.png",
  "1 Mini Mostrito": "Mini mostrito.png",
  "1 Mostrito": "mostrito.png",
  "1 Mostrito Parrillero": "mostrito parrillera.png",
  "1 Mostrito Power Parrillero": "Mostrito Power Parrillero.png",
  "1 Combo Familiar": "combo familiar.png",
  "Combo Bravo": "Combo Bravo.png",
  "Combito": "Combito.png",
  "8 Piezas de Pollo": "8 Piezas de Pollo.png",
  "4 Piezas de Pollo": "4 Piezas de Pollo.png",
  "2 Piezas de Pollo": "2 Piezas de Pollo.png",
  "1/4 de Pollo a la Parrilla": "Pollo a la Parrilla.png",
  "1 Chuleta": "chuleta.png",
  "1 Churrasco": "churrasco.png",
  "1 Filete de Pierna": "1 Filete de Pierna.webp",
  "Costilla Chica": "costilla chica.png",
  "Costillar Completo": "Costillar Completo.png",
  "1 Combo Parrillero Mixto": "Combo Parrillero Mixto.png"
};


interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
}

interface Category {
  id: string;
  nombre: string;
  items: Dish[];
}

interface CartItem {
  nombre: string;
  precio: string;
  cantidad: number;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, dishes] = await Promise.all([
          fetchSheetData<SheetCategory>('Categorías'),
          fetchSheetData<SheetDish>('Platos')
        ]);

        let finalCats = cats;
        let finalDishes = dishes;

        if (!finalCats || finalCats.length === 0) {
          finalCats = LOCAL_CATEGORIES;
          finalDishes = LOCAL_DISHES as any[];
        }

        const formattedCategories: Category[] = finalCats.map(c => ({
          id: c.nombre.toLowerCase().replace(/\s+/g, '-'),
          nombre: c.nombre,
          items: finalDishes
            .filter(d => d.categoría === c.nombre)
            .map(d => ({
              nombre: d['nombre del plato'],
              descripcion: d.descripción,
              precio: d.precio,
              imagen: LOCAL_IMAGES[d['nombre del plato']] || d['URL de imagen'] || null
            }))
        }));

        setCategories(formattedCategories);
        if (formattedCategories.length > 0) {
          setActiveCategory(formattedCategories[0].id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.cantidad, 0), [cart]);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.nombre === dish.nombre && i.precio === dish.precio);
      if (existing) {
        return prev.map(i =>
          (i.nombre === dish.nombre && i.precio === dish.precio)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { nombre: dish.nombre, precio: dish.precio, cantidad: 1 }];
    });
  };

  const updateQuantity = (nombre: string, precio: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.nombre === nombre && i.precio === precio) {
            const newQty = i.cantidad + delta;
            return newQty > 0 ? { ...i, cantidad: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const cleanPrice = item.precio.replace(/^[^\d]*/, '');
      const num = parseFloat(cleanPrice) || 0;
      return acc + num * item.cantidad;
    }, 0);
  };

  const sendToWhatsApp = () => {
    const total = calculateTotal();
    let message = `*Hola ${RESTAURANTE_NAME}, deseo realizar un pedido:*\n\n`;
    cart.forEach(item => {
      message += `• ${item.cantidad} x ${item.nombre} (${item.precio})\n`;
    });
    message += `\n*TOTAL: S/.${total.toFixed(2)}*`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-slogan text-primary font-bold tracking-widest uppercase text-xs">Cargando delicias...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col font-sans">
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 px-5 py-3 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center">
          <img src="/header.png" alt={RESTAURANTE_NAME} className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          {FACEBOOK_URL && (
            <motion.a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="w-9 h-9 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-full flex items-center justify-center text-[#1877F2] transition-colors cursor-pointer shadow-sm"
              title="Facebook"
            >
              <Facebook size={18} />
            </motion.a>
          )}
          {TIKTOK_URL && (
            <motion.a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="w-9 h-9 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-black transition-colors cursor-pointer shadow-sm"
              title="TikTok"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.73.9 1.69 1.63 2.77 2.13v3.91c-1.63-.07-3.21-.76-4.45-1.85-.06 2.37.03 4.74-.02 7.12-.08 2.05-.72 4.14-2.11 5.67-1.74 2-4.48 2.92-7.07 2.4-2.73-.43-5.26-2.5-6.04-5.21-.86-2.91.13-6.22 2.47-8.08 1.64-1.32 3.8-1.92 5.92-1.7v4.03c-1.39-.23-2.88.19-3.79 1.25-.9 1.02-1.07 2.53-.47 3.75.54 1.15 1.76 1.95 3.03 1.98 1.48.06 2.9-.84 3.39-2.24.23-.7.18-1.45.19-2.18-.01-3.66.01-7.3-.01-10.96z"/>
              </svg>
            </motion.a>
          )}
          {INSTAGRAM_URL && (
            <motion.a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="w-9 h-9 bg-[#E1306C]/10 hover:bg-[#E1306C]/20 rounded-full flex items-center justify-center text-[#E1306C] transition-colors cursor-pointer shadow-sm"
              title="Instagram"
            >
              <Instagram size={18} />
            </motion.a>
          )}
          {MAPS_URL && (
            <motion.a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="w-9 h-9 bg-[#EA4335]/10 hover:bg-[#EA4335]/20 rounded-full flex items-center justify-center text-[#EA4335] transition-colors cursor-pointer shadow-sm"
              title="Ubicación"
            >
              <MapPin size={18} />
            </motion.a>
          )}
          <motion.div
            onClick={() => cartCount > 0 && setShowSummary(true)}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center relative cursor-pointer ml-1 text-primary hover:bg-primary/20 transition-colors"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-secondary text-white rounded-full text-[9px] font-bold flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </motion.div>
        </div>
      </header>

      <div className="w-full bg-primary py-2 overflow-hidden flex items-center">
        <div className="animate-marquee flex gap-6 text-white font-slogan font-bold text-[11px] tracking-widest uppercase whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i}>{MARQUEE_TEXT}</span>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-3">
        {BANNER_PATH ? (
          <div className="relative w-full rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <img 
              src={BANNER_PATH} 
              alt="Banner Real Chicken" 
              className="w-full h-auto block"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="relative w-full rounded-[2rem] overflow-hidden shadow-sm bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/10 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-6 text-center min-h-[140px]">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 animate-pulse text-primary">
                <Utensils size={20} />
              </div>
              <p className="font-title text-primary text-[24px] tracking-wide leading-none mb-1">Acá va imagen</p>
              <p className="font-slogan text-secondary text-[11px] font-bold uppercase tracking-wider">{RESTAURANTE_SLOGAN}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`font-category px-4 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 border
                ${activeCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-dark border-gray-200 hover:border-primary/40 hover:text-primary'
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-32 px-5">
        {categories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} className="mb-10 scroll-mt-28">
            <div className="mb-5 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Utensils className="text-primary wave-icon" size={22} />
                <h3 className="font-category text-primary text-[24px] font-bold leading-none tracking-wide category-underline">
                  {cat.nombre}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {cat.items.map((dish, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div 
                    className="bg-white aspect-square flex items-center justify-center relative overflow-hidden cursor-pointer group"
                    onClick={() => dish.imagen && setSelectedImage(dish.imagen.startsWith('http') ? dish.imagen : `/${dish.imagen}`)}
                  >
                    {dish.imagen ? (
                      <img 
                        src={dish.imagen.startsWith('http') ? dish.imagen : `/${dish.imagen}`} 
                        alt={dish.nombre} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold text-center p-2">Ver Foto</span>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-dish font-medium text-dark text-[14px] leading-snug mb-1">
                      {dish.nombre}
                    </h4>
                    {dish.descripcion && (
                      <p className="font-sans text-[11px] text-gray-400 leading-snug mb-2 line-clamp-3">
                        {dish.descripcion}
                      </p>
                    )}
                    <div className="flex-1"></div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-sans font-bold text-primary text-[15px] whitespace-nowrap">
                        {dish.precio}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => addToCart(dish)}
                        className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary transition-colors duration-200 shrink-0"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-8 pt-8 pb-10 border-t border-gray-200 flex flex-col items-center justify-center">
          <p className="font-title text-2xl text-primary mb-4">{RESTAURANTE_NAME}</p>
          {LOGO_FOOTER_PATH && (
            <img 
              src={LOGO_FOOTER_PATH} 
              alt={RESTAURANTE_NAME} 
              className="w-32 h-32 object-contain mb-6 rounded-2xl shadow-sm border border-gray-100" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <p className="text-[11px] text-gray-400 font-medium">© 2026 Todos los derechos reservados.</p>
        </footer>

        <div className="bg-dark py-6 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 opacity-50 text-white/50">Digital Menu Experience</p>
          <motion.a 
            href="https://tymasolutions.lat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-sm tracking-tight group cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white group-hover:text-[#00BFFF] transition-colors duration-200">Hecho por Tyma</span>
            <span className="text-[#00BFFF] group-hover:text-white transition-colors duration-200">Solutions</span>
          </motion.a>
        </div>
      </main>

      <AnimatePresence>
        {cartCount > 0 && !showSummary && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 w-full max-w-md p-5 z-40"
          >
            <div className="glass rounded-[2rem] p-4 flex items-center justify-between border border-white/50 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="shimmer absolute inset-0 opacity-20"></div>
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tu Pedido</p>
                  <p className="font-bold text-dark text-lg">{cartCount} Artículos</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummary(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/30 font-bold text-sm"
              >
                Ver Pedido
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 lg:p-0"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[3rem] p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-title text-2xl text-primary">Mi Pedido</h2>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-3 mb-8">
                {cart.map(item => (
                  <div
                    key={`${item.nombre}-${item.precio}`}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-dark text-sm truncate">{item.nombre}</h4>
                      <p className="text-xs text-primary font-bold">{item.precio}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                      <button onClick={() => updateQuantity(item.nombre, item.precio, -1)} className="text-gray-400">
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.nombre, item.precio, 1)} className="text-primary">
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => updateQuantity(item.nombre, item.precio, -item.cantidad)}
                      className="text-red-300 ml-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-dark">Total a pagar</h3>
                  <h3 className="text-xl font-bold text-primary">S/.{calculateTotal().toFixed(2)}</h3>
                </div>
              </div>
              <button
                onClick={sendToWhatsApp}
                className="w-full bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:scale-[1.02] transition-transform font-bold"
              >
                Enviar Pedido a WhatsApp
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Plato ampliado"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>



    </div>
  );
}
