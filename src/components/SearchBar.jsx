export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-container">
      <input
        name="search"
        type="text"
        placeholder="Busque por intérprete, música ou trecho"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur(); // tira o foco do input
          }
        }}
      />
    </div>
  );
}