export interface Board {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  projectId?: string;
}
