'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, XMarkIcon, ClockIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function TicketModal({ isOpen, onClose, ticket, refreshTickets }) {
  const [processing, setProcessing] = useState(false)
  const [resolution, setResolution] = useState("")
  const [showFullEmail, setShowFullEmail] = useState(false)
  const [products, setProducts] = useState({})
  const supabase = useSupabase()

  useEffect(() => {
    if (ticket && ticket.items) {
      const fetchProducts = async () => {
        const productIds = ticket.items
          .map(item => item.product_id)
          .filter(Boolean)
        
        if (productIds.length > 0) {
          const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds)
          
          if (!error && data) {
            const productMap = {}
            data.forEach(product => {
              productMap[product.id] = product
            })
            setProducts(productMap)
          } else {
            console.error('Error fetching products:', error)
          }
        }
      }
      
      fetchProducts()
    }
  }, [ticket, supabase])

  if (!ticket) return null

  const handleResolveTicket = async (status) => {
    setProcessing(true)

    try {
      // Update the order with the resolution status
      const { error } = await supabase
        .from('orders')
        .update({
          special_request_status: status,
          special_request_resolution: resolution,
          special_request_resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (error) throw error

      toast.success(`Ticket ${status === 'approved' ? 'approved' : 'declined'} successfully`)
      if (refreshTickets) refreshTickets()
      onClose()
    } catch (error) {
      console.error('Error resolving ticket:', error)
      toast.error('Failed to update ticket status')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Special Request Ticket</DialogTitle>
            <Badge 
              variant="outline" 
              className="bg-yellow-100 text-yellow-800 border-yellow-200"
            >
              <ClockIcon className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          </div>
          <DialogDescription>
            Order #{ticket.order_number} from {ticket.retailer?.business_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 p-1">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Request Details</h3>
            <p className="mt-1 text-sm">{ticket.special_request_details || "No details provided"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
            <div className="max-h-60 overflow-y-auto  px-2 rounded-lg mt-4">
              {ticket.items && ticket.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    {products[item.product_id]?.name || `Product #${item.product_id || 'Unknown'}`}
                  </div>
                  <div>Qty: {item.quantity}</div>
                </div>
              ))}
            </div>
          </div>
          
          {ticket.email_body && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Original Email</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFullEmail(!showFullEmail)}
                  className="h-6 text-xs"
                >
                  {showFullEmail ? "Show Less" : "Show Full Email"}
                </Button>
              </div>
              <div className={`mt-2 bg-blue-50 p-3 rounded text-sm ${!showFullEmail ? "max-h-24 overflow-hidden relative" : ""}`}>
                {!showFullEmail && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-blue-50 to-transparent"></div>
                )}
                <pre className="whitespace-pre-wrap font-sans">
                  {ticket.email_body}
                </pre>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Resolution Notes</h3>
            <Textarea 
              className="mt-1"
              placeholder="Enter any notes about your decision..." 
              value={resolution}
              onChange={e => setResolution(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-0 mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={processing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleResolveTicket('declined')}
            disabled={processing}
            className="flex-1"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button
            variant="default"
            onClick={() => handleResolveTicket('approved')}
            disabled={processing}
            className="flex-1"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 