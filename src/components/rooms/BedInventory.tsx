const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  useEffect(() => {
    if (bedId && token) {
      fetchBedInventory();
    }
  }, [bedId, token]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchBedInventory = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      // Updated to use the new endpoint structure
      const response = await fetch(`https://api.blexi.co/api/v1/inventory?assignable_type=App\\Modules\\Bed\\Models\\Bed&assignable_id=${bedId}&per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setInventory(data.data);
      } else {
        console.error('Envanter verileri alınamadı:', data);
        setError('Envanter yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Envanter verileri çekilirken hata oluştu:', error);
      setError('Envanter yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableInventory = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/inventory?status=in_storage&per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setAvailableInventory(data.data);
      } else {
        console.error('Kullanılabilir envanter verileri alınamadı:', data);
        setError('Kullanılabilir envanter yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Kullanılabilir envanter verileri çekilirken hata oluştu:', error);
      setError('Kullanılabilir envanter yüklenirken bir hata oluştu.');
    }
  };

  const handleAssignInventory = async () => {
    if (!token || !selectedItem) return;
    
    setIsAdding(true);
    setError('');
    setSuccess('');
    
    try {
      // Using the new direct assignment endpoint
      const response = await fetch(`https://api.blexi.co/api/v1/inventory/${selectedItem}/assign-to-bed/${bedId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Envanter başarıyla yatağa atandı.');
        fetchBedInventory(); // Refresh inventory list
        setShowAddForm(false);
        setSelectedItem(null);
      } else {
        throw new Error(data.message || 'Envanter atanırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Envanter atama hatası:', error);
      setError(error.message || 'Envanter atanırken bir hata oluştu');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteInventory = async () => {
    if (!token || !itemToDelete) return;
    
    setIsAdding(true);
    setError('');
    setSuccess('');
    
    try {
      // Using the new unassign endpoint
      const response = await fetch(`https://api.blexi.co/api/v1/inventory/${itemToDelete}/unassign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Envanter başarıyla yataktan kaldırıldı.');
        setInventory(prev => prev.filter(item => item.id !== itemToDelete));
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        throw new Error(data.message || 'Envanter kaldırılırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Envanter kaldırma hatası:', error);
      setError(error.message || 'Envanter kaldırılırken bir hata oluştu');
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setSelectedItem(null);
    setError('');
    fetchAvailableInventory();
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'furniture': return 'Mobilya';
      case 'appliance': return 'Beyaz Eşya';
      case 'linen': return 'Tekstil';
      case 'electronic': return 'Elektronik';
      case 'kitchenware': return 'Mutfak Eşyası';
      case 'decoration': return 'Dekorasyon';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Yatak Envanteri
        </h3>
        <button
          onClick={() => showAddForm ? setShowAddForm(false) : handleOpenAddForm()}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
        >
          {showAddForm ? (
            <span>İptal</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Envanter Ekle</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Add Inventory Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Yeni Envanter Ekle
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Eklenecek Envanter
              </label>
              <select
                value={selectedItem || ''}
                onChange={(e) => setSelectedItem(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="">Envanter Seçin</option>
                {availableInventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.tracking_number} - {item.brand} {item.model} ({getItemTypeLabel(item.item_type)})
                  </option>
                ))}
              </select>
            </div>

            {availableInventory.length === 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
                Eklenebilecek kullanılabilir envanter bulunamadı. Önce yeni envanter oluşturmanız gerekebilir.
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleAssignInventory}
                disabled={isAdding || !selectedItem}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <span>Yatağa Ekle</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : inventory.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Takip No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tür</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marka/Model</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.tracking_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getItemTypeLabel(item.item_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.brand ? (
                      <>
                        <span className="font-medium">{item.brand}</span>
                        {item.model && <span> / {item.model}</span>}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setItemToDelete(item.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Bu yatağa henüz envanter eklenmemiş.
          </p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteInventory}
        title="Envanteri Kaldır"
        message="Bu envanteri yataktan kaldırmak istediğinize emin misiniz?"
        isLoading={isAdding}
        error={error}
      />
    </div>
  );