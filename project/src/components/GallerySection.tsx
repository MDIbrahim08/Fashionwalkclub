import React, { useState, useEffect } from 'react';
import { supabase, GalleryItem } from '../lib/supabase';
import { Plus, Upload, Trash2, Eye, X, Search } from 'lucide-react';

interface GallerySectionProps {
  isPublicView?: boolean
}

export function GallerySection({ isPublicView = false }: GallerySectionProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    image_url: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error fetching gallery items:', error);
      alert('Error loading gallery: ' + (error.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.image_url.trim()) {
      alert('Please provide an image URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemData = {
        title: newItem.title.trim() || null,
        image_url: newItem.image_url.trim()
      };

      const { error } = await supabase
        .from('gallery')
        .insert([itemData]);

      if (error) throw error;

      setNewItem({ title: '', image_url: '' });
      setShowAddModal(false);
      fetchItems();
      alert('Image added successfully!');
    } catch (error: any) {
      console.error('Error adding gallery item:', error);
      alert('Error adding image: ' + (error.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, title?: string) => {
    if (!confirm(`Are you sure you want to delete this image${title ? ` "${title}"` : ''}?`)) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchItems();
      alert('Image deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting gallery item:', error);
      alert('Error deleting image: ' + (error.message || 'Please try again.'));
    }
  };

  const openViewModal = (item: GalleryItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const filteredItems = items.filter(item =>
    (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.image_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
            Gallery
          </h2>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
            Manage club photos and images
          </p>
        </div>
        {!isPublicView && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Image</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 && !searchTerm ? (
        <div className="text-center py-12 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 night:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 night:text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white night:text-gold-300 mb-2">
            No images yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 night:text-purple-300 mb-4">
            {isPublicView ? 'No images available at the moment' : 'Add your first image to get started'}
          </p>
          {!isPublicView && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200"
            >
              Add Image
            </button>
          )}
        </div>
      ) : filteredItems.length === 0 && searchTerm ? (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 night:text-purple-400">
            No images found matching "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-slate-800 night:bg-black/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 night:border-purple-800/30"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title || 'Gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openViewModal(item)}
                    className="p-2 bg-white/90 text-slate-700 rounded-full hover:bg-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!isPublicView && (
                    <button
                      onClick={() => handleDeleteItem(item.id, item.title || undefined)}
                      className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              {item.title && (
                <div className="p-3">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white night:text-gold-300 truncate">
                    {item.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      {showAddModal && !isPublicView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 night:bg-black/70 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-6">
              Add New Image
            </h3>
            
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-800 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter image title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-800 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 night:text-purple-400 mt-1">
                  Enter a valid image URL (e.g., from Pexels, Unsplash, etc.)
                </p>
              </div>

              {newItem.image_url && (
                <div className="border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg p-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 night:text-purple-300 mb-2">Preview:</p>
                  <img
                    src={newItem.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-slate-600 dark:text-slate-400 night:text-purple-300 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 night:hover:bg-purple-800/30 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newItem.image_url || isSubmitting}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Image Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedItem.image_url}
              alt={selectedItem.title || 'Gallery image'}
              className="w-full h-full object-contain rounded-lg"
            />
            {selectedItem.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                <h3 className="text-lg font-medium">{selectedItem.title}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}