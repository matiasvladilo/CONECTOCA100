import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Save, Trash2, Package, AlertTriangle, TrendingDown, TrendingUp, Edit2, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ingredientsAPI, type Ingredient as APIIngredient } from "../utils/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface IngredientManagementProps {
  onBack: () => void;
  accessToken: string;
}

export function IngredientManagement({ onBack, accessToken }: IngredientManagementProps) {
  const [ingredients, setIngredients] = useState<APIIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Usamos strings para los campos numéricos durante la edición
  const [formData, setFormData] = useState<{
    name: string;
    unit: string;
    currentStock: string;
    minStock: string;
    maxStock: string;
    costPerUnit: string;
    supplier: string;
  }>({
    name: "",
    unit: "kg",
    currentStock: "",
    minStock: "",
    maxStock: "",
    costPerUnit: "",
    supplier: "",
  });

  useEffect(() => {
    console.log("IngredientManagement: Component mounted");
    console.log("Access Token:", accessToken ? "Present" : "Missing");
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      console.log("Loading ingredients...");
      setLoading(true);
      const data = await ingredientsAPI.getAll(accessToken);
      console.log("Ingredients loaded:", data);
      setIngredients(data);
    } catch (error: any) {
      console.error("Error loading ingredients:", error);
      toast.error(error.message || "Error al cargar materias primas");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.unit || !formData.currentStock || !formData.minStock) {
        toast.error("Complete los campos obligatorios");
        return;
      }

      const numericFormData = {
        name: formData.name,
        unit: formData.unit,
        currentStock: parseFloat(formData.currentStock),
        minStock: parseFloat(formData.minStock),
        maxStock: formData.maxStock ? parseFloat(formData.maxStock) : undefined,
        costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : undefined,
        supplier: formData.supplier,
      };

      if (editingId) {
        await ingredientsAPI.update(accessToken, editingId, numericFormData);
        toast.success("Materia prima actualizada");
      } else {
        await ingredientsAPI.create(accessToken, numericFormData);
        toast.success("Materia prima creada");
      }

      setEditingId(null);
      setShowNewForm(false);
      setFormData({
        name: "",
        unit: "kg",
        currentStock: "",
        minStock: "",
        maxStock: "",
        costPerUnit: "",
        supplier: "",
      });
      loadIngredients();
    } catch (error: any) {
      console.error("Error saving ingredient:", error);
      toast.error(error.message || "Error al guardar materia prima");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta materia prima?")) return;

    try {
      await ingredientsAPI.delete(accessToken, id);
      toast.success("Materia prima eliminada");
      loadIngredients();
    } catch (error: any) {
      console.error("Error deleting ingredient:", error);
      toast.error(error.message || "Error al eliminar materia prima");
    }
  };

  const handleEdit = (ingredient: APIIngredient) => {
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock.toString(),
      minStock: ingredient.minStock.toString(),
      maxStock: ingredient.maxStock ? ingredient.maxStock.toString() : "",
      costPerUnit: ingredient.costPerUnit ? ingredient.costPerUnit.toString() : "",
      supplier: ingredient.supplier || "",
    });
    setEditingId(ingredient.id);
    setShowNewForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNewForm(false);
    setFormData({
      name: "",
      unit: "kg",
      currentStock: "",
      minStock: "",
      maxStock: "",
      costPerUnit: "",
      supplier: "",
    });
  };

  const getStockStatus = (ingredient: APIIngredient) => {
    const percentage = (ingredient.currentStock / ingredient.minStock) * 100;

    if (ingredient.currentStock === 0) {
      return { status: "sin-stock", label: "Sin Stock", color: "bg-red-600" };
    } else if (ingredient.currentStock < ingredient.minStock) {
      return { status: "bajo", label: "Stock Bajo", color: "bg-yellow-500" };
    } else if (ingredient.maxStock && ingredient.currentStock > ingredient.maxStock) {
      return { status: "exceso", label: "Exceso", color: "bg-purple-500" };
    } else {
      return { status: "normal", label: "Normal", color: "bg-green-500" };
    }
  };

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
                <Package className="w-6 h-6" />
                Stock de Materia Prima
              </h1>
              <p className="text-sm text-blue-100 mt-1">
                Gestión de inventario y materiales
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Materia Prima
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl mt-1">{ingredients.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl mt-1">
                  {ingredients.filter(i => i.currentStock === 0).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl mt-1">
                  {ingredients.filter(i => i.currentStock > 0 && i.currentStock < i.minStock).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Normal</p>
                <p className="text-2xl mt-1">
                  {ingredients.filter(i => i.currentStock >= i.minStock && (!i.maxStock || i.currentStock <= i.maxStock)).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* New/Edit Form */}
        <AnimatePresence>
          {(showNewForm || editingId) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6 bg-white shadow-lg border-2 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    {editingId ? "Editar Materia Prima" : "Nueva Materia Prima"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Harina de trigo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Unidad de Medida <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="g">Gramos (g)</option>
                      <option value="l">Litros (l)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="unidades">Unidades</option>
                      <option value="bolsas">Bolsas</option>
                      <option value="cajas">Cajas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Stock Actual <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Stock Mínimo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Stock Máximo (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maxStock}
                      onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Costo por Unidad (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">
                      Proveedor (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ingredients List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando materias primas...</p>
          </div>
        ) : ingredients.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 mb-2">No hay materias primas registradas</h3>
            <p className="text-gray-500 text-sm mb-6">
              Comienza agregando tu primera materia prima
            </p>
            <Button
              onClick={() => setShowNewForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Materia Prima
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ingredient) => {
              const stockStatus = getStockStatus(ingredient);
              return (
                <motion.div
                  key={ingredient.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-4 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{ingredient.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(ingredient)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ingredient.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stock Actual:</span>
                        <span className="text-gray-900">
                          {ingredient.currentStock} {ingredient.unit}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Stock Mínimo:</span>
                        <span className="text-gray-900">
                          {ingredient.minStock} {ingredient.unit}
                        </span>
                      </div>

                      {ingredient.maxStock && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Stock Máximo:</span>
                          <span className="text-gray-900">
                            {ingredient.maxStock} {ingredient.unit}
                          </span>
                        </div>
                      )}

                      {ingredient.costPerUnit && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Costo/Unidad:</span>
                          <span className="text-gray-900">
                            ${ingredient.costPerUnit.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {ingredient.supplier && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Proveedor:</span>
                          <span className="text-gray-900 truncate max-w-[150px]">
                            {ingredient.supplier}
                          </span>
                        </div>
                      )}

                      {/* Stock Progress Bar */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>0</span>
                          <span>Mín: {ingredient.minStock}</span>
                          {ingredient.maxStock && <span>Máx: {ingredient.maxStock}</span>}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${stockStatus.color} transition-all duration-300`}
                            style={{
                              width: `${Math.min(100, (ingredient.currentStock / (ingredient.maxStock || ingredient.minStock * 2)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}