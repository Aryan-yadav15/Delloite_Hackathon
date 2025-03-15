import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Eye, DownloadCloud, Download } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useManufacturer } from "@/hooks/useManufacturer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function OrdersTable({ data = [], isLoading }) {
  const router = useRouter()
  const { manufacturer } = useManufacturer()
  const [downloadingId, setDownloadingId] = useState(null)

  const viewOrderDetails = (orderId) => {
    router.push(`/orders/${orderId}`)
  }

  const handleDownloadInvoice = async (order) => {
    if (!manufacturer?.id) {
      toast.error("User information not available")
      return
    }

    try {
      setDownloadingId(order.id)
      const response = await fetch(`/api/invoices/${order.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: order.id,
          manufacturerId: manufacturer.id 
        }),
      })
      
      if (response.ok) {
        // Create a URL for the blob (PDF blob now)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        // Create a link and trigger download (filename will be .pdf now)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${order.order_number || order.id}.pdf` // Download as PDF
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success("Invoice downloaded successfully")
      } else {
        try {
          const errorData = await response.json()
          console.error("Error response:", errorData)
          toast.error(errorData.error || "Failed to download invoice")
        } catch (jsonError) {
          // Handle cases where response is not JSON (e.g., HTML error page)
          console.error("Non-JSON error response:", response.statusText)
          toast.error("Failed to download invoice. Server error.")
        }
      }
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast.error("Failed to download invoice")
    } finally {
      setDownloadingId(null)
    }
  }

  // Create columns for the data table
  const columns = [
    {
      id: "order_number",
      header: "Order #",
      cell: ({ row }) => {
        const order = row.original
        return <div className="font-medium">{order.order_number || `#${order.id}`}</div>
      },
    },
    {
      id: "retailer",
      header: "Retailer",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-medium">{order.retailers?.business_name || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">{order.retailers?.contact_name}</div>
          </div>
        )
      },
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        const order = row.original
        return order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy') : 'N/A'
      },
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const order = row.original
        return <div className="font-medium">${order.total_amount?.toFixed(2) || '0.00'}</div>
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const order = row.original
        const statusMap = {
          'pending': { label: 'Pending', variant: 'outline' },
          'processing': { label: 'Processing', variant: 'default' },
          'validated': { label: 'Validated', variant: 'success' },
          'invalid': { label: 'Invalid', variant: 'destructive' },
          'error': { label: 'Error', variant: 'destructive' },
        }
        
        const { label, variant } = statusMap[order.processing_status] || { label: order.processing_status, variant: 'outline' }
        
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      id: "download",
      header: "Invoice",
      cell: ({ row }) => {
        const order = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadInvoice(order)}
            disabled={downloadingId === order.id}
            className="flex items-center gap-1"
          >
            {downloadingId === order.id ? (
              <>
                <DownloadCloud className="h-4 w-4 animate-pulse" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download</span>
              </>
            )}
          </Button>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => viewOrderDetails(order.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDownloadInvoice(order)}
                  disabled={downloadingId === order.id}
                >
                  {downloadingId === order.id ? (
                    <>
                      <DownloadCloud className="mr-2 h-4 w-4 animate-pulse" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Download Invoice
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full border rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Orders Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          There are no orders matching your criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.id === 'actions' ? 'text-right' : undefined}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              {columns.map((column) => (
                <TableCell key={`${order.id}-${column.id}`}>
                  {column.cell({ row: { original: order } })}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}