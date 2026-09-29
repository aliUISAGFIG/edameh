import { useQuery } from '@tanstack/react-query';
import { api } from './endpoints';
export const useMe = () =>
  useQuery({ queryKey: ['session'], queryFn: api.me, retry: false, staleTime: 60_000 });
export const useCategories = () =>
  useQuery({ queryKey: ['kategorien'], queryFn: api.categories, staleTime: 300_000 });
export const useTechnologies = () =>
  useQuery({ queryKey: ['technologien'], queryFn: api.technologies, staleTime: 300_000 });
export const useAnzeige = (id: number) =>
  useQuery({
    queryKey: ['anzeigen', 'detail', id],
    queryFn: () => api.anzeige(id),
    enabled: Number.isFinite(id),
    retry: false,
  });
export const useConversations = (enabled = true) =>
  useQuery({ queryKey: ['unterhaltungen'], queryFn: api.conversations, enabled });
