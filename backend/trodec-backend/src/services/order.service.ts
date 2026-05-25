import { supabaseAdmin } from "../config";
import { ApiError } from "../utils";
import { logger } from "../utils/logger";
import { productService } from "./product.service";
import { logisticsService, shiprocketClient } from "./logistics.service";
import { commissionService } from "./commission.service";
import { brandService } from "./brand.service";

async function resolveBrandPickupLocation(brandId: string): Promise<{ fromAddress: Record<string, unknown>; pickupLocation: string }> {
  const { data: addr } = await supabaseAdmin
    .from("addresses")
    .select("full_name, phone_number, address_line1, address_line2, city, state, postal_code, country")
    .eq("user_id", brandId)
    .eq("is_default_shipping", true)
    .maybeSingle();

  if (!addr) {
    logger.warn("Brand has no default address, falling back to Primary pickup", { brandId });
    return { fromAddress: { name: "Trodec Warehouse", city: "Mumbai", country: "India" }, pickupLocation: "Primary" };
  }

  const fromAddress = {
    name: (addr as any).full_name,
    phone: (addr as any).phone_number,
    line1: (addr as any).address_line1,
    line2: (addr as any).address_line2 ?? "",
    city: (addr as any).city,
    state: (addr as any).state,
    postalCode: (addr as any).postal_code,
    country: (addr as any).country,
  };

  // Ensure pickup location is registered in Shiprocket before creating the order.
  // This is idempotent — safe to call even if already registered.
  await brandService.syncPickupLocation(brandId);

  const pickupLocation = await shiprocketClient.getBrandPickupLocation(brandId);
  return { fromAddress, pickupLocation };
}

// ---------------------------------------------------------------------------
// Types — aligned with actual DB schema
// ---------------------------------------------------------------------------

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  // Denormalized shipping address (stored inline in orders table)
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes: string | null;
  // Post-based commission attribution
  sourcePostId: string | null;
  expertId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRow {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string | null;
  source_post_id: string | null;
  expert_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  brandId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  selectedSize: string | null;
  createdAt: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  brand_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  selected_size: string | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    orderNumber: row.order_number,
    status: row.status,
    subtotal: row.subtotal,
    tax: row.tax_amount,
    shippingCost: row.shipping_amount,
    total: row.total,
    shippingName: row.shipping_name,
    shippingPhone: row.shipping_phone,
    shippingAddressLine1: row.shipping_address_line1,
    shippingAddressLine2: row.shipping_address_line2,
    shippingCity: row.shipping_city,
    shippingState: row.shipping_state,
    shippingPostalCode: row.shipping_postal_code,
    shippingCountry: row.shipping_country,
    notes: row.notes,
    sourcePostId: row.source_post_id ?? null,
    expertId: row.expert_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    brandId: row.brand_id,
    productName: row.product_name,
    productPrice: row.product_price,
    quantity: row.quantity,
    subtotal: row.subtotal,
    selectedSize: row.selected_size ?? null,
    createdAt: row.created_at,
  };
}

interface CartItemInput {
  productId: string;
  quantity: number;
  selectedSize?: string | null;
}

interface CreateOrderData {
  userId: string;
  shippingAddressId: string;
  billingAddressId: string;
  notes?: string | null;
  // Cart items passed directly from frontend (localStorage cart)
  items?: CartItemInput[];
  // Post-based commission attribution
  sourcePostId?: string | null;
}

interface UpdateOrderData {
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string | null;
}

