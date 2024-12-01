import { ObjectId } from "mongodb";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
};

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;

};

export type Order = {
    id: string;
    userId: User;
    products: Product[];
    total: number;
    fecha: Date;
};

export type UserModel = {
    _id?: ObjectId;
    name: string;
    email: string;
    password: string;
};

export type ProductModel = {
    _id?: ObjectId;
    name: string;
    description: string;
    price: number;
    stock: number;
};

export type OrderModel = {
    id: ObjectId;
    userId: UserModel;
    products: ProductModel[];
    total: number;
    fecha: Date;
};

export type Cart = {
    id: string;
    userId: User;
    products: CartProduct[];
};

export type CartModel = {
    _id: ObjectId;
    userId: ObjectId;
    products: CartProduct[];
};

export type CartProduct = {
    productId: string;
    quantity: number;
};

export type CartProductModel = {
    productId: ObjectId;
    quantity: number;
};
