import { useState, useEffect } from "react";
import vbuckIcon from "../assets/icons/v-buck.png";
import "./Shop.css";

const VBUCK_BALANCE: number = 135500;

const sections = [
  {
    id: "battle-beats",
    name: "Battle Beats",
    items: [
      { id: "1", image: "https://fortnite-api.com/images/cosmetics/br/newdisplayassets/bc8f0fd7f91abd11/renderimage_0.png", name: "Boo'd Up Groove" },
      { id: "2", image: "https://fortnite-api.com/images/cosmetics/br/newdisplayassets/2a34c2c861931ebd/renderimage_0.png", name: "On the Run" },
      { id: "3", image: "https://fortnite-api.com/images/cosmetics/br/newdisplayassets/f52d0e31b5b2ec16/renderimage_0.png", name: "Ambitious" },
      { id: "4", image: "https://fortnite-api.com/images/cosmetics/br/newdisplayassets/5fbbd196b23be291/renderimage_0.png", name: "Bizcochito" },
      { id: "5", image: "https://fortnite-api.com/images/cosmetics/br/newdisplayassets/063bb1e568e07bb2/renderimage_0.png", name: "Look at Me" },
      { id: "6", image: "https://fortnite-api.com/images/cosmetics/br/newdisplayassets/b1e8a5b7ca1539b3/renderimage_0.png", name: "Smitten" },
    ],
  },
  {
    id: "daily-shop",
    name: "Daily",
    items: [
      { id: "7", image: "https://fortnite-api.com/images/cosmetics/br/cid_011_athena_commando_m/icon.png", name: "Rex", skin: true },
      { id: "8", image: "https://fortnite-api.com/images/cosmetics/br/cid_011_athena_commando_m/icon.png", name: "Ella Slurp", skin: true },
      { id: "9", image: "https://fortnite-api.com/images/cosmetics/br/cid_011_athena_commando_m/icon.png", name: "Lady Flamespark", skin: true },
      { id: "10", image: "https://fortnite-api.com/images/cosmetics/br/cid_011_athena_commando_m/icon.png", name: "Splashy Steppers" },
      { id: "11", image: "https://fortnite-api.com/images/cosmetics/br/cid_011_athena_commando_m/icon.png", name: "Magmatix" },
      { id: "12", image: "https://fortnite-api.com/images/cosmetics/br/cid_011_athena_commando_m/icon.png", name: "Fire's Sharp Wrath" },
    ],
  },
];

function Shop() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(0);

  useEffect(() => {
    if (VBUCK_BALANCE === 0) return;
    const duration = 800;
    const steps = 20;
    const increment = VBUCK_BALANCE / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= VBUCK_BALANCE) {
        setDisplayBalance(VBUCK_BALANCE);
        clearInterval(interval);
      } else {
        setDisplayBalance(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  function scrollToSection(index: number) {
    setActive(index);
    const el = document.getElementById(`shop-section-${sections[index].id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(`shop-section-${sections[i].id}`);
      if (el) {
        const dist = Math.abs(el.offsetTop - container.offsetTop - scrollTop);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
    }
    setActive(closest);
  }

  return (
    <div className="page shop">
      <div className="shop-balance">
        <img src={vbuckIcon} alt="" className="shop-balance-icon" />
        <span className="shop-balance-text">{displayBalance.toLocaleString()}</span>
      </div>
      <div
        className={`shop-sidebar ${hovered ? "expanded" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {!hovered ? (
          <div className="shop-dots">
            {sections.map((_, i) => (
              <div
                key={i}
                className={`shop-dot ${i === active ? "active" : ""}`}
                onClick={() => scrollToSection(i)}
              />
            ))}
          </div>
        ) : (
          <div className="shop-nav-list">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className={`shop-nav-item ${i === active ? "active" : ""}`}
                onClick={() => scrollToSection(i)}
              >
                {section.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shop-content" onScroll={handleScroll}>
        {sections.map((section) => (
          <div key={section.id} id={`shop-section-${section.id}`} className="shop-section">
            <h2 className="shop-section-title">{section.name}</h2>
            <div className="shop-grid">
              {section.items.map((item) => (
                <div key={item.id} className={`shop-item ${"skin" in item && item.skin ? "shop-item-skin" : ""}`}>
                  <img src={item.image} alt={item.name} className={`shop-item-image ${"skin" in item && item.skin ? "skin" : ""}`} />
                  <div className="shop-item-info">
                    <span className="shop-item-name">cosmetic.name</span>
                    <div className="shop-item-price">
                      <img src={vbuckIcon} alt="" className="shop-item-vbuck" />
                      <span className="shop-item-price-text">FREE</span>
                    </div>
                  </div>
                  <div className="shop-item-footer">
                    <span className="shop-item-footer-text">COSMETIC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