class OrderService {
  /**
   * Create order from user's cart.
   * Fetches the shipping address to denormalize it into the order row.
   */
  async createOrderFromCart(data: CreateOrderData): Promise<OrderWithItems> {
    const { userId, shippingAddressId, notes, items: inputItems, sourcePostId } = data;

    // If ordering from a post, resolve the expert who authored it
    // and verify the consumer is a member of that post's community
    let attributedExpertId: string | null = null;
    if (sourcePostId) {
      const { data: postRow } = await supabaseAdmin
        .from("posts")
        .select("expert_id, community_id")
        .eq("id", sourcePostId)
        .single();

      if (!postRow) {
        throw ApiError.badRequest("Source post not found");
      }

      attributedExpertId = postRow.expert_id ?? null;

      // Consumer must be a member of the community the post belongs to
      const { data: membership } = await supabaseAdmin
        .from("community_members")
        .select("id")
        .eq("community_id", postRow.community_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!membership) {
        throw ApiError.forbidden("You must join this community before ordering from its reviews");
      }
    }

    // Fetch shipping address to denormalize into order
    const { data: addrRow, error: addrError } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("id", shippingAddressId)
      .eq("user_id", userId)
      .single();

    if (addrError || !addrRow) {
      throw ApiError.badRequest("Shipping address not found");
    }

    // Resolve cart items — prefer items passed from frontend (localStorage cart),
    // fall back to Supabase cart_items table
    let resolvedItems: CartItemInput[];
    if (inputItems && inputItems.length > 0) {
      resolvedItems = inputItems;
    } else {
      const dbCart = await productService.getCartItems(userId);
      if (dbCart.length === 0) throw ApiError.badRequest("Cart is empty");
      resolvedItems = dbCart.map((c) => ({ productId: c.productId, quantity: c.quantity, selectedSize: c.selectedSize }));
    }

    // Validate each product and build order items
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      brand_id: string;
      product_name: string;
      product_image_url: string | null;
      product_price: number;
      quantity: number;
      subtotal: number;
      selected_size: string | null;
    }> = [];

