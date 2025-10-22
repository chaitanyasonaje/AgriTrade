import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Loader2, Search, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    contact: '',
    alternateContact: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/farmers');
      setFarmers(response.data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarmer) {
        await api.put(`/farmers/${editingFarmer._id}`, formData);
        toast.success('Farmer updated successfully');
      } else {
        await api.post('/farmers', formData);
        toast.success('Farmer created successfully');
      }
      setShowModal(false);
      setEditingFarmer(null);
      setFormData({ name: '', village: '', contact: '', alternateContact: '', address: '', notes: '' });
      fetchFarmers();
    } catch (error) {
      console.error('Error saving farmer:', error);
      toast.error(error.response?.data?.message || 'Failed to save farmer');
    }
  };

  const handleEdit = (farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      village: farmer.village,
      contact: farmer.contact,
      alternateContact: farmer.alternateContact || '',
      address: farmer.address || '',
      notes: farmer.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (farmerId) => {
    if (window.confirm('Are you sure you want to delete this farmer?')) {
      try {
        await api.delete(`/farmers/${farmerId}`);
        toast.success('Farmer deleted successfully');
        fetchFarmers();
      } catch (error) {
        console.error('Error deleting farmer:', error);
        toast.error('Failed to delete farmer');
      }
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmers Management</h1>
          <p className="text-gray-600">Manage your farmer contacts and information</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Farmer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search farmers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-field"
        />
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.map((farmer) => (
          <div key={farmer._id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(farmer)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(farmer._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {farmer.village}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {farmer.contact}
              </div>
              
              {farmer.alternateContact && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {farmer.alternateContact} (Alt)
                </div>
              )}
              
              {farmer.address && (
                <div className="text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 inline" />
                  {farmer.address}
                </div>
              )}
              
              {farmer.notes && (
                <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                  {farmer.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No farmers found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Farmer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="Enter farmer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Village
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="Enter village name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="10-digit mobile number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alternate Contact
                  </label>
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    value={formData.alternateContact}
                    onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                    className="mt-1 input-field"
                    placeholder="Optional alternate number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 input-field"
                    rows="2"
                    placeholder="Optional address details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 input-field"
                    rows="2"
                    placeholder="Optional notes about the farmer"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingFarmer(null);
                      setFormData({ name: '', village: '', contact: '', alternateContact: '', address: '', notes: '' });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingFarmer ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farmers;
