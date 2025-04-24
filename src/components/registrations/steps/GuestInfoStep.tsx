'use client';

import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Search, User, Phone, Mail, Calendar, MapPin, Briefcase, AlertCircle, Shield } from 'lucide-react';
import { FormInput, FormCheckbox, FormSelect } from '@/components/ui';
import { Button } from '@/components/ui/atoms/Button';
import { peopleApi } from '@/lib/api/people';
import { guestsApi } from '@/lib/api/guests';
import { guardiansApi } from '@/lib/api/guardians';
import { useToast } from '@/hooks/useToast';

export default function GuestInfoStep() {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const [isCreatingGuardian, setIsCreatingGuardian] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [showGuardianForm, setShowGuardianForm] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState('');
  const [guardianSearchResults, setGuardianSearchResults] = useState<any[]>([]);
  const [showGuardianResults, setShowGuardianResults] = useState(false);
  const [isSearchingGuardian, setIsSearchingGuardian] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const toast = useToast();

  const guestId = watch('guest_id');
  const guestType = watch('guest_type');
  const isSelfGuardian = watch('is_self_guardian') || false;

  // Convert text to uppercase with Turkish character support
  const toUpperCase = (text: string): string => {
    if (!text) return '';
    return text.toLocaleUpperCase('tr-TR');
  };

  // Search for existing people
  const handleSearch = async () => {
    // Clear previous results and reset search state if term is too short
    if (!searchTerm || searchTerm.length < 3) {
      setSearchResults([]);
      if (showResults) setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      // Search for people by name or phone
      let name = searchTerm;
      let phone = undefined;
      
      // Check if searchTerm is a number
      if (/^\d+$/.test(searchTerm)) {
        name = '';
        phone = searchTerm;
      }
      
      const response = await peopleApi.getAll(undefined, name, undefined, undefined, phone, 1, 10);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      // Don't show empty results on error
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Search for guardian
  const handleGuardianSearch = async () => {
    if (!guardianSearchTerm || guardianSearchTerm.length < 3) {
      setGuardianSearchResults([]);
      if (showGuardianResults) setShowGuardianResults(false);
      return;
    }
    
    setIsSearchingGuardian(true);
    setShowGuardianResults(true);
    
    try {
      // Search for people by name or phone
      let name = guardianSearchTerm;
      let phone = undefined;
      
      // Check if searchTerm is a number
      if (/^\d+$/.test(guardianSearchTerm)) {
        name = '';
        phone = guardianSearchTerm;
      }
      
      const response = await peopleApi.getAll(undefined, name, undefined, undefined, phone, 1, 10);
      
      if (response.success && response.data) {
        setGuardianSearchResults(response.data);
      } else {
        setGuardianSearchResults([]);
      }
    } catch (error) {
      console.error('Guardian search error:', error);
      setGuardianSearchResults([]);
      setShowGuardianResults(false);
    } finally {
      setIsSearchingGuardian(false);
    }
  };

  // Select a person from search results
  const handleSelectPerson = (person: any) => {
    setSelectedPerson(person);
    setShowResults(false);
    
    // Check if this person is already a guest
    checkExistingGuest(person.id);
    
    // Set form values
    setValue('person.id', person.id);
    setValue('person.name', toUpperCase(person.name));
    setValue('person.surname', toUpperCase(person.surname));
    setValue('person.gender', person.gender || 'MALE');
    setValue('person.tc_no', person.tcNo);
    setValue('person.phone', person.phone);
    setValue('person.email', person.email || '');
    setValue('person.birth_date', person.birthDate);
    setValue('person.address', person.address || '');
    setValue('person.city', toUpperCase(person.city || ''));
  };

  // Select a guardian from search results
  const handleSelectGuardian = (person: any) => {
    setSelectedGuardian(person);
    setShowGuardianResults(false);
    
    // Set guardian form values
    setValue('guardian.person_id', person.id);
    setValue('guardian.name', toUpperCase(person.name));
    setValue('guardian.surname', toUpperCase(person.surname));
    setValue('guardian.phone', person.phone);
    setValue('guardian.email', person.email || '');
  };

  // Check if a person is already registered as a guest
  const checkExistingGuest = async (personId: string) => {
    try {
      // Search for guests with this person ID
      const response = await guestsApi.search(undefined, undefined, 'ACTIVE', 1, 1);
      
      const existingGuest = response.data?.find(guest => guest.personId === personId);
      
      if (existingGuest) {
        // If guest exists, set the guest_id
        setValue('guest_id', existingGuest.id);
        setValue('guest_type', existingGuest.guestType);
        setValue('profession_department', existingGuest.professionDepartment || '');
        
        toast.info('Bu kişi zaten misafir olarak kayıtlı. Bilgileri otomatik dolduruldu.');
      } else {
        // If not a guest, clear guest_id
        setValue('guest_id', undefined);
      }
    } catch (error) {
      console.error('Error checking existing guest:', error);
    }
  };

  // Create a new person
  const handleCreatePerson = async () => {
    const personData = {
      name: toUpperCase(watch('person.name')),
      surname: toUpperCase(watch('person.surname')),
      gender: watch('person.gender'),
      tc_no: watch('person.tc_no'),
      phone: watch('person.phone'),
      email: watch('person.email'),
      birth_date: watch('person.birth_date'),
      address: watch('person.address'),
      city: toUpperCase(watch('person.city')),
    };
    
    // Validate required fields
    if (!personData.name || !personData.surname || !personData.gender || !personData.tc_no || !personData.phone || !personData.birth_date) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    setIsCreatingPerson(true);
    
    try {
      const response = await peopleApi.create(personData);
      
      if (response.success && response.data) {
        setSelectedPerson(response.data);
        setValue('person.id', response.data.id);
        toast.success('Kişi başarıyla oluşturuldu');
        
        // Now create a guest record
        handleCreateGuest(response.data.id);
      } else {
        toast.error(response.error || 'Kişi oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error creating person:', error);
      toast.error(error.message || 'Kişi oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingPerson(false);
    }
  };

  // Create a new guest
  const handleCreateGuest = async (personId: string) => {
    const guestData = {
      person_id: parseInt(personId),
      guest_type: guestType,
      profession_department: watch('profession_department'),
      emergency_contact: watch('emergency_contact'),
    };
    
    setIsCreatingGuest(true);
    
    try {
      const response = await guestsApi.create(guestData);
      
      if (response.success && response.data) {
        setValue('guest_id', response.data.id);
        toast.success('Misafir kaydı başarıyla oluşturuldu');
        
        // If self guardian is checked, create a guardian record
        if (isSelfGuardian) {
          handleCreateSelfGuardian(response.data.id, personId);
        }
      } else {
        toast.error(response.error || 'Misafir kaydı oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error creating guest:', error);
      toast.error(error.message || 'Misafir kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingGuest(false);
    }
  };

  // Create a self guardian record
  const handleCreateSelfGuardian = async (guestId: string, personId: string) => {
    const guardianData = {
      person_id: parseInt(personId),
      guest_id: parseInt(guestId),
      relationship: 'SELF',
      is_self: true,
      is_emergency_contact: true,
      valid_from: new Date().toISOString().split('T')[0],
    };
    
    setIsCreatingGuardian(true);
    
    try {
      const response = await guardiansApi.create(guardianData);
      
      if (response.success && response.data) {
        toast.success('Kendi veliliği başarıyla oluşturuldu');
        
        // Add to guardians array for form submission
        const guardians = watch('guardians') || [];
        setValue('guardians', [...guardians, {
          person_id: parseInt(personId),
          relationship: 'SELF',
          is_self: true,
          is_emergency_contact: true,
          valid_from: new Date().toISOString().split('T')[0],
        }]);
      } else {
        toast.error(response.error || 'Veli kaydı oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error creating guardian:', error);
      toast.error(error.message || 'Veli kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingGuardian(false);
    }
  };

  // Create a guardian record
  const handleCreateGuardian = async () => {
    if (!guestId) {
      toast.error('Önce misafir kaydı oluşturmalısınız');
      return;
    }
    
    if (!selectedGuardian) {
      toast.error('Lütfen bir veli seçin veya oluşturun');
      return;
    }
    
    const relationship = watch('guardian.relationship');
    if (!relationship) {
      toast.error('Lütfen yakınlık derecesi belirtin');
      return;
    }
    
    const guardianData = {
      person_id: parseInt(selectedGuardian.id),
      guest_id: parseInt(guestId),
      relationship: relationship,
      is_self: false,
      is_emergency_contact: watch('guardian.is_emergency_contact') || false,
      valid_from: new Date().toISOString().split('T')[0],
      notes: watch('guardian.notes') || '',
    };
    
    setIsCreatingGuardian(true);
    
    try {
      const response = await guardiansApi.create(guardianData);
      
      if (response.success && response.data) {
        toast.success('Veli kaydı başarıyla oluşturuldu');
        
        // Add to guardians array for form submission
        const guardians = watch('guardians') || [];
        setValue('guardians', [...guardians, {
          person_id: parseInt(selectedGuardian.id),
          relationship: relationship,
          is_self: false,
          is_emergency_contact: watch('guardian.is_emergency_contact') || false,
          valid_from: new Date().toISOString().split('T')[0],
          notes: watch('guardian.notes') || '',
        }]);
        
        // Reset guardian form
        setSelectedGuardian(null);
        setValue('guardian.person_id', '');
        setValue('guardian.name', '');
        setValue('guardian.surname', '');
        setValue('guardian.phone', '');
        setValue('guardian.email', '');
        setValue('guardian.relationship', '');
        setValue('guardian.is_emergency_contact', false);
        setValue('guardian.notes', '');
        setGuardianSearchTerm('');
        setShowGuardianForm(false);
      } else {
        toast.error(response.error || 'Veli kaydı oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error creating guardian:', error);
      toast.error(error.message || 'Veli kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingGuardian(false);
    }
  };

  // Create a new guardian person
  const handleCreateGuardianPerson = async () => {
    const personData = {
      name: toUpperCase(watch('guardian.name')),
      surname: toUpperCase(watch('guardian.surname')),
      gender: watch('guardian.gender') || 'MALE',
      tc_no: watch('guardian.tc_no'),
      phone: watch('guardian.phone'),
      email: watch('guardian.email'),
      birth_date: watch('guardian.birth_date') || new Date().toISOString().split('T')[0],
    };
    
    // Validate required fields
    if (!personData.name || !personData.surname || !personData.tc_no || !personData.phone) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    setIsCreatingPerson(true);
    
    try {
      const response = await peopleApi.create(personData);
      
      if (response.success && response.data) {
        setSelectedGuardian(response.data);
        setValue('guardian.person_id', response.data.id);
        toast.success('Veli kişi kaydı başarıyla oluşturuldu');
        
        // Now create a guardian record
        if (guestId) {
          const guardianData = {
            person_id: parseInt(response.data.id),
            guest_id: parseInt(guestId),
            relationship: watch('guardian.relationship'),
            is_self: false,
            is_emergency_contact: watch('guardian.is_emergency_contact') || false,
            valid_from: new Date().toISOString().split('T')[0],
            notes: watch('guardian.notes') || '',
          };
          
          const guardianResponse = await guardiansApi.create(guardianData);
          
          if (guardianResponse.success && guardianResponse.data) {
            toast.success('Veli kaydı başarıyla oluşturuldu');
            
            // Add to guardians array for form submission
            const guardians = watch('guardians') || [];
            setValue('guardians', [...guardians, {
              person_id: parseInt(response.data.id),
              relationship: watch('guardian.relationship'),
              is_self: false,
              is_emergency_contact: watch('guardian.is_emergency_contact') || false,
              valid_from: new Date().toISOString().split('T')[0],
              notes: watch('guardian.notes') || '',
            }]);
            
            // Reset guardian form
            setSelectedGuardian(null);
            setValue('guardian.person_id', '');
            setValue('guardian.name', '');
            setValue('guardian.surname', '');
            setValue('guardian.phone', '');
            setValue('guardian.email', '');
            setValue('guardian.relationship', '');
            setValue('guardian.is_emergency_contact', false);
            setValue('guardian.notes', '');
            setGuardianSearchTerm('');
            setShowGuardianForm(false);
          }
        }
      } else {
        toast.error(response.error || 'Veli kişi kaydı oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error creating guardian person:', error);
      toast.error(error.message || 'Veli kişi kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingPerson(false);
    }
  };

  // Handle input change with uppercase conversion
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    setValue(fieldName, toUpperCase(value));
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Misafir Bilgileri
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Misafir kişisel bilgilerini girin veya mevcut bir kişiyi arayın.
        </p>
      </div>

      {/* Search for existing people */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mevcut Kişi Ara
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim veya telefon numarası ile ara..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2"
            size="sm"
            isLoading={isSearching}
            disabled={!searchTerm || searchTerm.length < 3}
          >
            Ara
          </Button>
        </div>
        {searchTerm && searchTerm.length < 3 && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Arama için en az 3 karakter gereklidir
          </p>
        )}

        {/* Search Results */}
        {showResults && (
          <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Aranıyor...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <ul>
                {searchResults.map((person) => (
                  <li 
                    key={person.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    onClick={() => handleSelectPerson(person)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{person.name} {person.surname}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{person.phone}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sonuç bulunamadı</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yeni kişi oluşturmak için aşağıdaki formu doldurun</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guest Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Misafir Tipi*
        </label>
        <Controller
          name="guest_type"
          control={control}
          render={({ field }) => (
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'STUDENT' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                <input
                  type="radio"
                  {...field}
                  value="STUDENT"
                  checked={field.value === 'STUDENT'}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'STUDENT' ? 'border-blue-500' : 'border-gray-400'}`}>
                  {field.value === 'STUDENT' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
                <span className={field.value === 'STUDENT' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Öğrenci</span>
              </label>
              
              <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'EMPLOYEE' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                <input
                  type="radio"
                  {...field}
                  value="EMPLOYEE"
                  checked={field.value === 'EMPLOYEE'}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'EMPLOYEE' ? 'border-blue-500' : 'border-gray-400'}`}>
                  {field.value === 'EMPLOYEE' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
                <span className={field.value === 'EMPLOYEE' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Çalışan</span>
              </label>
              
              <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'OTHER' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                <input
                  type="radio"
                  {...field}
                  value="OTHER"
                  checked={field.value === 'OTHER'}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'OTHER' ? 'border-blue-500' : 'border-gray-400'}`}>
                  {field.value === 'OTHER' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
                <span className={field.value === 'OTHER' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Diğer</span>
              </label>
            </div>
          )}
        />
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ad*
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="person.name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Ad"
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.person?.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  onChange={(e) => handleInputChange(e, 'person.name')}
                />
              )}
            />
            {errors.person?.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.person.name.message as string}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Soyad*
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="person.surname"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Soyad"
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.person?.surname ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  onChange={(e) => handleInputChange(e, 'person.surname')}
                />
              )}
            />
            {errors.person?.surname && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.person.surname.message as string}</p>
            )}
          </div>
        </div>
        
        <FormSelect
          name="person.gender"
          label="Cinsiyet*"
          options={[
            { value: 'MALE', label: 'Erkek' },
            { value: 'FEMALE', label: 'Kadın' }
          ]}
        />
        
        <FormInput
          name="person.tc_no"
          label="TC Kimlik No*"
          placeholder="11 haneli TC Kimlik No"
          leftIcon={<User className="w-5 h-5 text-gray-400" />}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefon*
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="person.phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  placeholder="(5XX) XXX XX XX"
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.person?.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, '');
                    
                    // Format the phone number
                    let formattedValue = '';
                    if (value.length > 0) {
                      formattedValue = '(';
                      if (value.length > 0) {
                        formattedValue += value.substring(0, 3);
                      }
                      if (value.length > 3) {
                        formattedValue += ') ' + value.substring(3, 6);
                      }
                      if (value.length > 6) {
                        formattedValue += ' ' + value.substring(6, 8);
                      }
                      if (value.length > 8) {
                        formattedValue += ' ' + value.substring(8, 10);
                      }
                    }
                    
                    field.onChange(formattedValue);
                  }}
                />
              )}
            />
            {errors.person?.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.person.phone.message as string}</p>
            )}
          </div>
        </div>
        
        <FormInput
          name="person.email"
          label="E-posta"
          placeholder="ornek@email.com"
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
        />
        
        <FormInput
          name="person.birth_date"
          label="Doğum Tarihi*"
          type="date"
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
        />
        
        {guestType === 'STUDENT' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bölüm/Fakülte
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Controller
                name="profession_department"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    onChange={(e) => handleInputChange(e, 'profession_department')}
                  />
                )}
              />
            </div>
          </div>
        )}
        
        {guestType === 'EMPLOYEE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Çalıştığı Kurum/Departman
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Controller
                name="profession_department"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Örn: ABC Şirketi / Muhasebe"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    onChange={(e) => handleInputChange(e, 'profession_department')}
                  />
                )}
              />
            </div>
          </div>
        )}
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adres
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Controller
              name="person.address"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Adres"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              )}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Şehir
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="person.city"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Şehir"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  onChange={(e) => handleInputChange(e, 'person.city')}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Guardian Information */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Veli Bilgileri</h3>
        </div>
        
        <div className="mb-4">
          <FormCheckbox
            name="is_self_guardian"
            label="Kendisi veli olarak atansın"
            description="Misafir kendi velisi olarak atanır (18 yaş üstü için)"
          />
        </div>

        {!isSelfGuardian && (
          <div className="space-y-6">
            {!showGuardianForm ? (
              <div className="flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Veli bilgisi eklemek için aşağıdaki butonu kullanın.
                </p>
                <Button
                  onClick={() => setShowGuardianForm(true)}
                  variant="secondary"
                  size="sm"
                >
                  Veli Ekle
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Veli Bilgileri
                </h4>
                
                {/* Search for existing guardian */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mevcut Kişi Ara
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={guardianSearchTerm}
                      onChange={(e) => setGuardianSearchTerm(e.target.value)}
                      placeholder="İsim veya telefon numarası ile ara..."
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                    <Button
                      onClick={handleGuardianSearch}
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      size="sm"
                      isLoading={isSearchingGuardian}
                      disabled={!guardianSearchTerm || guardianSearchTerm.length < 3}
                    >
                      Ara
                    </Button>
                  </div>
                  
                  {/* Guardian Search Results */}
                  {showGuardianResults && (
                    <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isSearchingGuardian ? (
                        <div className="p-4 text-center">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Aranıyor...</p>
                        </div>
                      ) : guardianSearchResults.length > 0 ? (
                        <ul>
                          {guardianSearchResults.map((person) => (
                            <li 
                              key={person.id}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                              onClick={() => handleSelectGuardian(person)}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{person.name} {person.surname}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{person.phone}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Sonuç bulunamadı</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yeni kişi oluşturmak için aşağıdaki formu doldurun</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Guardian Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ad*
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Controller
                        name="guardian.name"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Ad"
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                            onChange={(e) => handleInputChange(e, 'guardian.name')}
                          />
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Soyad*
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Controller
                        name="guardian.surname"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Soyad"
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                            onChange={(e) => handleInputChange(e, 'guardian.surname')}
                          />
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormInput
                    name="guardian.tc_no"
                    label="TC Kimlik No*"
                    placeholder="11 haneli TC Kimlik No"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefon*
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Controller
                        name="guardian.phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            placeholder="(5XX) XXX XX XX"
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                            onChange={(e) => {
                              // Only allow digits
                              const value = e.target.value.replace(/\D/g, '');
                              
                              // Format the phone number
                              let formattedValue = '';
                              if (value.length > 0) {
                                formattedValue = '(';
                                if (value.length > 0) {
                                  formattedValue += value.substring(0, 3);
                                }
                                if (value.length > 3) {
                                  formattedValue += ') ' + value.substring(3, 6);
                                }
                                if (value.length > 6) {
                                  formattedValue += ' ' + value.substring(6, 8);
                                }
                                if (value.length > 8) {
                                  formattedValue += ' ' + value.substring(8, 10);
                                }
                              }
                              
                              field.onChange(formattedValue);
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormInput
                    name="guardian.email"
                    label="E-posta"
                    placeholder="ornek@email.com"
                    leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                  />
                  
                  <FormSelect
                    name="guardian.relationship"
                    label="Yakınlık Derecesi*"
                    options={[
                      { value: 'PARENT', label: 'Ebeveyn' },
                      { value: 'SIBLING', label: 'Kardeş' },
                      { value: 'RELATIVE', label: 'Akraba' },
                      { value: 'SPOUSE', label: 'Eş' },
                      { value: 'OTHER', label: 'Diğer' }
                    ]}
                  />
                  
                  <div className="md:col-span-2">
                    <FormCheckbox
                      name="guardian.is_emergency_contact"
                      label="Acil durum kişisi olarak belirle"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notlar
                    </label>
                    <Controller
                      name="guardian.notes"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                          placeholder="Ek bilgiler..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setShowGuardianForm(false)}
                    variant="secondary"
                    size="sm"
                  >
                    İptal
                  </Button>
                  
                  {selectedGuardian ? (
                    <Button
                      onClick={handleCreateGuardian}
                      variant="primary"
                      size="sm"
                      isLoading={isCreatingGuardian}
                    >
                      Veli Olarak Ekle
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateGuardianPerson}
                      variant="primary"
                      size="sm"
                      isLoading={isCreatingPerson}
                    >
                      Kişi Oluştur ve Veli Olarak Ekle
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Person/Guest Button */}
      {!guestId && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Bu kişi için misafir kaydı oluşturulması gerekiyor</span>
            </div>
            <Button
              onClick={handleCreatePerson}
              isLoading={isCreatingPerson || isCreatingGuest || isCreatingGuardian}
              disabled={!watch('person.name') || !watch('person.surname') || !watch('person.gender') || !watch('person.tc_no') || !watch('person.phone') || !watch('person.birth_date')}
            >
              {selectedPerson ? 'Misafir Kaydı Oluştur' : 'Kişi ve Misafir Kaydı Oluştur'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}