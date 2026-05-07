import SpeciesCard from '../../../components/ui/SpeciesCard'
import { type Species } from '../../../apis/speciesList.api'

interface SpeciesSidebarProps {
  zoneName: string
  species: Species[]
  loading: boolean
  error: string | null
  onClose: () => void
}

export default function SpeciesSidebar({
  zoneName,
  species,
  onClose,
  loading,
  error,
}: SpeciesSidebarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '80px',
        width: '320px',
        height: '100vh',
        backgroundColor: 'white',
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'white',
        }}
      >
        <div>
          <h2
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
              margin: 0,
              color: 'black',
            }}
          >
            {zoneName}
          </h2>
          <p
            style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}
          >
            Wildlife species recorded here
          </p>
          <p
            style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}
          >
            {species.length} Species Found
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          x
        </button>
      </div>

      {/* Species Cards */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {loading && <p style={{ color: '#6b7280' }}>Loading species...</p>}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && species.length === 0 && (
          <p style={{ color: '#6b7280' }}>No species found.</p>
        )}

        {!loading &&
          !error &&
          species.map((s) => <SpeciesCard key={s.id} species={s} />)}
      </div>
    </div>
  )
}
