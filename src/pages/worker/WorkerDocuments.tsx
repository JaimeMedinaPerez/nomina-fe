import { useRef, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useDocumentStore } from '@/store/documents-store'
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle, X, File, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WorkerDocuments() {
    const { user } = useAuthStore()
    const { documents, fetchDocuments, addDocument, deleteDocument, isLoading } = useDocumentStore()
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Modal states
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string } | null>(null)
    const [successModal, setSuccessModal] = useState(false)

    useEffect(() => {
        if (user) {
            fetchDocuments(user.id)
        }
    }, [user])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        try {
            await addDocument({
                title: file.name,
                type: 'other', // Default type
                ownerId: user.id,
                uploadedBy: 'worker'
            }, file)

            setUploadModalOpen(false)
            setSuccessModal(true)
            setTimeout(() => setSuccessModal(false), 3000)
        } catch (err: any) {
            console.error("Upload failed", err)
            setErrorModal({ isOpen: true, message: err.message || 'Error al subir el documento.' })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDelete = async (docId: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return
        try {
            await deleteDocument(docId)
        } catch (err) {
            alert('Error al eliminar')
        }
    }

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = `http://localhost:3000${url}`;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon size={32} />
        if (['pdf'].includes(ext || '')) return <FileText size={32} />
        return <File size={32} />
    }

    const getFileColor = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        if (['pdf'].includes(ext || '')) return 'bg-red-500/10 text-red-400 border-red-500/20'
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Mis Documentos</h1>
                    <p className="text-indigo-300 mt-1">Gestiona tus archivos y documentos importantes</p>
                </div>
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 font-medium"
                >
                    <Upload size={20} />
                    Subir Documento
                </button>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {uploadModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0f102a] border border-indigo-500/20 rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-2 text-center">Subir Archivo</h2>
                            <p className="text-gray-400 text-center mb-8 text-sm">Selecciona un archivo PDF o imagen para subir a tu perfil.</p>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/5 rounded-2xl p-10 cursor-pointer transition-all group text-center"
                            >
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Upload size={32} />
                                </div>
                                <p className="text-indigo-300 font-medium">Haz clic para seleccionar</p>
                                <p className="text-xs text-indigo-400/60 mt-2">Máximo 5MB</p>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />

                            {isUploading && (
                                <div className="mt-6">
                                    <div className="flex justify-between text-xs text-indigo-300 mb-1">
                                        <span>Subiendo...</span>
                                        <span>Please wait</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-full animate-progress-indeterminate"></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Modal */}
            <AnimatePresence>
                {errorModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-[#0f102a] border border-red-500/20 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Error</h3>
                            <p className="text-gray-400 mb-6">{errorModal.message}</p>
                            <button
                                onClick={() => setErrorModal(null)}
                                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {successModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-[#0f102a] border border-green-500/20 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¡Éxito!</h3>
                            <p className="text-gray-400">Documento subido correctamente.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Documents Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-card/30 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <FileText size={40} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sin documentos</h3>
                    <p className="text-indigo-300/60 max-w-sm mx-auto">Sube tus documentos importantes aquí para tenerlos siempre a mano.</p>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    {documents.map((doc) => (
                        <motion.div
                            key={doc.id}
                            variants={item}
                            className="bg-card/40 hover:bg-card/60 border border-white/5 hover:border-indigo-500/30 p-5 rounded-2xl transition-all group relative overflow-hidden flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-4 rounded-xl border ${getFileColor(doc.url)} group-hover:scale-105 transition-transform`}>
                                    {getFileIcon(doc.url)}
                                </div>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="mb-4 flex-1">
                                <h3 className="text-white font-medium truncate mb-1" title={doc.title}>
                                    {doc.title}
                                </h3>
                                <div className="flex justify-between items-center text-xs text-indigo-300/60">
                                    <span className="font-mono">{doc.size}</span>
                                    <span>{doc.uploadDate}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(doc.url, doc.title)}
                                className="w-full py-2.5 bg-white/5 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <Download size={16} />
                                Descargar
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
