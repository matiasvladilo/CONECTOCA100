import { useState, useEffect } from 'react';
import { Product, Category, categoriesAPI, ProductionArea, productionAreasAPI, ingredientsAPI, type Ingredient, type ProductIngredient, businessAPI, notificationsAPI, profileAPI } from '../utils/api';
import { productsAPI } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  Package,
  Edit,
  Trash2,
  DollarSign,
  BoxIcon,
  Sparkles,
  Search,
  Tag,
  Image as ImageIcon,
  Folder,
  Factory,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo.png';
import { formatCLP, parseCLP, formatCLPInput } from '../utils/format';
import { ImageUpload } from './ImageUpload';

interface ProductManagementProps {
  accessToken: string;
  onBack: () => void;
  onManageCategories: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  categoryId: string;
  imageUrl: string;
  productionAreaId: string;
  unlimitedStock: boolean;
  ingredients: (ProductIngredient & { inputUnit?: string })[];
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: 'General',
  categoryId: '',
  imageUrl: '',
  productionAreaId: '',
  unlimitedStock: false,
  ingredients: []
};

export function ProductManagement({ accessToken, onBack, onManageCategories }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productionAreas, setProductionAreas] = useState<ProductionArea[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [isDeleting, setIsDeleting] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadProductionAreas();
    loadIngredients();

    // Load profile to identify current user
    profileAPI.get(accessToken).then(profile => {
      setCurrentUserId(profile.id);
    }).catch(err => console.error("Error loading profile", err));
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔵 [ProductManagement] Loading products...');
      const data = await productsAPI.getAll(accessToken);
      console.log('🔵 [ProductManagement] Products received:', data?.length || 0, 'products');
      if (data && data.length > 0) {
        console.log('🔵 [ProductManagement] Sample product:', data[0]);
      }
      setProducts(data);
    } catch (error: any) {
      console.error('❌ [ProductManagement] Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll(accessToken);
      setCategories(data);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProductionAreas = async () => {
    try {
      const data = await productionAreasAPI.getAll(accessToken);
      setProductionAreas(data);
    } catch (error: any) {
      console.error('Error loading production areas:', error);
    }
  };

  const loadIngredients = async () => {
    try {
      const data = await ingredientsAPI.getAll(accessToken);
      setIngredients(data);
    } catch (error: any) {
      console.error('Error loading ingredients:', error);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: formatCLP(product.price, false), // Format without $ symbol for editing
        stock: product.stock.toString(),
        category: product.category || 'General',
        categoryId: product.categoryId || '',
        imageUrl: product.imageUrl || '',
        productionAreaId: product.productionAreaId || '',
        unlimitedStock: product.stock === -1,
        ingredients: product.ingredients || []
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    // Parse Chilean peso format
    const priceValue = parseCLP(formData.price);
    if (!formData.price || priceValue < 0) {
      toast.error('El precio debe ser mayor o igual a 0');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('El stock debe ser mayor o igual a 0');
      return;
    }

    try {
      setSubmitting(true);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceValue,
        stock: formData.unlimitedStock ? -1 : parseInt(formData.stock),
        category: formData.category.trim() || 'General',
        categoryId: formData.categoryId || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        productionAreaId: formData.productionAreaId || undefined,
        ingredients: formData.ingredients.map(pi => {
          // Convert back to base unit if necessary before saving
          let quantityToSave = pi.quantity;
          const unit = pi.inputUnit;
          if (unit === 'g' || unit === 'ml') {
            quantityToSave = quantityToSave / 1000;
          }
          return {
            ingredientId: pi.ingredientId,
            quantity: quantityToSave
          };
        })
      };

      if (editingProduct) {
        // Update existing product
        const updated = await productsAPI.update(accessToken, editingProduct.id, productData);
        setProducts(products.map(p => p.id === updated.id ? updated : p));
        toast.success('Producto actualizado exitosamente');

        // Notify if price changed
        if (editingProduct.price !== productData.price) {
          businessAPI.getMembers(accessToken).then(({ members }) => {
            const promises = members
              .filter(m => m.id !== currentUserId)
              .map(m => notificationsAPI.create(accessToken, {
                title: 'Cambio de Precio',
                message: `El precio del producto "${productData.name}" ha cambiado a ${formatCLP(productData.price)}.`,
                type: 'product_updated',
                targetUserId: m.id
              }));
            Promise.all(promises).catch(e => console.error("Error creating notifications", e));
          }).catch(e => console.error("Error fetching members", e));
        }
      } else {
        // Create new product
        const created = await productsAPI.create(accessToken, productData);
        setProducts([created, ...products]);
        toast.success('Producto creado exitosamente');

        // Notify creation
        businessAPI.getMembers(accessToken).then(({ members }) => {
          const promises = members
            .filter(m => m.id !== currentUserId)
            .map(m => notificationsAPI.create(accessToken, {
              title: 'Nuevo Producto',
              message: `Se ha agregado el producto "${productData.name}" al catálogo.`,
              type: 'product_created',
              targetUserId: m.id
            }));
          Promise.all(promises).catch(e => console.error("Error creating notifications", e));
        }).catch(e => console.error("Error fetching members", e));
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;

    try {
      await productsAPI.delete(accessToken, isDeleting.id);
      setProducts(products.filter(p => p.id !== isDeleting.id));
      toast.success('Producto eliminado exitosamente');
      setIsDeleting(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Error al eliminar producto');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock < 10 && p.stock !== -1).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #EAF2FF 0%, #CFE0FF 100%)' }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <div
        className="relative z-10 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0047BA 0%, #0078FF 100%)',
          borderBottom: '3px solid #FFD43B'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.1, x: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 flex items-center justify-center rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>

              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute w-12 h-12 bg-yellow-400/30 rounded-full blur-lg" />
                  <img
                    src={logo}
                    alt="La Oca Logo"
                    className="w-12 h-12 object-contain relative z-10"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </motion.div>
                <div>
                  <h1 className="text-white tracking-wide flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 600 }}>
                    <Package className="w-6 h-6" />
                    Gestión de Productos
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Administra el catálogo de productos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={onManageCategories}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                <Folder className="w-4 h-4" />
                Categorías
              </motion.button>

              <motion.button
                onClick={() => handleOpenDialog()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #FFD43B 0%, #FFC700 100%)',
                  color: '#0047BA',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <Plus className="w-5 h-5" />
                Nuevo Producto
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div
              className="p-4 rounded-xl backdrop-blur-md"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-100" />
                <span className="text-xs text-blue-100">Total Productos</span>
              </div>
              <p className="text-white" style={{ fontSize: '24px', fontWeight: 600 }}>
                {stats.total}
              </p>
            </motion.div>

            <motion.div
              className="p-4 rounded-xl backdrop-blur-md"
              style={{
                background: 'rgba(255, 212, 59, 0.2)',
                border: '1px solid rgba(255, 212, 59, 0.3)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <BoxIcon className="w-4 h-4 text-yellow-200" />
                <span className="text-xs text-yellow-100">Stock Bajo</span>
              </div>
              <p className="text-white" style={{ fontSize: '24px', fontWeight: 600 }}>
                {stats.lowStock}
              </p>
            </motion.div>

            <motion.div
              className="p-4 rounded-xl backdrop-blur-md"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4 text-red-200" />
                <span className="text-xs text-red-100">Sin Stock</span>
              </div>
              <p className="text-white" style={{ fontSize: '24px', fontWeight: 600 }}>
                {stats.outOfStock}
              </p>
            </motion.div>

            <motion.div
              className="p-4 rounded-xl backdrop-blur-md"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-200" />
                <span className="text-xs text-green-100">Valor Total</span>
              </div>
              <p className="text-white" style={{ fontSize: '20px', fontWeight: 600 }}>
                {formatCLP(stats.totalValue)}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5 relative z-10">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="border-2 shadow-lg"
            style={{ borderRadius: '16px', borderColor: '#E0EDFF' }}
          >
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, descripción o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 bg-white border-[#CBD5E1]"
                  style={{ borderRadius: '10px' }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="border-2 border-dashed"
              style={{ borderRadius: '16px', borderColor: '#CBD5E1' }}
            >
              <CardContent className="p-16 text-center">
                <div
                  className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
                >
                  <Package className="w-10 h-10 text-blue-300" />
                </div>
                <p className="text-gray-600 mb-2" style={{ fontSize: '16px', fontWeight: 500 }}>
                  {searchQuery ? 'No se encontraron productos' : 'No hay productos aún'}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchQuery ? 'Intenta con otra búsqueda' : 'Crea tu primer producto para comenzar'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="mt-2"
                    style={{
                      background: 'linear-gradient(90deg, #0059FF 0%, #004BCE 100%)',
                      color: 'white'
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Producto
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.05) }}
              >
                <Card
                  className="border-2 hover:shadow-xl transition-all duration-300 group h-full"
                  style={{
                    borderRadius: '16px',
                    borderTopWidth: '4px',
                    borderTopColor: product.stock === 0 ? '#EF4444' : product.stock < 10 ? '#F59E0B' : '#10B981',
                    borderLeftColor: '#E0EDFF',
                    borderRightColor: '#E0EDFF',
                    borderBottomColor: '#E0EDFF'
                  }}
                >
                  <CardContent className="p-5">
                    {/* Product Image/Icon */}
                    <div
                      className="w-full h-32 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                      }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-blue-300" />
                      )}
                    </div>

                    {/* Category Badge */}
                    {product.category && (
                      <Badge
                        className="mb-2 text-xs px-2 py-0.5"
                        style={{
                          background: 'rgba(0, 71, 186, 0.1)',
                          color: '#0047BA',
                          border: '1px solid rgba(0, 71, 186, 0.2)'
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {product.category}
                      </Badge>
                    )}

                    {/* Product Name */}
                    <h3
                      className="text-[#0047BA] mb-2 line-clamp-2"
                      style={{ fontSize: '16px', fontWeight: 600 }}
                    >
                      {product.name}
                    </h3>

                    {/* Description */}
                    {product.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Price & Stock */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Precio</p>
                        <p className="text-[#0047BA]" style={{ fontSize: '18px', fontWeight: 600 }}>
                          {formatCLP(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Stock</p>
                        <p
                          className={`${product.stock === 0 ? 'text-red-600' :
                            product.stock < 10 ? 'text-amber-600' :
                              'text-green-600'
                            }`}
                          style={{ fontSize: '18px', fontWeight: 600 }}
                        >
                          {product.stock === -1 ? 'Ilimitado' : product.stock}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenDialog(product)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#0059FF] text-[#0059FF] hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => setIsDeleting(product)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingProduct ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Actualiza la información del producto'
                : 'Completa los datos del nuevo producto'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cajas de Cartón Premium"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el producto..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">Precio *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stock">Stock *</Label>
                <div className="relative">
                  <BoxIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="pl-9"
                    required
                    disabled={formData.unlimitedStock}
                  />
                </div>
              </div>

              {/* Unlimited Stock Checkbox */}
              <div className="col-span-2">
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Checkbox
                    id="unlimited-stock"
                    checked={formData.unlimitedStock}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      unlimitedStock: checked as boolean,
                      stock: checked ? '0' : formData.stock
                    })}
                    className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="unlimited-stock"
                      className="text-sm text-blue-900 cursor-pointer select-none block"
                      style={{ fontWeight: 500 }}
                    >
                      ∞ Stock Ilimitado / Sin Control
                    </label>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Ideal para productos bajo pedido o servicios sin inventario físico
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </motion.div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setFormData({
                        ...formData,
                        categoryId: '',
                        category: 'General'
                      });
                    } else {
                      const selectedCategory = categories.find(c => c.id === value);
                      setFormData({
                        ...formData,
                        categoryId: value,
                        category: selectedCategory?.name || 'General'
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No hay categorías. <button type="button" onClick={onManageCategories} className="text-blue-600 underline">Crear una</button>
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="productionAreaId">Área de Producción</Label>
                <Select
                  value={formData.productionAreaId || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setFormData({
                        ...formData,
                        productionAreaId: ''
                      });
                    } else {
                      setFormData({
                        ...formData,
                        productionAreaId: value
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar área de producción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin área de producción</SelectItem>
                    {productionAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {productionAreas.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No hay áreas de producción. <button type="button" onClick={onManageCategories} className="text-blue-600 underline">Crear una</button>
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  label="Imagen del Producto"
                  accessToken={accessToken}
                />
              </div>

              {/* Recipe/Ingredients Section */}
              <div className="col-span-2">
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-blue-600" />
                      Receta del Producto (Ingredientes)
                    </Label>
                    <Badge variant="outline" className="bg-white">
                      {formData.ingredients.length} ingrediente{formData.ingredients.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Define qué materias primas se necesitan para fabricar este producto. El stock se descontará automáticamente al crear órdenes de producción.
                  </p>

                  {/* Add Ingredient Selector */}
                  <div className="mb-4">
                    <Label className="text-xs mb-2 block">Agregar Ingrediente</Label>
                    <Select
                      value="none"
                      onValueChange={(value) => {
                        if (value !== "none") {
                          // Check if ingredient is already added
                          if (formData.ingredients.some(i => i.ingredientId === value)) {
                            toast.error('Este ingrediente ya está agregado');
                            return;
                          }
                          const ingredientData = ingredients.find(i => i.id === value);
                          if (ingredientData) {
                            setFormData({
                              ...formData,
                              ingredients: [
                                ...formData.ingredients,
                                {
                                  ingredientId: value,
                                  ingredientName: ingredientData.name,
                                  quantity: 1,
                                  unit: ingredientData.unit,
                                  inputUnit: ingredientData.unit // Default to base unit
                                }
                              ]
                            });
                            toast.success(`${ingredientData.name} agregado a la receta`);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="+ Seleccionar ingrediente para agregar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>Seleccionar ingrediente</SelectItem>
                        {ingredients.length === 0 ? (
                          <SelectItem value="no-ingredients" disabled>
                            No hay materias primas disponibles
                          </SelectItem>
                        ) : (
                          ingredients
                            .filter(ing => !formData.ingredients.some(i => i.ingredientId === ing.id))
                            .map((ing) => (
                              <SelectItem key={ing.id} value={ing.id}>
                                {ing.name} - Stock: {ing.currentStock} {ing.unit}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    {ingredients.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        No hay materias primas disponibles. Crea materias primas primero desde Perfil → Materias Primas.
                      </p>
                    )}
                  </div>

                  {/* Ingredient List */}
                  <div className="space-y-2">
                    {formData.ingredients.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                        <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                          No hay ingredientes en la receta
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Selecciona ingredientes arriba para agregarlos
                        </p>
                      </div>
                    ) : (
                      <>
                        <Label className="text-xs">Ingredientes de la Receta:</Label>
                        {formData.ingredients.map((ingredient, index) => {
                          const ingredientData = ingredients.find(i => i.id === ingredient.ingredientId);
                          return (
                            <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300 hover:border-blue-400 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {ingredientData?.name || 'Ingrediente desconocido'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Stock disponible: {ingredientData?.currentStock || 0} {ingredientData?.unit}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={ingredient.quantity}
                                  onChange={(e) => {
                                    const newIngredients = [...formData.ingredients];
                                    newIngredients[index].quantity = parseFloat(e.target.value) || 0.01;
                                    setFormData({ ...formData, ingredients: newIngredients });
                                  }}
                                  className="w-20 h-8 text-center"
                                  placeholder="Cant."
                                />
                                <div className="w-20">
                                  <Select
                                    value={ingredient.inputUnit || ingredientData?.unit || 'unidades'}
                                    onValueChange={(val) => {
                                      const newIngredients = [...formData.ingredients];
                                      // Store the input type (unit)
                                      // If changing unit, we might want to adjust quantity? Or just interpret quantity differently?
                                      // The requirement "meter el ingrediente en gramos y que haga la transformación" means the input value is in 'val', 
                                      // but we need to store it as base unit eventually? 
                                      // Or we store the input unit and convert on Save. The user said "haga la transformacion automatica".
                                      // Let's store inputUnit and rawInputQuantity if we want to preserve what user sees.
                                      // But here we are iterating formData.ingredients which is ProductIngredient[].
                                      // Let's augment the state to handle this UI logic or do it on the fly.
                                      // Easier: Use a local unit state per row? But rows are dynamic.
                                      // Let's add an optional 'inputUnit' property to the ingredient object in formData for UI purposes.
                                      // We need to update the interface in the component or just cast it.
                                      newIngredients[index] = { ...newIngredients[index], inputUnit: val };

                                      // If switching from kg to g, multiply by 1000? Or just keep number and let user change it?
                                      // Usually better to keep number or convert. If I have 1 kg and switch to g, it should be 1000 g.
                                      const currentQty = newIngredients[index].quantity;
                                      const currentUnit = ingredient.inputUnit || ingredientData?.unit;

                                      // Simple conversion logic for display
                                      if (currentUnit === 'kg' && val === 'g') newIngredients[index].quantity = currentQty * 1000;
                                      if (currentUnit === 'g' && val === 'kg') newIngredients[index].quantity = currentQty / 1000;
                                      if (currentUnit === 'l' && val === 'ml') newIngredients[index].quantity = currentQty * 1000;
                                      if (currentUnit === 'ml' && val === 'l') newIngredients[index].quantity = currentQty / 1000;

                                      setFormData({ ...formData, ingredients: newIngredients });
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(() => {
                                        const baseUnit = ingredientData?.unit?.toLowerCase();
                                        if (baseUnit === 'kg' || baseUnit === 'kilos') {
                                          return (
                                            <>
                                              <SelectItem value="kg">kg</SelectItem>
                                              <SelectItem value="g">g</SelectItem>
                                            </>
                                          );
                                        } else if (baseUnit === 'l' || baseUnit === 'litros') {
                                          return (
                                            <>
                                              <SelectItem value="l">l</SelectItem>
                                              <SelectItem value="ml">ml</SelectItem>
                                            </>
                                          );
                                        } else {
                                          return <SelectItem value={baseUnit || 'unidades'}>{baseUnit || 'unidades'}</SelectItem>;
                                        }
                                      })()}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                                    setFormData({ ...formData, ingredients: newIngredients });
                                    toast.success('Ingrediente eliminado de la receta');
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-800">
                            ✓ Esta receta tiene {formData.ingredients.length} ingrediente{formData.ingredients.length !== 1 ? 's' : ''} configurado{formData.ingredients.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(90deg, #0059FF 0%, #004BCE 100%)',
                  color: 'white'
                }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    {editingProduct ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {editingProduct ? 'Actualizar' : 'Crear Producto'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!isDeleting} onOpenChange={() => setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar <strong>{isDeleting?.name}</strong>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}