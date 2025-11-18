
import { useQuery } from '@tanstack/react-query';
import { arlApi } from '../services/api/arlApi';

export const useARL = () => {
  const { data: arls, isLoading, error } = useQuery({
    queryKey: ['arls'],
    queryFn: arlApi.getAll,
    staleTime: Infinity // ARLs don't change often
  });

  const arlOptions = arls?.map(arl => ({
    value: arl.id.toString(),
    label: arl.nombre
  })) || [];

  return {
    arls,
    arlOptions,
    isLoading,
    error
  };
};
