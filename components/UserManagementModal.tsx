
import React, { useState } from 'react';
import { User } from '../types';

interface UserManagementModalProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ users, onUpdateUsers, onClose }) => {
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm('¿ELIMINAR ACCESO PARA ESTE USUARIO? ESTA ACCIÓN NO SE PUEDE DESHACER.')) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingUser?.email || !editingUser?.name || !editingUser?.password) {
      alert("TODOS LOS CAMPOS SON OBLIGATORIOS, INCLUYENDO CONTRASEÑA.");
      return;
    }
    
    if (isAdding) {
      onUpdateUsers([...users, { ...editingUser as User, id: Date.now().toString() }]);
    } else {
      onUpdateUsers(users.map(u => u.id === editingUser.id ? (editingUser as User) : u));
    }
    setEditingUser(null);
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-10 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Usuarios IPS</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Control de Accesos y Roles del Sistema</p>
          </div>
          <button onClick={() => { setIsAdding(true); setEditingUser({ email: '', name: '', role: 'viewer', password: '' }); }} className="px-6 py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all text-[10px]">
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
                  <input value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value.toUpperCase()})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Corporativo</label>
                  <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contraseña de Acceso</label>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"}
                      value={editingUser.password} 
                      onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
                      className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-bold outline-none focus:border-blue-500" 
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                    >
                      {showPass ? 'OCULTAR' : 'VER'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rol de Acceso</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 font-black outline-none appearance-none">
                    <option value="admin">ADMINISTRADOR (CONTROL TOTAL)</option>
                    <option value="editor">EDITOR (MODIFICA DATOS)</option>
                    <option value="viewer">VISUALIZADOR (SOLO LECTURA)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => { setEditingUser(null); setIsAdding(false); }} className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-xl font-black uppercase text-xs tracking-widest text-slate-400">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Guardar Registro</button>
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
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingUser(u); setIsAdding(false); }} 
                        className="p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"
                        title="EDITAR"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        className="p-2.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"
                        title="ELIMINAR"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
