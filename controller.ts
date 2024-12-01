import { Collection } from "mongodb";
import { UserModel, CartModel, ProductModel, CartProductModel, CartProduct } from "./types.ts"
import type { User, Cart, Product } from "./types.ts";


export const fromModelToUser = (model: UserModel): User => ({
  id: model._id!.toString(),
  name: model.name,
  email: model.email,
  password: model.password

});

export const fromModelToProduct = (model: ProductModel): Product => ({
    id: model._id!.toString(),
    name: model.name,
    description: model.description,
    price: model.price,
    stock: model.stock    
});

export const fromModelToCartPrduct = (model: CartProductModel): CartProduct => ({
    productId: model.productId.toString(),
    quantity: model.quantity
});

// Devuelve el carrito del usuario especificado. Incluye productos con su cantidad, nombre y precio total.
export const fromModelToCart = async (model: CartModel, productCollection: Collection<ProductModel>): Promise<Cart> => {
    const products = await Promise.all(model.products.map(async (cartProduct) => {
        const product = await productCollection.findOne({ _id: cartProduct.productId });
        if (!product) {
            throw new Error(`Producto con ID ${cartProduct.productId} no encontrado`);
        }
        return {
            product: fromModelToProduct(product),
            quantity: cartProduct.quantity,
            total: product.price * cartProduct.quantity
        };
    }));
    return {
        id: model._id.toString(),
        userId: model.userId.toString(),
        products: products
    };
};