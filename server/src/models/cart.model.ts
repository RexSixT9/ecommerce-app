import { model, Schema } from "mongoose";
import { ICartItem, ICart } from "../types/index.js";

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 },
  size: { type: String, required: false },
});

const CartSchema = new Schema<ICart>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

CartSchema.method("calculateTotal", function () {
  this.totalAmount = this.items.reduce((total: number, item: ICartItem) => {
    return total + item.price * item.quantity;
  }, 0);
  return this.totalAmount;
});

export const Cart = model<ICart>("Cart", CartSchema);
export const CartItem = model<ICartItem>("CartItem", CartItemSchema);