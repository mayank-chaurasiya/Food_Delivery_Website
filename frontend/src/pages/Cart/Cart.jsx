import React, { useContext, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../components/context/StoreContext";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart } = useContext(StoreContext);
  const hasItems = Object.values(cartItems).some((qty) => qty > 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div className="cart">
      <div className="cart-items">
        {hasItems ? (
          <>
            <div className="cart-items-title">
              <p>Items</p>
              <p>Title</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>
            </div>
            <br />
            <hr />
            {food_list.map((item, index) => {
              if (cartItems[item._id] > 0) {
                return (
                  <>
                    <div className="cart-items-title cart-items-item">
                      <img className="cart-item-img" src={item.image} alt="" />
                      <p>{item.name}</p>
                      <p>${item.price}</p>
                      <p>{cartItems[item._id]}</p>
                      <p>${item.price * cartItems[item._id]}</p>
                      <img
                        className="delete-cart-item-img"
                        src={assets.delete_icon}
                        alt=""
                        onClick={() => removeFromCart(item._id)}
                      />
                    </div>
                    <hr />
                  </>
                );
              }
            })}
          </>
        ) : (
          <div className="cart-empty">
            <h2>Cart is empty.</h2>
            <Link to="/">Visit Home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
