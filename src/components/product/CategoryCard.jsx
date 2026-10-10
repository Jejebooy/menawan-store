import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  const Icon = category.icon;
  return (
    <Link to={`/katalog?category=${category.slug}`} className="card p-3 flex flex-col items-center text-center gap-2 hover:border-accent-500 hover:-translate-y-0.5">
      <div className="w-11 h-11 rounded-full bg-gray-100 grid place-items-center">
        <Icon size={20} className="text-gray-700" />
      </div>
      <span className="text-[11px] font-medium text-gray-700 leading-tight">{category.name}</span>
    </Link>
  );
}
