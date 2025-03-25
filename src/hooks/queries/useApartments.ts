import { useCallback } from 'react';
import { apartmentsApi, ApartmentFilters } from '../../lib/api/apartments';
import { useApi } from '../useApi';
import { IApartment } from '../../types/models';

export function useApartments() {
  const getAllApi = useApi<IApartment[]>();
  const getByIdApi = useApi<IApartment>();
  const createApi = useApi<IApartment>();
  const updateApi = useApi<IApartment>();
  const deleteApi = useApi<void>();
  const getFeaturesApi = useApi();
  const addFeatureApi = useApi();
  const removeFeatureApi = useApi();
  const getInventoryApi = useApi();

  const getAll = useCallback(
    async (filters?: ApartmentFilters) => {
      return getAllApi.execute(apartmentsApi.getAll(filters));
    },
    [getAllApi]
  );

  const getById = useCallback(
    async (id: string) => {
      return getByIdApi.execute(apartmentsApi.getById(id));
    },
    [getByIdApi]
  );

  const create = useCallback(
    async (data: Partial<IApartment>) => {
      return createApi.execute(apartmentsApi.create(data));
    },
    [createApi]
  );

  const update = useCallback(
    async (id: string, data: Partial<IApartment>) => {
      return updateApi.execute(apartmentsApi.update(id, data));
    },
    [updateApi]
  );

  const remove = useCallback(
    async (id: string) => {
      return deleteApi.execute(apartmentsApi.delete(id));
    },
    [deleteApi]
  );

  const getFeatures = useCallback(
    async (apartmentId: string) => {
      return getFeaturesApi.execute(apartmentsApi.getFeatures(apartmentId));
    },
    [getFeaturesApi]
  );

  const addFeature = useCallback(
    async (apartmentId: string, featureId: string) => {
      return addFeatureApi.execute(apartmentsApi.addFeature(apartmentId, featureId));
    },
    [addFeatureApi]
  );

  const removeFeature = useCallback(
    async (apartmentId: string, featureId: string) => {
      return removeFeatureApi.execute(apartmentsApi.removeFeature(apartmentId, featureId));
    },
    [removeFeatureApi]
  );

  const getInventory = useCallback(
    async (apartmentId: string) => {
      return getInventoryApi.execute(apartmentsApi.getInventory(apartmentId));
    },
    [getInventoryApi]
  );

  return {
    apartments: {
      data: getAllApi.data,
      isLoading: getAllApi.isLoading,
      error: getAllApi.error,
      getAll,
    },
    apartment: {
      data: getByIdApi.data,
      isLoading: getByIdApi.isLoading,
      error: getByIdApi.error,
      getById,
    },
    create: {
      data: createApi.data,
      isLoading: createApi.isLoading,
      error: createApi.error,
      execute: create,
    },
    update: {
      data: updateApi.data,
      isLoading: updateApi.isLoading,
      error: updateApi.error,
      execute: update,
    },
    delete: {
      isLoading: deleteApi.isLoading,
      error: deleteApi.error,
      execute: remove,
    },
    features: {
      data: getFeaturesApi.data,
      isLoading: getFeaturesApi.isLoading,
      error: getFeaturesApi.error,
      getFeatures,
      addFeature,
      removeFeature,
    },
    inventory: {
      data: getInventoryApi.data,
      isLoading: getInventoryApi.isLoading,
      error: getInventoryApi.error,
      getInventory,
    },
  };
}