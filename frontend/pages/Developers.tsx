
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, ChevronRight, Mail, Briefcase, Calendar, Edit3, X, Shield, BadgeCheck, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import { Developer } from '../types';

interface Props {
  onSelect: (id: number) => void;
}

const Developers: React.FC<Props> = ({ onSelect }) => {
  const [devs, setDevs] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDev, setEditDev] = useState<Developer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevs();
  }, []);

  const fetchDevs = async () => {
    const data = await apiService.getDevelopers();
    setDevs(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editDev) {
      // Simulation of update
      const index = devs.findIndex(d => d.id === editDev.id);
      if (index > -1) {
        devs[index] = { ...editDev, ...formData };
      }
    } else {
      await apiService.addDeveloper(formData);
    }
    setFormData({ name: '', email: '', role: '' });
    setShowForm(false);
    setEditDev(null);
    fetchDevs();
  };

  const handleEdit = (e: React.MouseEvent, dev: Developer) => {
    e.stopPropagation();
    setEditDev(dev);
    setFormData({ name: dev.name, email: dev.email, role: dev.role });
    setShowForm(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Permanently remove this personnel record from the system?')) {
      try {
        await apiService.deleteDeveloper(id);
        fetchDevs();
      } catch (error: any) {
        alert(`Failed to delete developer: ${error.message}`);
      }
    }
  };

  const filteredDevs = devs.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-primary/20 pb-8">
        <div>
          <h2 className="text-5xl font-black text-primary tracking-tighter uppercase flex items-center gap-4">
            <Shield className="w-12 h-12 text-secondary" />
            Developers
          </h2>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mt-3 pl-1">
            Personnel Directory & Access Control
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditDev(null);
            setFormData({ name: '', email: '', role: '' });
          }}
          className="flex items-center gap-3 bg-primary text-bg px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-secondary hover:text-primary transition-all active:scale-95 group border border-transparent hover:border-primary/20"
        >
          <UserPlus className="w-5 h-5 group-hover:scale-125 transition-transform" />
          Register Personnel
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-primary/40">
          <form onSubmit={handleSubmit} className="bg-bg border border-primary w-full max-w-2xl rounded-[2.5rem] p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>

            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">
                {editDev ? 'Update Dossier' : 'New Registration'}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-primary/50 hover:text-primary transition-colors bg-primary/5 hover:bg-primary/20 p-2 rounded-full">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                  Identification <div className="h-px bg-primary/20 flex-1"></div>
                </label>
                <input
                  required
                  className="w-full p-5 bg-light border-2 border-primary/10 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-primary font-bold placeholder:text-primary/30 transition-all"
                  placeholder="Full Legal Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                  Communication Channel <div className="h-px bg-primary/20 flex-1"></div>
                </label>
                <input
                  required
                  type="email"
                  className="w-full p-5 bg-light border-2 border-primary/10 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-primary font-bold placeholder:text-primary/30 transition-all"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                  Operational Assignment <div className="h-px bg-primary/20 flex-1"></div>
                </label>
                <input
                  required
                  className="w-full p-5 bg-light border-2 border-primary/10 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-primary font-bold placeholder:text-primary/30 transition-all"
                  placeholder="e.g. Senior Systems Architect"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-12">
              <button type="submit" className="w-full bg-primary text-bg py-5 rounded-xl font-black uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-95 hover:bg-secondary hover:text-primary transition-all">
                {editDev ? 'Confirm Modifications' : 'Initialize Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group max-w-4xl">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="text-secondary w-6 h-6 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          placeholder="Search personnel database by name or role designation..."
          className="w-full pl-16 pr-6 py-6 bg-light/50 border-2 border-primary/10 rounded-2xl shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-primary font-bold placeholder:text-primary/40 transition-all backdrop-blur-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-primary/5 animate-pulse rounded-[2.5rem] border border-primary/10"></div>
          ))
        ) : filteredDevs.map(dev => (
          <div
            key={dev.id}
            onClick={() => { onSelect(dev.id); navigate(`/dashboard/${dev.id}`); }}
            className="group relative bg-light border border-primary/20 p-8 rounded-[2.5rem] hover:border-primary hover:shadow-[0_20px_40px_-10px_rgba(80,75,56,0.2)] transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1 duration-300 overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-secondary/20"></div>

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 text-primary flex items-center justify-center font-black text-2xl group-hover:bg-primary group-hover:text-bg transition-colors duration-500 shadow-inner">
                {dev.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleEdit(e, dev)}
                  className="p-2.5 bg-bg border border-primary/10 hover:border-primary/50 rounded-xl text-primary/60 hover:text-primary transition-all shadow-sm active:scale-95"
                  title="Edit Record"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, dev.id)}
                  className="p-2.5 bg-bg border border-primary/10 hover:border-red-900 hover:text-light rounded-xl text-primary/60 transition-all shadow-sm active:scale-95"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2.5 bg-primary text-bg rounded-xl group-hover:translate-x-1 transition-transform shadow-lg">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div>
                <h4 className="text-xl font-black text-primary tracking-tight leading-none mb-1">{dev.name}</h4>
                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-primary/5 inline-block px-2 py-1 rounded-md">
                  {dev.role}
                </div>
              </div>

              <div className="flex items-center gap-2 text-primary/70 text-xs font-semibold py-2">
                <Mail className="w-3.5 h-3.5 text-secondary" />
                {dev.email}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-primary/10 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
              <span className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-secondary" />
                Verified
              </span>
              <span className="text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-x-2">
                Access Data
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Developers;
