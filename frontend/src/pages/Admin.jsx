import { useEffect, useState } from 'react'
import * as adminService from '../services/adminService'
import * as productService from '../services/productService'
import { getErrorMessage } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Admin() {
  const [tab, setTab] = useState('users') // 'users' | 'catalog'
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  // Category form state
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catLifespan, setCatLifespan] = useState(5)

  // Material form state
  const [matName, setMatName] = useState('')
  const [matRecyc, setMatRecyc] = useState(7)
  const [matRepair, setMatRepair] = useState(6)
  const [matImpact, setMatImpact] = useState(0.5)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [u, c, m] = await Promise.all([
        adminService.getUsers(),
        productService.getCategories(),
        productService.getMaterials(),
      ])
      setUsers(u)
      setCategories(c)
      setMaterials(m)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load admin data'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Change role of user ID #${userId} to "${newRole}"?`)) return
    try {
      await adminService.updateUserRole(userId, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setMessage(`User #${userId} role changed to ${newRole}`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update role'))
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await adminService.createCategory({
        name: catName,
        description: catDesc || null,
        typical_lifespan_years: Number(catLifespan),
      })
      setCategories((prev) => [...prev, res])
      setCatName('')
      setCatDesc('')
      setCatLifespan(5)
      setMessage('Category added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add category'))
    }
  }

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return
    try {
      await adminService.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete category'))
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await adminService.createMaterial({
        name: matName,
        recyclability_score: Number(matRecyc),
        repairability_score: Number(matRepair),
        environmental_impact_factor: Number(matImpact),
      })
      setMaterials((prev) => [...prev, res])
      setMatName('')
      setMessage('Material added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add material'))
    }
  }

  const handleDeleteMaterial = async (id, name) => {
    if (!window.confirm(`Delete material "${name}"?`)) return
    try {
      await adminService.deleteMaterial(id)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete material'))
    }
  }

  if (loading) return <LoadingSpinner label="Loading admin security portal" />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-bold text-forest-dark">Administration & Governance</h1>
          </div>
          <p className="text-sm text-ink/65 mt-0.5">
            Role-based access control (US2) and master catalog management (US9).
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-sage/60 p-1 rounded-xl border border-forest/10 text-xs font-semibold">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              tab === 'users' ? 'bg-forest text-white shadow-xs' : 'text-forest hover:text-forest-dark'
            }`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setTab('catalog')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              tab === 'catalog' ? 'bg-forest text-white shadow-xs' : 'text-forest hover:text-forest-dark'
            }`}
          >
            Master Catalog ({categories.length} / {materials.length})
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-fadeIn">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          ✕ {error}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-forest/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-forest/10">
            <h2 className="font-bold text-forest-dark text-base">Registered Users & Role Assignment</h2>
            <p className="text-xs text-ink/55 mt-0.5">Manage permissions and promote administrators.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage/40 text-ink/60 border-b border-forest/10 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Username</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-sage/20 transition">
                    <td className="py-3.5 px-6 text-ink/40">#{u.id}</td>
                    <td className="py-3.5 px-6 font-semibold text-forest-dark">{u.username}</td>
                    <td className="py-3.5 px-6 text-ink/70">{u.email}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-forest/10 text-forest border border-forest/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="text-xs font-semibold text-forest hover:text-forest-dark underline cursor-pointer"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Catalog Tab */}
      {tab === 'catalog' && (
        <div className="space-y-6">
          {/* Categories Manager */}
          <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-forest-dark text-base">Categories Master List</h2>
            <form onSubmit={handleAddCategory} className="grid sm:grid-cols-4 gap-3 bg-sage/30 p-4 rounded-xl border border-forest/10">
              <input
                required
                placeholder="Category Name (e.g. Textiles)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <input
                placeholder="Description"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <input
                type="number"
                min={1}
                required
                placeholder="Lifespan (yrs)"
                value={catLifespan}
                onChange={(e) => setCatLifespan(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <button
                type="submit"
                className="bg-forest text-white rounded-lg text-xs font-semibold py-2 hover:bg-forest-dark transition cursor-pointer"
              >
                + Add Category
              </button>
            </form>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {categories.map((c) => (
                <div key={c.id} className="p-3 bg-white border border-forest/15 rounded-xl flex justify-between items-start shadow-2xs">
                  <div>
                    <h4 className="font-semibold text-forest-dark text-xs">{c.name}</h4>
                    <p className="text-[11px] text-ink/50 mt-0.5">Lifespan: {c.typical_lifespan_years} yrs</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="text-red-400 hover:text-red-600 text-xs cursor-pointer"
                    title="Delete category"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Manager */}
          <div className="bg-white rounded-2xl border border-forest/10 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-forest-dark text-base">Materials Master List</h2>
            <form onSubmit={handleAddMaterial} className="grid sm:grid-cols-5 gap-3 bg-sage/30 p-4 rounded-xl border border-forest/10">
              <input
                required
                placeholder="Material Name"
                value={matName}
                onChange={(e) => setMatName(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <input
                type="number"
                min={1}
                max={10}
                required
                placeholder="Recycle (1-10)"
                value={matRecyc}
                onChange={(e) => setMatRecyc(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <input
                type="number"
                min={1}
                max={10}
                required
                placeholder="Repair (1-10)"
                value={matRepair}
                onChange={(e) => setMatRepair(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <input
                type="number"
                step="0.1"
                min={0}
                max={1}
                required
                placeholder="Impact (0-1)"
                value={matImpact}
                onChange={(e) => setMatImpact(e.target.value)}
                className="text-xs border border-forest/20 rounded-lg px-3 py-2 bg-white"
              />
              <button
                type="submit"
                className="bg-forest text-white rounded-lg text-xs font-semibold py-2 hover:bg-forest-dark transition cursor-pointer"
              >
                + Add Material
              </button>
            </form>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {materials.map((m) => (
                <div key={m.id} className="p-3 bg-white border border-forest/15 rounded-xl flex justify-between items-start shadow-2xs">
                  <div>
                    <h4 className="font-semibold text-forest-dark text-xs">{m.name}</h4>
                    <p className="text-[11px] text-ink/50 mt-0.5">
                      Recy: {m.recyclability_score}/10 • Rep: {m.repairability_score}/10
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(m.id, m.name)}
                    className="text-red-400 hover:text-red-600 text-xs cursor-pointer"
                    title="Delete material"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

