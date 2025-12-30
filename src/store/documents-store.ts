import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

export interface DocumentRecord {
    id: string
    title: string
    type: 'contract' | 'policy' | 'id' | 'cv' | 'other'
    url: string
    size: string // e.g. "2.4 MB"
    uploadDate: string
    uploadedBy: 'admin' | 'worker'
    ownerId?: string // If uploaded by worker, their ID. If null, it's a global doc (admin).
    ownerName?: string
}

// @ts-ignore
import { api } from '../lib/api';

interface DocumentState {
    documents: DocumentRecord[]
    isLoading: boolean
    fetchDocuments: (userId?: string) => Promise<void>
    addDocument: (doc: any, file?: File) => Promise<void>
    deleteDocument: (id: string) => Promise<void>
    getGlobalDocuments: () => DocumentRecord[]
    getWorkerDocuments: (workerId: string) => DocumentRecord[]
}

export const useDocumentStore = create<DocumentState>()(
    persist(
        (set, get) => ({
            documents: [],
            isLoading: false,
            fetchDocuments: async (userId) => {
                try {
                    set({ isLoading: true });
                    // If userId is provided, fetch specific user docs. Otherwise, fetch ALL (admin).
                    const url = userId ? `/documents/user/${userId}` : '/documents';
                    const data = await api.get(url);

                    if (!Array.isArray(data)) {
                        console.error("API did not return an array", data);
                        set({ documents: [], isLoading: false });
                        return;
                    }
                    const documents = data.map((d: any) => ({
                        id: d.id.toString(),
                        title: d.titulo,
                        type: d.tipo.toLowerCase(),
                        url: d.url,
                        size: d.tamano || '0 MB',
                        uploadDate: format(new Date(d.fechaSubida), 'PP'), // Using date-fns for cleaner date
                        uploadedBy: d.subidoPor.toLowerCase(), // 'admin' | 'worker'
                        ownerId: d.idPropietario ? d.idPropietario.toString() : undefined,
                        ownerName: d.usuario ? d.usuario.nombre : 'Empresa'
                    }));
                    set({ documents, isLoading: false });
                } catch (e) {
                    console.error("Fetch documents failed", e);
                    set({ isLoading: false });
                }
            },
            addDocument: async (docData, file) => {
                try {
                    const formData = new FormData();
                    formData.append('titulo', docData.title);
                    formData.append('tipo', docData.type);
                    formData.append('usuarioId', docData.ownerId);
                    formData.append('subidoPor', docData.uploadedBy);
                    if (file) {
                        formData.append('file', file);
                    }

                    const d = await api.post('/documents', formData);

                    // Optimistic update using returned data
                    const newDoc: DocumentRecord = {
                        id: d.id.toString(),
                        title: d.titulo,
                        type: d.tipo.toLowerCase(),
                        url: d.url,
                        size: d.tamano || '0 MB',
                        uploadDate: format(new Date(d.fechaSubida), 'PP'),
                        uploadedBy: d.subidoPor.toLowerCase(),
                        ownerId: d.idPropietario ? d.idPropietario.toString() : undefined,
                        ownerName: d.usuario ? d.usuario.nombre : 'Empresa'
                    };

                    set(state => ({
                        documents: [...state.documents, newDoc]
                    }));
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            },
            deleteDocument: async (id) => {
                try {
                    await api.delete(`/documents/${id}`);
                    // Optimistic update
                    set((state) => ({
                        documents: state.documents.filter((d) => d.id !== id)
                    }));
                } catch (e) {
                    console.error("Delete failed", e);
                }
            },
            getGlobalDocuments: () => {
                return get().documents.filter(d => d.uploadedBy === 'admin')
            },
            getWorkerDocuments: (workerId) => {
                return get().documents.filter(d => d.ownerId === workerId || d.uploadedBy === 'admin')
            }
        }),
        {
            name: 'documents-storage',
            partialize: (_state) => ({ documents: [] as DocumentRecord[] }), // Don't persist
        }
    )
)
