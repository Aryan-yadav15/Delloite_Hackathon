'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase'
import { useManufacturer } from '@/hooks/useManufacturer'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckIcon, SearchIcon, FileText, RefreshCcw } from 'lucide-react'
import { toast } from "sonner"

export default function OrdersPage() {
  const supabase = useSupabase()
  const { manufacturer } = useManufacturer()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [downloadingBulk, setDownloadingBulk] = useState(false)
  
  // Fetch orders based on filters
  const fetchOrders = async () => {
    if (!manufacturer?.id) return
    
    setLoading(true)
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          retailers (business_name, contact_name)
        `)
        .eq('manufacturer_id', manufacturer.id)
        .order('created_at', { ascending: false })
      
      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('processing_status', statusFilter)
      }
      
      // Apply search filter if present
      if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,retailers.business_name.ilike.%${searchQuery}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }
  
  // Initial data load
  useEffect(() => {
    if (manufacturer?.id) {
      fetchOrders()
    }
  }, [manufacturer, statusFilter])
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrders()
  }
  
  // Bulk download selected invoices
  const bulkDownloadInvoices = async () => {
    if (!manufacturer?.id || orders.length === 0) {
      toast.error("No orders available")
      return
    }
    
    // For this example, we'll just download the most recent order's invoice
    // In a real implementation, you might want to add checkboxes to select orders
    // or download a ZIP file with multiple invoices
    const mostRecentOrder = orders[0]
    
    try {
      setDownloadingBulk(true)
      const response = await fetch(`/api/invoices/${mostRecentOrder.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: mostRecentOrder.id,
          manufacturerId: manufacturer.id
        }),
      })
      
      if (response.ok) {
        // Create a URL for the blob
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        // Create a link and trigger download
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${mostRecentOrder.order_number || mostRecentOrder.id}.txt`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success("Invoice downloaded successfully")
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        toast.error(errorData.error || "Failed to download invoice")
      }
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast.error("Failed to download invoice")
    } finally {
      setDownloadingBulk(false)
    }
  }
  
  return (
    <div className="container ml-20 py-10">
      <div className="mb-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              variant="default"
              onClick={bulkDownloadInvoices}
              disabled={downloadingBulk || orders.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              {downloadingBulk ? "Downloading..." : "Download Latest Invoice"}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="search">Search Orders</Label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                id="search"
                placeholder="Search by order number or retailer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
          
          <div className="w-[200px] space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <OrdersTable data={orders} isLoading={loading} />
    </div>
  )
} 