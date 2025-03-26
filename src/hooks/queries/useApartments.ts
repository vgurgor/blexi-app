import { useCallback } from 'react';
import { apartsApi, ApartFilters, ApartDto } from '../../lib/api/apartments';
import { useApi } from '../useApi';
import { IApartment } from '../../types/models';

export function useApartments() {
  const getAllApi = useApi<ApartDto[]>();
  const getByIdApi = useApi<ApartDto>();
  const createApi = useApi<ApartDto>();
  const updateApi = useApi<ApartDto>();
  const deleteApi = useApi<void>();
  const getFeaturesApi = useApi();
  const addFeatureApi = useApi();
  const removeFeatureApi = useApi();
  const getInventoryApi = useApi();

  const getAll = useCallback(
    async (filters?: ApartFilters) => {
      return getAllApi.execute(apartsApi.getAll(filters));
    },
    [getAllApi]
  );

  const getById = useCallback(
    async (id: string) => {
      return getByIdApi.execute(apartsApi.getById(id));
    },
    [getByIdApi]
  );

  const create = useCallback(
    async (data: Partial<IApartment>) => {
      return createApi.execute(apartsApi.create(data));
    },
    [createApi]
  );

  const update = useCallback(
    async (id: string, data: Partial<IApartment>) => {
      return updateApi.execute(apartsApi.update(id, data));
    },
    [updateApi]
  );

  const remove = useCallback(
    async (id: string) => {
      return deleteApi.execute(apartsApi.delete(id));
    },
    [deleteApi]
  );

  const getFeatures = useCallback(
    async (apartmentId: string) => {
      return getFeaturesApi.execute(apartsApi.getFeatures(apartmentId));
    },
    [getFeaturesApi]
  );

  const addFeature = useCallback(
    async (apartmentId: string, featureId: string) => {
      return addFeatureApi.execute(apartsApi.addFeature(apartmentId, featureId));
    },
    [addFeatureApi]
  );

  const removeFeature = useCallback(
    async (apartmentId: string, featureId: string) => {
      return removeFeatureApi.execute(apartsApi.removeFeature(apartmentId, featureId));
    },
    [removeFeatureApi]
  );

  const getInventory = useCallback(
    async (apartmentId: string) => {
      return getInventoryApi.execute(apartsApi.getInventory(apartmentId));
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