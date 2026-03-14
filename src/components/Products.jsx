import { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";

const CATEGORY_LABELS = {
  rice: "Rice",
  oil: "Oil",
  "wheat-flour": "Wheat Flour",
  salt: "Salt",
  sugar: "Sugar",
  "chilli-powder": "Chilli Powder",
  "turmeric-powder": "Turmeric Powder",
  pulses: "Pulses",
  masala: "Masala",
  fruits: "Fruits",
  vegetables: "Vegetables",
  dairyProducts: "Dairy Products",
  feminineHygiene: "Feminine Hygiene",
  homeNeeds: "Home Needs",
  babyCare: "Baby Care",
  instantFood: "Instant Food",
  milkPowders: "Milk Powders",
  chipsAndNamkeens: "Chips & Namkeens",
  oralCare: "Oral Care",
  biscuitsAndCookies: "Biscuits & Cookies",
  coolDrinks: "Cool Drinks",
  bodyCare: "Body Care",
};

function Products({ category, onAddCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    setLoading(true);
    setProducts([]);

    const productsRef = ref(database, "categories/" + category);

    get(productsRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.values(data));
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
  }, [category]);

  if (!category) return null;

  return (
    <section className="products-section">
      <div className="container">
        {/* Section header */}
        <div className="sec-header">
          <div>
            <div className="sec-title">
              {CATEGORY_LABELS[category] || category}
            </div>
          </div>
        </div>

        {/* Products grid — same markup as HomePage's pcard */}
        <div className="products-grid" id="pGrid">
          {loading ? (
            <p style={{ padding: "2rem", color: "#888" }}>Loading products…</p>
          ) : products.length === 0 ? (
            <p style={{ padding: "2rem", color: "#888" }}>No products found.</p>
          ) : (
            products.map((item, index) => (
              <div key={index} className="pcard">
                {item.badge && (
                  <span className="pbadge bo">{item.badge}</span>
                )}
                <button className="pwish">
                  <i className="far fa-heart"></i>
                </button>
                <div className="pimg">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="pbrand">{item.brand}</div>
                <div className="pname">{item.name}</div>
                {item.stars != null && (
                  <div className="pstars">
                    ⭐ {item.stars}{" "}
                    {item.reviews && <span>({item.reviews})</span>}
                  </div>
                )}
                <div className="pprice">
                  <span className="pnew">{item.price}</span>
                  {item.oldPrice && (
                    <span className="pold">{item.oldPrice}</span>
                  )}
                </div>
                <button
                  className="padd"
                  onClick={(e) => onAddCart && onAddCart(e.currentTarget)}
                >
                  <i className="fas fa-shopping-cart"></i> Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Products;