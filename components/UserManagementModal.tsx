
import React, { useState } from 'react';
import { User } from '../types';

interface UserManagementModalProps {
  users: User[];
  onSave: (userToSave: User, password?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ users, onSave, onDelete, onClose }) => {
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('¿ELIMINAR ACCESO PARA ESTE USUARIO? ESTA ACCIÓN NO SE PUEDE DESHACER.')) {
      try {
        await onDelete(id);
      } catch (e: any) {
        alert("Error al eliminar usuario: " + e.message);
      }
    }
  };

  const handleSave = async () => {
    if (!editingUser?.email || !editingUser?.name || (isAdding && !newPassword)) {
      alert("TODOS LOS CAMPOS SON OBLIGATORIOS.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editingUser as User, newPassword || undefined);
      setEditingUser(null);
      setIsAdding(false);
      setNewPassword('');
    } catch (e: any) {
      alert("Error al guardar usuario: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-10 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Usuarios IPS</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Control de Accesos v8.1 (Firebase Auth)</p>
          </div>
          <button onClick={() => { setIsAdding(true); setEditingUser({ email: '', name: '', role: 'viewer' }); }} className="px-6 py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all text-[10px]">
            + Nuevo Usuario
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {editingUser ? (
            <div className="bg-slate-50 p-10 rounded-[2rem] border-2 border-slate-100 space-y-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">{isAdding ? 'Crear Nuevo Registro' : 'Editar Usuario'}</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                  <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value.toUpperCase() })} className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Corporativo</label>
                  <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-blue-500" />
                </div>
                {isAdding && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contraseña Temporal</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-blue-500"
                      >
                        {showPass ? 'OCULTAR' : 'VER'}
                      </button>
                    </div>
                  </div>
                )}
                {!isAdding && (
                  <p className="text-[9px] font-bold text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 uppercase">La contraseña no puede verse ni editarse por seguridad. El usuario debe usar la opción de recuperación de Firebase.</p>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rol de Acceso</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })} className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-black outline-none appearance-none">
                    <option value="admin">ADMINISTRADOR (CONTROL TOTAL)</option>
                    <option value="editor">EDITOR (MODIFICA DATOS)</option>
                    <option value="viewer">VISUALIZADOR (SOLO LECTURA)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                  <input
                    type="checkbox"
                    id="canViewReports"
                    checked={editingUser.canViewReports || false}
                    onChange={e => setEditingUser({ ...editingUser, canViewReports: e.target.checked })}
                    className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="canViewReports" className="text-xs font-black text-blue-900 uppercase tracking-wider cursor-pointer">Permitir visualizar informes estratégicos</label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => { setEditingUser(null); setIsAdding(false); setNewPassword(''); }} className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-xl font-black uppercase text-xs tracking-widest text-slate-400">Cancelar</button>
                <button disabled={isSaving} onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg disabled:opacity-50">
                  {isSaving ? 'GUARDANDO...' : 'Guardar Registro'}
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 text-left">Usuario</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-center">Rol</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-6 py-5 font-black text-slate-800 text-sm">{u.name}</td>
                    <td className="px-6 py-5 font-bold text-slate-500 text-xs">{u.email}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white ${u.role === 'admin' ? 'bg-blue-600' : u.role === 'editor' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                        {u.role}
                      </span>
                      {u.canViewReports && (
                        <span className="block mt-1 text-[7px] font-black text-blue-600 uppercase tracking-tighter">👁️ INFORMES</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button
                        onClick={() => { setEditingUser(u); setIsAdding(false); }}
                        className="p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"
                        title="EDITAR"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"
                        title="ELIMINAR"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-10 py-4 bg-white text-slate-500 font-black uppercase tracking-widest rounded-2xl border-2 border-slate-200 hover:bg-slate-100 transition-all">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