    for (const item of resolvedItems) {
      const product = await productService.getProduct(item.productId);
      if (!product) throw ApiError.badRequest(`Product ${item.productId} not found`);
      if (product.status !== "active") throw ApiError.badRequest(`Product ${product.name} is not available`);
      if (product.stockQuantity < item.quantity) throw ApiError.badRequest(`Insufficient stock for ${product.name}`);

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        brand_id: product.brandId,
        product_name: product.name,
        product_image_url: null,
        product_price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        selected_size: item.selectedSize ?? null,
      });
    }

    const taxAmount = subtotal * 0.08;
    const shippingAmount = 0;
    const total = subtotal + taxAmount + shippingAmount;

    try {
      // 1. Create order with denormalized shipping address
      const { data: orderRow, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          status: "pending",
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total,
          shipping_name: addrRow.full_name,
          shipping_phone: addrRow.phone_number ?? addrRow.phone,
          shipping_address_line1: addrRow.address_line1,
          shipping_address_line2: addrRow.address_line2 ?? null,
          shipping_city: addrRow.city,
          shipping_state: addrRow.state,
          shipping_postal_code: addrRow.postal_code,
          shipping_country: addrRow.country,
          notes: notes ?? null,
          source_post_id: sourcePostId ?? null,
          expert_id: attributedExpertId,
        })
        .select()
        .single();

      if (orderError) {
        logger.error("Failed to create order", { error: orderError.message });
        throw ApiError.internal("Failed to create order");
      }

      const order = toOrder(orderRow as OrderRow);

      // 2. Create order items
      const orderItemsWithId = orderItems.map((item) => ({ ...item, order_id: order.id }));

      const { data: itemsData, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItemsWithId)
        .select();

      if (itemsError) {
        await supabaseAdmin.from("orders").delete().eq("id", order.id);
        logger.error("Failed to create order items", { error: itemsError.message });
        throw ApiError.internal("Failed to create order items");
      }

      // 3. Update product stock for each ordered item
      for (const item of orderItems) {
        const product = await productService.getProduct(item.product_id);
        if (product) {
          await supabaseAdmin
            .from("products")
            .update({ stock_quantity: product.stockQuantity - item.quantity })
            .eq("id", item.product_id);
        }
      }

      // 4. Clear Supabase cart (no-op if frontend used localStorage cart)
      await productService.clearCart(userId);

      return {
        ...order,
        items: itemsData?.map((row) => toOrderItem(row as OrderItemRow)) || [],
      };
    } catch (error) {
      logger.error("Failed to create order from cart", { error, userId });
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string, userId?: string): Promise<OrderWithItems | null> {
    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId);

    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") return null;
      logger.error("Failed to fetch order", { error: error.message, orderId });
      throw ApiError.internal("Failed to fetch order");
    }

    return {
      ...toOrder(data as OrderRow),
      items: data.order_items?.map((item: OrderItemRow) => toOrderItem(item)) || [],
    };
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string, userId?: string): Promise<OrderWithItems | null> {
    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber);

    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") return null;
      logger.error("Failed to fetch order by number", { error: error.message, orderNumber });
      throw ApiError.internal("Failed to fetch order");
    }

    return {
      ...toOrder(data as OrderRow),
      items: data.order_items?.map((item: OrderItemRow) => toOrderItem(item)) || [],
    };
  }

  /**
   * Get user orders (paginated)
   */
  async getUserOrders(
    userId: string,
    options: { page?: number; limit?: number; status?: string } = {}
  ) {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .eq("user_id", userId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;

    if (error) {
      logger.error("Failed to fetch user orders", { error: error.message, userId });
      throw ApiError.internal("Failed to fetch orders");
    }

    return {
      data: data?.map((row: any) => ({
        ...toOrder(row as OrderRow),
        items: row.order_items?.map((item: OrderItemRow) => toOrderItem(item)) || [],
      })) || [],
      pagination: { page, limit, total: count || 0 },
    };
  }

  /**
   * Update order status.
   * Hooks: DELIVERED → commission; CANCELLED → reverse commission + return shipment; CONFIRMED → forward shipment
   */
  async updateOrderStatus(
    orderId: string,
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled",
    userId?: string
  ): Promise<Order> {
    let query = supabaseAdmin.from("orders").update({ status }).eq("id", orderId);
    if (userId) query = query.eq("user_id", userId);

    const { data: orderRow, error } = await query.select().single();

    if (error) {
      if (error.code === "PGRST116") throw ApiError.notFound("Order not found");
      logger.error("Failed to update order status", { error: error.message, orderId, status });
      throw ApiError.internal("Failed to update order status");
    }

    const order = toOrder(orderRow as OrderRow);

    if (status === "delivered") {
      commissionService.calculateAndStore(orderId, order.total, order.expertId).catch((err) =>
        logger.error("Commission calculation failed", { orderId, err })
      );
    }

    if (status === "cancelled") {
      commissionService.reverse(orderId).catch((err) =>
        logger.error("Commission reversal failed", { orderId, err })
      );
      logisticsService.cancelOrderShipment(orderId).catch((err) =>
        logger.error("Shiprocket order cancellation failed", { orderId, err })
      );
    }

    if (status === "confirmed") {
      const toAddress = {
        name: orderRow.shipping_name,
        phone: orderRow.shipping_phone,
        line1: orderRow.shipping_address_line1,
        city: orderRow.shipping_city,
        state: orderRow.shipping_state,
        postalCode: orderRow.shipping_postal_code,
        country: orderRow.shipping_country,
      };
      (async () => {
        logger.info("Starting Shiprocket forward shipment", { orderId });
        const { data: item } = await supabaseAdmin
          .from("order_items")
          .select("brand_id")
          .eq("order_id", orderId)
          .limit(1)
          .maybeSingle();
        logger.info("Resolved brand for shipment", { orderId, brandId: item?.brand_id ?? "none" });
        const { fromAddress, pickupLocation } = await resolveBrandPickupLocation(item?.brand_id ?? "");
        logger.info("Calling createForwardShipment", { orderId, pickupLocation });
        await logisticsService.createForwardShipment({ orderId, fromAddress, toAddress, pickupLocation });
        logger.info("Shiprocket shipment created successfully", { orderId });
      })().catch((err) => logger.error("SHIPROCKET FAILED — forward shipment not created", {
        orderId,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }));
    }

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.getOrder(orderId, userId);
    if (!order) throw ApiError.notFound("Order not found");
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      throw ApiError.badRequest(`Cannot cancel order with status: ${order.status}`);
    }
    return this.updateOrderStatus(orderId, "cancelled", userId);
  }

  /**
   * Update order (general)
   */
  async updateOrder(orderId: string, data: UpdateOrderData, userId?: string): Promise<Order> {
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (Object.keys(updateData).length === 0) throw ApiError.badRequest("No fields to update");

    let query = supabaseAdmin.from("orders").update(updateData).eq("id", orderId);
    if (userId) query = query.eq("user_id", userId);

    const { data: orderRow, error } = await query.select().single();

    if (error) {
      if (error.code === "PGRST116") throw ApiError.notFound("Order not found");
      logger.error("Failed to update order", { error: error.message, orderId });
      throw ApiError.internal("Failed to update order");
    }

    return toOrder(orderRow as OrderRow);
  }
}

export const orderService = new OrderService();
