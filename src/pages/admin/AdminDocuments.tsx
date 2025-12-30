import { useDocumentStore } from '@/store/documents-store'
import { useEmployeeStore } from '@/store/employee-store'
import { api } from '@/lib/api'
import { FileText, Upload, Trash2, Download, Search, File, User } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AdminDocuments() {
    const { documents, fetchDocuments, addDocument, deleteDocument } = useDocumentStore()
    const { employees, fetchEmployees } = useEmployeeStore()

    useEffect(() => {
        fetchDocuments()
        fetchEmployees()
    }, [])

    const [filter, setFilter] = useState<'all' | 'admin' | 'worker'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Upload Form State
    const [uploadForm, setUploadForm] = useState({
        title: '',
        type: 'policy' as const,
        target: 'global' // 'global' or specific employee ID
    })

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === 'all' ? true :
            filter === 'admin' ? doc.uploadedBy === 'admin' :
                doc.uploadedBy === 'worker'

        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault()

        let ownerName = undefined
        if (uploadForm.target !== 'global') {
            const emp = employees.find(e => e.id === uploadForm.target)
            ownerName = emp?.name
        }

        addDocument({
            title: uploadForm.title,
            type: uploadForm.type,
            url: '#', // Mock URL
            size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
            uploadedBy: 'admin',
            ownerId: uploadForm.target === 'global' ? undefined : uploadForm.target,
            ownerName: ownerName
        })

        setIsUploadModalOpen(false)
        setUploadForm({ title: '', type: 'policy', target: 'global' })
    }

    const handleDownload = async (doc: any) => {
        try {
            console.log("Attempting to download:", doc.url);
            const blob = await api.getBlob(doc.url);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = doc.url.split('/').pop() || doc.title;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error("Download failed", error);
            setErrorMessage(`No se pudo descargar el archivo. Posiblemente no exista en el servidor. Detalles: ${error.message || error}`);
            setErrorModalOpen(true);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-400">Gestión de Documentos</h1>
                    <p className="text-indigo-300 text-sm">Repositorio digital de contratos, políticas y legajos.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Upload size={18} />
                    Subir Documento
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-b border-border pb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white hover:bg-white/5'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('admin')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'admin' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white hover:bg-white/5'}`}
                    >
                        Empresa (Global)
                    </button>
                    <button
                        onClick={() => setFilter('worker')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'worker' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white hover:bg-white/5'}`}
                    >
                        De Empleados
                    </button>
                </div>
                <div className="relative flex-1 sm:max-w-xs ml-auto">
                    <Search className="absolute left-3 top-2.5 text-indigo-400/50" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-card border border-border rounded-lg text-indigo-100 placeholder:text-indigo-400/30 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc) => (
                    <div key={doc.id} className="bg-card border border-border rounded-xl p-5 hover:border-indigo-500/30 transition-all group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => deleteDocument(doc.id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${doc.type === 'contract' ? 'bg-blue-500/10 text-blue-400' :
                                doc.type === 'id' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white line-clamp-1" title={doc.title}>{doc.title}</h3>
                                <p className="text-xs text-indigo-300">{doc.uploadDate} • {doc.size}</p>
                            </div>
                        </div>

                        {doc.ownerName && (
                            <div className="mb-4 flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                <User size={14} className="text-indigo-400" />
                                <span className="text-xs text-indigo-200">De: {doc.ownerName}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-indigo-500/10">
                            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400/50">{doc.type}</span>
                            <button
                                onClick={() => handleDownload(doc)}
                                className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-white transition-colors"
                            >
                                <Download size={14} />
                                Descargar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {
                filteredDocs.length === 0 && (
                    <div className="py-12 text-center text-gray-500 border-2 border-dashed border-border rounded-xl">
                        <File className="mx-auto text-gray-600 mb-2" size={32} />
                        <p>No se encontraron documentos.</p>
                    </div>
                )
            }

            {/* Upload Modal */}
            {
                isUploadModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="absolute top-4 right-4 text-indigo-300 hover:text-white transition-colors"
                            >
                                <User size={20} /> {/* Wrong Icon for close, fixing to X */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6">Subir Nuevo Documento</h2>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-300 mb-1">Título del Documento</label>
                                    <input
                                        required
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        placeholder="Ej. Contrato 2024, Política de Privacidad..."
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-400/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-indigo-300 mb-1">Tipo</label>
                                    <select
                                        value={uploadForm.type}
                                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="policy">Política / Manual (Global)</option>
                                        <option value="contract">Contrato</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-indigo-300 mb-1">Asignar a</label>
                                    <select
                                        value={uploadForm.target}
                                        onChange={(e) => setUploadForm({ ...uploadForm, target: e.target.value })}
                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg text-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="global">Todos (Documento General)</option>
                                        <optgroup label="Empleados Específicos">
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="border-2 border-dashed border-indigo-500/30 rounded-lg p-6 text-center hover:bg-indigo-500/5 transition-colors cursor-pointer group">
                                    <Upload className="mx-auto text-indigo-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                    <span className="text-sm text-indigo-300">Arrastra un archivo o haz clic para subir</span>
                                    <p className="text-xs text-indigo-400/50 mt-1">PDF, DOCX, JPG (Max 5MB)</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-4 py-2 text-indigo-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                                    >
                                        Subir Archivo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Error Modal */}
            {
                errorModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in duration-200">
                        <div className="bg-card border border-red-500/30 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Error</h3>
                            <p className="text-indigo-200 mb-6">{errorMessage}</p>
                            <button
                                onClick={() => setErrorModalOpen(false)}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
