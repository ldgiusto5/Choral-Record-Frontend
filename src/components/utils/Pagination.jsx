/**
 * Pagination.jsx
 * Componente de paginación reutilizable.
 * Uso: <Pagination currentPage={n} totalItems={n} itemsPerPage={n} onPageChange={fn} />
 */

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-ghost pagination-btn"
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn pagination-btn pagination-page ${currentPage === page ? 'btn-accent' : 'btn-ghost'}`}
          aria-label={`Página ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-ghost pagination-btn"
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>
    </div>
  );
};

export default Pagination;
