// src/components/SearchBox.jsx
import { useState, useRef, useEffect } from "react";
import { useSearch } from "../hooks/useSearch";

export default function SearchBox({ onCategorySelect, onOpenProduct, mobile = false }) {
  const { search, indexReady } = useSearch();

  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState({ categories: [], products: [] });
  const [open, setOpen]           = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (!val.trim()) {
      setResults({ categories: [], products: [] });
      setOpen(false);
      return;
    }
    const res = search(val);
    setResults(res);
    setOpen(res.categories.length > 0 || res.products.length > 0);
  };

  const catResults  = results.categories.slice(0, 4);
  const prodResults = results.products.slice(0, 12);
  const allItems = [
    ...catResults.map((c)  => ({ type: "category", data: c })),
    ...prodResults.map((p) => ({ type: "product",  data: p })),
  ];

  const handleSelect = (item) => {
    setQuery("");
    setResults({ categories: [], products: [] });
    setOpen(false);
    setActiveIdx(-1);
    if (item.type === "category") onCategorySelect?.(item.data.value);
    else                          onOpenProduct?.(item.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIdx >= 0 && allItems[activeIdx]) { handleSelect(allItems[activeIdx]); return; }
    if (allItems.length > 0) handleSelect(allItems[0]);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if      (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Escape")    { setOpen(false); setActiveIdx(-1); }
    else if (e.key === "Enter")     { handleSubmit(e); }
  };

  const totalCount = catResults.length + prodResults.length;

  return (
    <div ref={wrapRef} className="sb-wrap">
      <style>{`
        .sb-wrap {
          position: relative;
          width: 260px;
          height: 44px;
          flex-shrink: 0;
        }

        /* Form expands symmetrically from center */
        .sb-form {
          position: absolute;
          left: 55%;
          transform: translateX(-50%);
          width: 260px;
          height: 44px;
          display: flex;
          align-items: center;
          background: #fff;
          border: 2px solid #dde4f0;
          border-radius: 25px;
          overflow: visible;
          transition: width 0.8s cubic-bezier(0.34, 1.15, 0.64, 1),
                      border-color 0.2s, box-shadow 0.2s;
          z-index: 600;
        }
        .sb-wrap:hover .sb-form,
        .sb-wrap:focus-within .sb-form {
          width: 500px;
          border-color: #1d5ba0;
          box-shadow: 0 2px 16px rgba(29,91,160,0.10);
        }
        .sb-form.sb-open {
          border-bottom-color: transparent;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        .sb-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 4px 0 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.875rem;
          color: #253d4e;
          background: transparent;
          min-width: 0;
        }
        .sb-input::placeholder { color: #b0bcce; }

        .sb-btn {
          width: 44px;
          height: 36px;
          margin: 0 4px 0 0;
          background: #1d5ba0;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          color: #fff;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .sb-btn:hover { background: #174d8a; }

        /* ── Dropdown ── */
        .sb-dropdown {
          position: absolute;
          top: 100%;
          left: -2px;
          right: -2px;
          background: #fff;
          border: 2px solid #1d5ba0;
          border-top: 1px solid #e8eef8;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 12px 32px rgba(29,91,160,0.13);
          z-index: 601;
          max-height: 360px;
          overflow-y: auto;
          overflow-x: hidden;
          animation: sbFade 0.15s ease;
          scroll-behavior: smooth;
        }
        .sb-dropdown::-webkit-scrollbar { width: 4px; }
        .sb-dropdown::-webkit-scrollbar-track { background: transparent; }
        .sb-dropdown::-webkit-scrollbar-thumb { background: #d0daf0; border-radius: 4px; }
        .sb-dropdown::-webkit-scrollbar-thumb:hover { background: #1d5ba0; }
        @keyframes sbFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Section label */
        .sb-label {
          padding: 8px 14px 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #b0bcce;
          background: #f8fafd;
          border-bottom: 1px solid #f0f3f9;
        }

        /* Row */
        .sb-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid #f5f7fb;
        }
        .sb-row:last-of-type { border-bottom: none; }
        .sb-row:hover,
        .sb-row.active { background: #f0f5ff; }

        /* Icon */
        .sb-ico {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sb-ico.cat {
          background: #e8f0fb;
          color: #1d5ba0;
          font-size: 13px;
        }
        .sb-ico.prod {
          background: #f4f6fb;
          border: 1px solid #e8eef8;
          overflow: hidden;
          padding: 3px;
        }
        .sb-ico.prod img { width: 100%; height: 100%; object-fit: contain; }

        /* Text */
        .sb-info { flex: 1; min-width: 0; }
        .sb-name {
          font-size: 13px;
          font-weight: 700;
          color: #253d4e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-name mark {
          background: #fef08a;
          color: #253d4e;
          border-radius: 2px;
          padding: 0 1px;
          font-weight: 800;
        }
        .sb-meta {
          font-size: 11px;
          color: #9aaabb;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Right side */
        .sb-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
        }
        .sb-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .sb-tag.cat  { background: #e8f0fb; color: #1d5ba0; }
        .sb-tag.prod { background: #f0f4fb; color: #7e8eaa; }
        .sb-price {
          font-size: 12px;
          font-weight: 800;
          color: #1d5ba0;
          font-family: 'Quicksand', sans-serif;
        }

        /* Empty */
        .sb-empty {
          padding: 20px 14px;
          text-align: center;
          font-size: 13px;
          color: #9aaabb;
        }
        .sb-empty i { display: block; font-size: 22px; color: #dde4f0; margin-bottom: 6px; }

        /* Footer */
        .sb-foot {
          padding: 6px 14px;
          background: #f8fafd;
          border-top: 1px solid #f0f3f9;
          display: flex;
          gap: 12px;
          align-items: center;
          position: sticky;
          bottom: 0;
          z-index: 1;
        }
        .sb-foot span {
          font-size: 10px;
          color: #b0bcce;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .sb-foot kbd {
          background: #eef1f7;
          color: #7e8eaa;
          border: 1px solid #dce4ef;
          border-radius: 3px;
          padding: 0 4px;
          font-size: 10px;
          font-family: inherit;
        }
      `}</style>

      <form className={`sb-form${open ? " sb-open" : ""}`} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="sb-input"
          type="text"
          placeholder={indexReady ? "Search products or categories…" : "Loading…"}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (totalCount > 0) setOpen(true); }}
          autoComplete="off"
          spellCheck="false"
        />
        <button className="sb-btn" type="submit" aria-label="Search">
          <i className="fas fa-search"></i>
        </button>

        {open && (
          <div className="sb-dropdown" onMouseDown={e => e.preventDefault()}>

            {/* Categories */}
            {catResults.length > 0 && (
              <>
                <div className="sb-label">Categories</div>
                {catResults.map((cat, i) => (
                  <div
                    key={cat.value}
                    className={`sb-row${activeIdx === i ? " active" : ""}`}
                    onMouseDown={() => handleSelect({ type: "category", data: cat })}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <div className="sb-ico cat"><i className="fas fa-tag"></i></div>
                    <div className="sb-info">
                      <div className="sb-name"><HighlightMatch text={cat.label} query={query} /></div>
                      <div className="sb-meta">Browse all {cat.label} products</div>
                    </div>
                    <div className="sb-right">
                      <span className="sb-tag cat">Category</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Products */}
            {prodResults.length > 0 && (
              <>
                <div className="sb-label">Products</div>
                {prodResults.map((prod, i) => {
                  const fi = catResults.length + i;
                  return (
                    <div
                      key={prod._uid}
                      className={`sb-row${activeIdx === fi ? " active" : ""}`}
                      onMouseDown={() => handleSelect({ type: "product", data: prod })}
                      onMouseEnter={() => setActiveIdx(fi)}
                    >
                      <div className="sb-ico prod">
                        {prod.imageUrl
                          ? <img src={prod.imageUrl} alt={prod.name} loading="lazy" />
                          : <i className="fas fa-box" style={{ color: "#c8d4e8", fontSize: 13 }}></i>
                        }
                      </div>
                      <div className="sb-info">
                        <div className="sb-name"><HighlightMatch text={prod.name || ""} query={query} /></div>
                        <div className="sb-meta">
                          {prod.brand && `${prod.brand} · `}
                          <span style={{ textTransform: "capitalize" }}>{prod._catLabel}</span>
                        </div>
                      </div>
                      <div className="sb-right">
                        {prod.price && <span className="sb-price">{prod.price}</span>}
                        <span className="sb-tag prod">{prod._catLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Empty */}
            {totalCount === 0 && (
              <div className="sb-empty">
                <i className="fas fa-search"></i>
                No results for "<strong>{query}</strong>"
              </div>
            )}

            {/* Footer */}
            <div className="sb-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function HighlightMatch({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}