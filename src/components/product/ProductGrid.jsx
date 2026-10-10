import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  emptyMessage = "Tidak ada produk.",
}) {
  if (!products?.length) {
    return (
      <div className="py-16 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}