import { MongoClient, ObjectId } from "mongodb"
import { UserModel, CartModel, ProductModel, OrderModel } from "./types.ts"
import { fromModelToUser, fromModelToProduct, fromModelToCart } from "./controller.ts"

//fromModelToCart, fromModelToProduct, fromModelToOrder 

const MONGO_URL = Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  console.error("MONGO no conectado")
  Deno.exit(1)
}

const client = new MongoClient(MONGO_URL)
await client.connect()

console.log("Conectado a mongo")

const db = client.db("Supermarket");
const userCollection = db.collection<UserModel>("user");
const cartCollection = db.collection<CartModel>("cart");
const orderCollection = db.collection<OrderModel>("order");
const productCollection = db.collection<ProductModel>("product");


const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if (method === "GET") {
    if (path === "/users") {
      
      const usersAll = await userCollection.find().toArray();
      const misUsers = usersAll.map((todosUsuarios) => fromModelToUser(todosUsuarios));
      
      return new Response(JSON.stringify(misUsers));

    }else if (path === "/products") {
        
      const productsAll = await productCollection.find().toArray();
      const misProducts = productsAll.map((todosProductos) => fromModelToProduct(todosProductos));
      
      return new Response(JSON.stringify(misProducts));
    
    } else if (path === "/carts") {

      const id = path.split("/").pop();
      if (!id) return new Response("El id no es correcto", { status: 400 });

      const cart = await cartCollection.findOne({ _id: new ObjectId(id as string) });
      if (!cart) return new Response("Cart not found", { status: 404 });

      const cartUser = await fromModelToCart(cart, productCollection);
      return new Response(JSON.stringify(cartUser));

    }


  }else if (method === "POST") {
    if (path === "/users") {

      const user = await req.json(); 
      if (!user.name || !user.email || !user.password) return new Response("Bad request", { status: 400 });
      
      const { insertedId } = await userCollection.insertOne({
        name: user.name,
        email: user.email,
        password: user.password,
      });
      return new Response(JSON.stringify({
          id: insertedId,
          name: user.name,
          email: user.email,
          password: user.password,
          }),{ status: 201 }
      );

    } else if (path === "/products") {

        const product = await req.json(); 
        if (!product.name || !product.description || !product.price || !product.stock) return new Response("Bad request", { status: 400 });
        
        const { insertedId } = await productCollection.insertOne({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
        });
        return new Response(JSON.stringify({
            id: insertedId,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            }),{ status: 201 }
        );


    }
  }else if (method === "PUT") {
      if (path.startsWith("/products")) {
        //Para coger la ultima posicion de la url y borrarlo
        const id = path.split("/").pop();
        if (!id) return new Response("El id no es correcto", { status: 400 });
  
        const product = await productCollection.findOne({ _id: new ObjectId(id as string) });

        if (!product) return new Response("Product not found 1", { status: 404 });

        const body = await req.json(); 
                
        const { modifiedCount } = await productCollection.updateOne(
          { _id: new ObjectId(id as string) },
          { $set: { name: product.name, description: product.description, price: product.price, stock: body.stock } } );
   
        if (modifiedCount === 0) return new Response("Product not found 2", { status: 404 });
        return new Response(JSON.stringify({ modifiedCount }),{ status: 200 });
      }

    }else if (method === "DELETE") {
      if (path.startsWith("/products")) {
        //Para coger la ultima posicion de la url y borrarlo
        const id = path.split("/").pop();
        
        if (!id) return new Response("El id no es correcto", { status: 400 });
        
        const { deletedCount } = await productCollection.deleteOne({_id: new ObjectId(id)});
  
        if (deletedCount === 0) return new Response("Product not found", { status: 404 });
        
        return new Response("Product delete", { status: 200 });
      }
    }
  

      


  return new Response("endpoint not found", { status: 404 });

}

Deno.serve({ port: 4000 }, handler);