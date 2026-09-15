import { useEffect, useMemo, useState } from "react";
import { readExcel } from "./utils/excelReader";
import { normalizeText } from "./utils/normalizeText";
import MusicTable from "./components/MusicTable";
import SearchBar from "./components/SearchBar";
import Modal from "./components/Modal"
import FiltersMenu from "./components/FiltersMenu"
import Pagination from "./components/Pagination";

import logoKaraokeBox from "./assets/logo-karaoke-box.png";
import logoPM from "./assets/pm-logo.png";
import logoWhatsApp from "./assets/logo-whatsapp.png"
import logoInstagram from "./assets/logo-instagram.png"
import logoFacebook from "./assets/logo-facebook.png"
import filterIcon from "./assets/filter-icon.png"
import WhitecloseIcon from "./assets/white-close-icon.png"


function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [openFiltersModal, setOpenFiltersModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;


  async function loadData() {
    const result = await readExcel("data/catalogo_karaokebox_revisado.xlsx");
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);
  

// filtro de busca
  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return data.filter((row) => {
      const rowText = Object.values(row).join(" ");
      const matchesSearch = normalizeText(rowText).includes(normalizedSearch);
      const matchesFilterGroup = (type) => {
        const group = selectedFilters.filter((filter) => filter.type === type);
        if (!group.length) return true;

        const field = Object.keys(row).find((key) =>
          normalizeText(key) === (type === "genre" ? "genero" : "idioma")
        );

        if (!field) return false;

        const rowValues = new Set(
          normalizeText(row[field])
            .replace(/[-,/;|]/g, "|")
            .split("|")
            .map((value) => value.trim())
            .filter(Boolean)
        );

        return group.some((filter) => rowValues.has(normalizeText(filter.value)));
      };

      const matchesFilters = matchesFilterGroup("genre") && matchesFilterGroup("language");

      return matchesSearch && matchesFilters;
    });
  }, [search, data, selectedFilters]);

  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, [currentPage]);

  // total de páginas
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // calcular itens da página
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  // resetar página quando buscar
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // remove filtros da tela
  const removeFilter = (filterToRemove) => {
    setSelectedFilters((filters) => filters.filter((filter) =>
      filter.type !== filterToRemove.type || filter.value !== filterToRemove.value
    ));
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedFilters.length > 0;
  const resultLabel = filteredData.length === 1 ? "música encontrada" : "músicas encontradas";
  const availableLabel = filteredData.length === 1 ? "música disponível" : "músicas disponíveis";

  const hasPagination = totalPages > 1;

  return (
    <div className="container">
      <div className="header">
        <img src={logoKaraokeBox} alt="Logo Videoke" className="logo" />
        <h1>Lista de Músicas</h1>
        <p className="total">
          🎵 {hasActiveFilters
            ? `${filteredData.length} ${resultLabel}`
            : `${filteredData.length} ${availableLabel}`}
        </p>
      </div>
      <div className="results-container">
        <div className="filter-container">
            <SearchBar value={search} onChange={handleSearch} />
            <button className="button-filter" onClick={() => setOpenFiltersModal(true)}>
              <img src={filterIcon} alt=""/>
              <span>Filtrar</span>
            </button>
        </div>
        <div className="selected-filters">
            {selectedFilters.map((filter) => (
              <button
                type="button"
                className="selected-filter"
                key={`${filter.type}-${filter.value}`}
                onClick={() => removeFilter(filter)}
                aria-label={`Remover filtro ${filter.label}`}
              >
                {filter.label} <span aria-hidden="true"><img src={WhitecloseIcon} alt=""/></span>
              </button>
            ))}
        </div>
        {paginatedData.length > 0 && (
          <p className="scroll-hint">⬇️ Deslize para ver mais ➡️</p>
        )}
        <MusicTable data={paginatedData} loading={loading} />
      </div>
      {hasPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <div className="footer">
        <a href="https://www.instagram.com/pro_multimidia" target="_blank" rel="noopener noreferrer">
          <img src={logoPM} alt="Logo PRO Multimídia" className="pm-logo" />
        </a>
        <section className="footer-contact">
          <div className="social-media">
            <a href="https://api.whatsapp.com/send/?phone=5551985331004&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
              <img src={logoWhatsApp} alt="WhatsApp" />
            </a>
            <a href="https://www.instagram.com/pro_multimidia" target="_blank" rel="noopener noreferrer">
              <img src={logoInstagram} alt="Instagram" />
            </a>
            <a href="https://www.facebook.com/pro.multimidia.karaoke" target="_blank" rel="noopener noreferrer">
              <img src={logoFacebook} alt="Facebook" />
            </a>
          </div>
        </section>
        <small className="footer-copy">
          © {new Date().getFullYear()} PRO Multimídia • Desenvolvido por Bruno Duarte
        </small>
      </div>
      <Modal isOpen={openFiltersModal} onClose={() => setOpenFiltersModal(false)}>
        <FiltersMenu
          selectedFilters={selectedFilters}
          onApply={(filters) => {
            setSelectedFilters(filters);
            setCurrentPage(1);
          }}
          onClose={() => setOpenFiltersModal(false)}
        />
      </Modal>
    </div>
  );
}

export default App;