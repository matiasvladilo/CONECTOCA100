import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Save, Trash2, Package, ChefHat, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  productsAPI,
  ingredientsAPI,
  productIngredientsAPI,
  type Product,
  type Ingredient as APIIngredient,
  type ProductIngredient as APIProductIngredient,
} from "../utils/api";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "motion/react";

interface ProductIngredientConfigProps {
  onBack: () => void;
  accessToken: string;
}

export function ProductIngredientConfig({ onBack, accessToken }: ProductIngredientConfigProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<APIIngredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productIngredients, setProductIngredients] = useState<APIProductIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: "",
    quantity: 0,
  });

  useEffect(() => {
    console.log("ProductIngredientConfig: Component mounted");
    console.log("Access Token:", accessToken ? "Present" : "Missing");
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      console.log("Loading ingredients for product:", selectedProduct.name);
      loadProductIngredients(selectedProduct.id);
    }
  }, [selectedProduct]);

  const loadInitialData = async () => {
    try {
      console.log("Loading initial data...");
      setLoading(true);
      const [productsData, ingredientsData] = await Promise.all([
        productsAPI.getAll(accessToken),
        ingredientsAPI.getAll(accessToken),
      ]);
      console.log("Products loaded:", productsData.length);
      console.log("Ingredients loaded:", ingredientsData.length);
      setProducts(productsData);
      setIngredients(ingredientsData);

      if (productsData.length > 0) {
        setSelectedProduct(productsData[0]);
      }
    } catch (error: any) {
      console.error("Error loading initial data:", error);
      toast.error(error.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const loadProductIngredients = async (productId: string) => {
    try {
      const data = await productIngredientsAPI.getByProduct(accessToken, productId);
      setProductIngredients(data);
    } catch (error: any) {
      console.error("Error loading product ingredients:", error);
      toast.error(error.message || "Error al cargar ingredientes del producto");
    }
  };

  const handleAddIngredient = async () => {
    if (!selectedProduct || !newIngredient.ingredientId || newIngredient.quantity <= 0) {
      toast.error("Complete todos los campos");
      return;
    }

    try {
      setSaving(true);
      await productIngredientsAPI.addIngredient(
        accessToken,
        selectedProduct.id,
        newIngredient.ingredientId,
        newIngredient.quantity
      );

      toast.success("Ingrediente agregado al producto");
      setShowAddForm(false);
      setNewIngredient({ ingredientId: "", quantity: 0 });
      loadProductIngredients(selectedProduct.id);
    } catch (error: any) {
      console.error("Error adding ingredient:", error);
      toast.error(error.message || "Error al agregar ingrediente");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuantity = async (ingredientId: string, newQuantity: number) => {
    if (!selectedProduct || newQuantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      // Get all current ingredients
      const updatedIngredients = productIngredients.map(pi => ({
        ingredientId: pi.ingredientId,
        quantity: pi.ingredientId === ingredientId ? newQuantity : pi.quantity
      }));

      // Use setIngredients to update all at once
      await productIngredientsAPI.setIngredients(
        accessToken,
        selectedProduct.id,
        updatedIngredients
      );

      toast.success("Cantidad actualizada");
      loadProductIngredients(selectedProduct.id);
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast.error(error.message || "Error al actualizar cantidad");
    }
  };

  const handleRemoveIngredient = async (ingredientId: string) => {
    if (!selectedProduct) return;
    if (!confirm("¿Está seguro de eliminar este ingrediente del producto?")) return;

    try {
      await productIngredientsAPI.removeIngredient(accessToken, selectedProduct.id, ingredientId);
      toast.success("Ingrediente eliminado del producto");
      loadProductIngredients(selectedProduct.id);
    } catch (error: any) {
      console.error("Error removing ingredient:", error);
      toast.error(error.message || "Error al eliminar ingrediente");
    }
  };

  const getIngredientDetails = (ingredientId: string) => {
    return ingredients.find(i => i.id === ingredientId);
  };

  const calculateTotalCost = () => {
    return productIngredients.reduce((total, pi) => {
      const ingredient = getIngredientDetails(pi.ingredientId);
      if (ingredient?.costPerUnit) {
        return total + (pi.quantity * ingredient.costPerUnit);
      }
      return total;
    }, 0);
  };

  const availableIngredients = ingredients.filter(
    (ing) => !productIngredients.some((pi) => pi.ingredientId === ing.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                Ingredientes por Producto
              </h1>
              <p className="text-sm text-blue-100 mt-1">
                Configure las recetas y materias primas
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products List */}
            <div className="lg:col-span-1">
              <Card className="p-4 bg-white">
                <h2 className="mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Productos
                </h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No hay productos disponibles</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${selectedProduct?.id === product.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className={selectedProduct?.id === product.id ? "text-white" : "text-gray-900"}>
                              {product.name}
                            </p>
                            <p className={`text-xs ${selectedProduct?.id === product.id ? "text-blue-100" : "text-gray-500"}`}>
                              {product.category || "Sin categoría"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Product Ingredients Configuration */}
            <div className="lg:col-span-2">
              {selectedProduct ? (
                <div className="space-y-4">
                  {/* Product Info Header */}
                  <Card className="p-6 bg-white border-l-4 border-blue-500">
                    <div className="flex items-start gap-4">
                      {selectedProduct.imageUrl && (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h2 className="text-gray-900 mb-1">{selectedProduct.name}</h2>
                        <p className="text-sm text-gray-600 mb-2">{selectedProduct.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Precio: <span className="text-gray-900">${selectedProduct.price}</span>
                          </span>
                          {productIngredients.length > 0 && (
                            <span className="text-gray-600">
                              Costo Materias Primas: <span className="text-green-600">${calculateTotalCost().toFixed(2)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Ingrediente
                      </Button>
                    </div>
                  </Card>

                  {/* Add Ingredient Form */}
                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card className="p-6 bg-white border-2 border-yellow-500">
                          <h3 className="mb-4">Agregar Ingrediente</h3>

                          {availableIngredients.length === 0 ? (
                            <div className="text-center py-8">
                              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-600 mb-2">No hay ingredientes disponibles</p>
                              <p className="text-sm text-gray-500">
                                Todos los ingredientes ya están agregados o no hay ingredientes creados
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm mb-2">Ingrediente</label>
                                <select
                                  value={newIngredient.ingredientId}
                                  onChange={(e) => setNewIngredient({ ...newIngredient, ingredientId: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Seleccione un ingrediente</option>
                                  {availableIngredients.map((ingredient) => (
                                    <option key={ingredient.id} value={ingredient.id}>
                                      {ingredient.name} ({ingredient.currentStock} {ingredient.unit} disponibles)
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm mb-2">
                                  Cantidad por Unidad de Producto
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={newIngredient.quantity}
                                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                  {newIngredient.ingredientId && (
                                    <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                                      {getIngredientDetails(newIngredient.ingredientId)?.unit}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Cantidad de este ingrediente necesaria para fabricar 1 unidad del producto
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={handleAddIngredient}
                                  disabled={saving}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {saving ? "Guardando..." : "Guardar"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowAddForm(false);
                                    setNewIngredient({ ingredientId: "", quantity: 0 });
                                  }}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ingredients List */}
                  <Card className="p-6 bg-white">
                    <h3 className="mb-4">
                      Ingredientes Configurados ({productIngredients.length})
                    </h3>

                    {productIngredients.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-600 mb-2">
                          No hay ingredientes configurados
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                          Este producto aún no tiene ingredientes asignados
                        </p>
                        <Button
                          onClick={() => setShowAddForm(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Ingrediente
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {productIngredients.map((pi) => {
                          const ingredient = getIngredientDetails(pi.ingredientId);
                          if (!ingredient) return null;

                          const canProduce = Math.floor(ingredient.currentStock / pi.quantity);

                          return (
                            <motion.div
                              key={pi.ingredientId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
                              <Card className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <h4 className="text-gray-900 mb-1">{ingredient.name}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span>
                                        Cantidad: {pi.quantity} {ingredient.unit}
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span>
                                        Stock: {ingredient.currentStock} {ingredient.unit}
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className={canProduce < 10 ? "text-yellow-600" : "text-green-600"}>
                                        Puede producir: {canProduce} unidades
                                      </span>
                                      {ingredient.costPerUnit && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <span>
                                            Costo: ${(pi.quantity * ingredient.costPerUnit).toFixed(2)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={pi.quantity}
                                      onChange={(e) => {
                                        const newQty = parseFloat(e.target.value);
                                        if (newQty > 0) {
                                          handleUpdateQuantity(pi.ingredientId, newQty);
                                        }
                                      }}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveIngredient(pi.ingredientId)}
                                      className="text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}

                        {/* Summary */}
                        {productIngredients.length > 0 && (
                          <Card className="p-4 bg-blue-50 border-2 border-blue-200 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">
                                Costo Total de Materias Primas por Unidad:
                              </span>
                              <span className="text-blue-900">
                                ${calculateTotalCost().toFixed(2)}
                              </span>
                            </div>
                            {selectedProduct.price && (
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-300">
                                <span className="text-gray-700">Margen de Ganancia:</span>
                                <span className={`${selectedProduct.price - calculateTotalCost() > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                  }`}>
                                  ${(selectedProduct.price - calculateTotalCost()).toFixed(2)}
                                  ({((((selectedProduct.price - calculateTotalCost()) / selectedProduct.price) * 100) || 0).toFixed(1)}%)
                                </span>
                              </div>
                            )}
                          </Card>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <Card className="p-12 text-center bg-white">
                  <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-600 mb-2">
                    Seleccione un producto
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Elija un producto de la lista para configurar sus ingredientes
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}