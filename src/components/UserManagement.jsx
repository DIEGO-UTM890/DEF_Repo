import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  X, 
  Search,
  Building,
  Mail,
  BadgeAlert
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';

export default function UserManagement({ users, onUpdateUsers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulario nuevo usuario
  const [matricula, setMatricula] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('reportante');
  const [area, setArea] = useState('computo_redes');

  // Alternar estado activo/inactivo (RF-08)
  const toggleUserActive = (userId) => {
    const updated = users.map(u => {
      if (u._id === userId) {
        return { ...u, activo: !u.activo };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Cambiar rol de usuario (RF-08)
  const handleChangeRole = (userId, newRole) => {
    const updated = users.map(u => {
      if (u._id === userId) {
        return { ...u, rol: newRole };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Crear nuevo perfil (RF-08)
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!matricula || !nombreCompleto || !correo) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const newUser = {
      _id: Date.now().toString(16) + 'c8d4e123',
      matricula_o_empleado: matricula,
      nombre_completo: nombreCompleto,
      correo_institucional: correo,
      rol,
      area_asignada: area,
      activo: true,
      fecha_registro: new Date().toISOString()
    };

    onUpdateUsers([newUser, ...users]);
    setShowAddModal(false);
    setMatricula('');
    setNombreCompleto('');
    setCorreo('');
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.nombre_completo?.toLowerCase().includes(q) ||
      u.correo_institucional?.toLowerCase().includes(q) ||
      u.matricula_o_empleado?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Colección Auxiliar: usuarios (RF-08)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Administración de Perfiles
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Gestión de cuentas institucionales, asignación de roles y control de acceso al sistema UTM Desk.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Alta de Usuario</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo institucional o matrícula/empleado..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Tabla de Usuarios en Desktop / Tarjetas en Móvil */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Usuario & Matrícula</th>
                <th className="px-6 py-4">Rol Operativo</th>
                <th className="px-6 py-4">Área Asignada</th>
                <th className="px-6 py-4">Estado Cuenta</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.map((u) => {
                const roleBadge = ROLES_CONFIG[u.rol]?.badge || 'bg-slate-100 text-slate-700';

                return (
                  <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.nombre_completo}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{u.matricula_o_empleado}</span>
                        <span>•</span>
                        <span>{u.correo_institucional}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={u.rol}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none bg-white dark:bg-slate-800 ${roleBadge}`}
                      >
                        {Object.entries(ROLES_CONFIG).map(([key, val]) => (
                          <option key={key} value={key}>{val.title}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {u.area_asignada?.replace('_', ' ')}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserActive(u._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          u.activo
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {u.activo ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{u.activo ? 'Activa' : 'Desactivada'}</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleUserActive(u._id)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                      >
                        {u.activo ? 'Suspender' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Alta de Usuario */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Dar de Alta Nuevo Usuario
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Matrícula o N° Empleado
                </label>
                <input
                  type="text"
                  required
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="EMP-2026-090 o MAT-2026-112"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej. Ing. Juan Manuel Chi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Correo Institucional (@utmerida.edu.mx)
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="juan.chi@utmerida.edu.mx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Rol Inicial
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {Object.entries(ROLES_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Área Asignada
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value="computo_redes">Cómputo y Redes</option>
                    <option value="infraestructura">Infraestructura</option>
                    <option value="academico">Académico</option>
                    <option value="general">General Campus</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
