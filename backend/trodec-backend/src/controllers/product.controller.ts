import { Response, NextFunction } from "express";
import { productService } from "@/services";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/errors";
import { AuthenticatedRequest } from "@/types";
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  CreateProductImageInput,
  UpdateProductImageInput,
  CreateCartItemInput,
  UpdateCartItemInput,
} from "@/schemas";

class ProductController {
  /**
   * POST /products
   * Create a new product (authentication required - brand_admin only)
   */
  async createProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Body is already validated by middleware
      const data = req.body as CreateProductInput;

      const product = await productService.createProduct({
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        stockQuantity: data.stockQuantity,
        status: data.status,
        isFeatured: data.isFeatured,
        brandId: req.user!.id, // brandId is same as profiles.id for brand_admin
        categoryId: data.categoryId,
        metadata: data.metadata,
      });

      sendSuccess(res, product, 201, "Product created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products
   * List products with pagination and filtering (public endpoint)
   */
  async listProducts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Use validated query if available, otherwise fallback to original query
      const query = (req as any).validatedQuery || req.query;
      const typedQuery = query as ListProductsQuery;

      const result = await productService.listProducts({
        brandId: typedQuery.brandId,
        categoryId: typedQuery.categoryId,
        status: typedQuery.status,
        isFeatured:
          typedQuery.isFeatured === "true"
            ? true
            : typedQuery.isFeatured === "false"
              ? false
              : undefined,
        minPrice: typedQuery.minPrice,
        maxPrice: typedQuery.maxPrice,
        inStock:
          typedQuery.inStock === "true"
            ? true
            : typedQuery.inStock === "false"
              ? false
              : undefined,
        page: typedQuery.page,
        limit: typedQuery.limit,
        search: typedQuery.search,
        sortBy: typedQuery.sortBy,
        sortOrder: typedQuery.sortOrder,
        communityIds: typedQuery.communityIds
          ? typedQuery.communityIds.split(",").map((id: string) => id.trim()).filter(Boolean)
          : undefined,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/:id
   * Get product by ID (public endpoint)
   */
  async getProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Array.isArray(id) ? id[0] : id;

      const product = await productService.getProduct(productId);

      if (!product) {
        throw ApiError.notFound("Product not found");
      }

      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/:id/images
   * Get product with images (public endpoint)
   */
  async getProductWithImages(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Array.isArray(id) ? id[0] : id;

      const product = await productService.getProductWithImages(productId);

      if (!product) {
        throw ApiError.notFound("Product not found");
      }

      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/slug/:slug
   * Get product by slug (public endpoint)
   */
  async getProductBySlug(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const productSlug = Array.isArray(slug) ? slug[0] : slug;

      const product = await productService.getProductBySlug(productSlug);

      if (!product) {
        throw ApiError.notFound("Product not found");
      }

      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /products/:id
   * Update product (authentication and authorization required - brand owner only)
   */
  async updateProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Array.isArray(id) ? id[0] : id;
      const data = req.body as UpdateProductInput;

      const product = await productService.updateProduct(productId, data);

      sendSuccess(res, product, 200, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/:id
   * Delete product (soft delete - authentication and authorization required - brand owner only)
   */
  async deleteProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Array.isArray(id) ? id[0] : id;

      await productService.deleteProduct(productId);

      sendSuccess(res, null, 200, "Product deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // PRODUCT IMAGES
  // ============================================

  /**
   * GET /products/:id/images
   * Get product images (public endpoint)
   */
  async getProductImages(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Array.isArray(id) ? id[0] : id;

      const images = await productService.getProductImages(productId);

      sendSuccess(res, { data: images });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /products/:id/images
   * Add product image (authentication and authorization required - brand owner only)
   */
  async addProductImage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Array.isArray(id) ? id[0] : id;
      const data = req.body as CreateProductImageInput;

      const image = await productService.addProductImage({
        productId,
        imageUrl: data.imageUrl,
        altText: data.altText,
        isPrimary: data.isPrimary,
        displayOrder: data.displayOrder,
      });

      sendSuccess(res, image, 201, "Product image added successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /products/:productId/images/:imageId
   * Update product image (authentication and authorization required - brand owner only)
   */
  async updateProductImage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { imageId } = req.params;
      const productImageId = Array.isArray(imageId) ? imageId[0] : imageId;
      const data = req.body as UpdateProductImageInput;

      const image = await productService.updateProductImage(
        productImageId,
        data,
      );

      sendSuccess(res, image, 200, "Product image updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/:productId/images/:imageId
   * Delete product image (authentication and authorization required - brand owner only)
   */
  async deleteProductImage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { imageId } = req.params;
      const productImageId = Array.isArray(imageId) ? imageId[0] : imageId;

      await productService.deleteProductImage(productImageId);

      sendSuccess(res, null, 200, "Product image deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // CART OPERATIONS
  // ============================================

  /**
   * POST /cart/items
   * Add item to cart (authentication required)
   */
  async addToCart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = req.body as CreateCartItemInput;

      const cartItem = await productService.addToCart(
        req.user!.id,
        data.productId,
        data.quantity,
        data.selectedSize ?? null,
      );

      sendSuccess(res, cartItem, 201, "Item added to cart successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /cart/items
   * Get user's cart items (authentication required)
   */
  async getCartItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const cartItems = await productService.getCartItems(req.user!.id);

      sendSuccess(res, cartItems);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /cart/items/:productId
   * Update cart item quantity (authentication required)
   */
  async updateCartItemQuantity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const cartProductId = Array.isArray(productId) ? productId[0] : productId;
      const data = req.body as UpdateCartItemInput;

      const cartItem = await productService.updateCartItemQuantity(
        req.user!.id,
        cartProductId,
        data.quantity,
        data.selectedSize ?? null,
      );

      sendSuccess(res, cartItem, 200, "Cart item updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cart/items/:productId
   * Remove item from cart (authentication required)
   * Accepts optional selectedSize as query param: ?selectedSize=M
   */
  async removeFromCart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const cartProductId = Array.isArray(productId) ? productId[0] : productId;
      const selectedSize = req.query.selectedSize
        ? String(req.query.selectedSize)
        : null;

      await productService.removeFromCart(req.user!.id, cartProductId, selectedSize);

      sendSuccess(res, null, 200, "Item removed from cart successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cart/items
   * Clear user's cart (authentication required)
   */
  async clearCart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await productService.clearCart(req.user!.id);

      sendSuccess(res, null, 200, "Cart cleared successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
