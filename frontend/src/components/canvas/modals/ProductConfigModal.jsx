'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"
import { useSupabase } from "@/lib/supabase"
import { useManufacturer } from "@/hooks/useManufacturer"

export default function ProductConfigModal({ isOpen, onClose, onSave }) {
  const supabase = useSupabase()
  const { manufacturer } = useManufacturer()
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: '',
    manufacturer_id: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch existing products for this manufacturer
  useEffect(() => {
    const fetchProducts = async () => {
      if (!manufacturer?.id) return
      
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('manufacturer_id', manufacturer.id)
          .order('name')

        if (error) throw error
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && manufacturer?.id) {
      fetchProducts()
    }
  }, [isOpen, manufacturer?.id])

  const handleAddProduct = async () => {
    if (!manufacturer?.id) {
      setError('No manufacturer ID found. Please ensure you are logged in.')
      return
    }

    try {
      const productToAdd = {
        ...newProduct,
        manufacturer_id: manufacturer.id
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productToAdd])
        .select()
        .single()

      if (error) throw error

      setProducts([...products, data])
      setNewProduct({
        name: '',
        sku: '',
        price: '',
        manufacturer_id: manufacturer.id
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = () => {
    onSave({
      products,
      configured: true
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Product Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Add new product form */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({
                ...prev,
                name: e.target.value
              }))}
            />
            <Input
              placeholder="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct(prev => ({
                ...prev,
                sku: e.target.value
              }))}
            />
            <Input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({
                ...prev,
                price: e.target.value
              }))}
            />
          </div>
          
          <Button 
            onClick={handleAddProduct}
            disabled={!newProduct.name || !newProduct.sku || !newProduct.price}
          >
            Add Product
          </Button>

          {/* Product list */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Product List</h3>
            {loading ? (
              <div>Loading products...</div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${product.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="w-full">
              Save Configuration
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 