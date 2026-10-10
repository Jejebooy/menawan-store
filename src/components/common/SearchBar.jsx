import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Cari produk, merek, atau model...", defaultValue = "" }) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 bg-white"
      />
    </form>
  );
}
