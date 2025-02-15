import supabase from '../db/index.js';

class OrderService {
  /**
   * Process structured data from ML model/UiPath
   * @param {Object} data - Structured order data
   * @returns {Promise<Object>} Processing result
   */
  async processOrder(data) {
    try {
      // Validate required fields
      if (!data.email_from || !data.email_subject) {
        throw new Error('Missing required fields');
      }

      // TODO: In future, get user_id from UiPath agent mapping
      // For now, we'll use a test user_id
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';

      // Create order record
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: testUserId,
          email_from: data.email_from,
          email_subject: data.email_subject,
          email_received_at: new Date(),
          order_status: 'processed',
          processed_data: data, // Store full structured data in JSONB
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Order processed successfully',
        order
      };

    } catch (error) {
      console.error('Error processing order:', error);
      
      // If this was a database error, we might want to store the failed order
      try {
        await supabase
          .from('orders')
          .insert({
            user_id: testUserId,
            email_from: data.email_from || 'unknown',
            email_subject: data.email_subject || 'unknown',
            email_received_at: new Date(),
            order_status: 'error',
            error_message: error.message,
            processed_data: data
          });
      } catch (dbError) {
        console.error('Error logging failed order:', dbError);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new OrderService(); 