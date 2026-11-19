import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../services/api";

export function useResource(key, endpoint) {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: [key], queryFn: () => api.get(endpoint).then((r) => r.data) });
  const mutationOptions = (action, success) => ({
    mutationFn: (input) => action(input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [key] }); toast.success(success); },
    onError: (error) => toast.error(error.response?.data?.message ?? "Request failed")
  });
  const create = useMutation(mutationOptions((body) => api.post(endpoint, body), "Created successfully"));
  const update = useMutation(mutationOptions(({ id, ...body }) => api.put(`${endpoint}/${id}`, body), "Updated successfully"));
  const remove = useMutation(mutationOptions((id) => api.delete(`${endpoint}/${id}`), "Deleted successfully"));

  return { list, create, update, remove };
}
