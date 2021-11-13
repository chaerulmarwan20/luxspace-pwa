import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes as Switch,
  Route,
} from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Browse from "./components/Browse";
import Arrived from "./components/Arrived";
import Clients from "./components/Clients";
import AsideMenu from "./components/AsideMenu";
import Footer from "./components/Footer";
import Offline from "./components/Offline";
import Splash from "./pages/Splash";
import Profile from "./pages/Profile";
import Details from "./pages/Details";
import Cart from "./pages/Cart";

function App({ cart }) {
  const [items, setItems] = useState([]);
  const [offlineStatus, setOfflineStatus] = useState(!navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  const handleOfflineStatus = () => setOfflineStatus(!navigator.onLine);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://prod-qore-app.qorebase.io/8ySrll0jkMkSJVk/allItems/rows?limit=7&offset=0&$order=asc",
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            "x-api-key": process.env.REACT_APP_APIKEY,
          },
        }
      );
      const { nodes } = await response.json();
      setItems(nodes);

      const script = document.createElement("script");
      script.src = "/carousel.js";
      script.async = false;
      document.body.appendChild(script);
    })();

    handleOfflineStatus();
    window.addEventListener("online", handleOfflineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    setTimeout(() => setIsLoading(false), 1500);

    return () => {
      window.removeEventListener("online", handleOfflineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, [offlineStatus]);

  return (
    <>
      {isLoading ? (
        <Splash />
      ) : (
        <>
          {offlineStatus && <Offline />}
          <Header mode="light" cart={cart} />
          <Hero />
          <Browse />
          <Arrived items={items} />
          <Clients />
          <AsideMenu />
          <Footer />
        </>
      )}
    </>
  );
}

export default function Routes() {
  const cachedCart = window.localStorage.getItem("cart");
  const [cart, setCart] = useState([]);

  const handleAddToCart = (item) => {
    const currentIndex = cart.length;
    const newCart = [...cart, { id: currentIndex + 1, item }];
    setCart(newCart);
    window.localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleRemoveCartItem = (id) => {
    const revisedCart = cart.filter((item) => item.id !== id);
    setCart(revisedCart);
    window.localStorage.setItem("cart", JSON.stringify(revisedCart));
  };

  useEffect(() => {
    if (cachedCart) setCart(JSON.parse(cachedCart));
  }, [cachedCart]);

  return (
    <Router>
      <Switch>
        <Route index element={<App cart={cart} />} />
        <Route path="profile" element={<Profile cart={cart} />} />
        <Route
          path="details/:id"
          element={<Details cart={cart} handleAddToCart={handleAddToCart} />}
        />
        <Route
          path="cart"
          element={
            <Cart cart={cart} handleRemoveCartItem={handleRemoveCartItem} />
          }
        />
      </Switch>
    </Router>
  );
}
