/**
 * [INPUT]: 依赖 backend API 下载模板和上传文件
 * [OUTPUT]: 对外提供 ImportModal 组件，用于批量导入关系资产数据
 * [POS]: components/ImportModal，业务模态框组件，被 Dashboard 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import { insforge } from '../lib/insforge';
import { API_BASE } from '../lib/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ total: number; created: number; updated: number; errors: number; firstError?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setImportStatus = useContactStore(s => s.setImportStatus);

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/contacts/template`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`下载失败: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
      setError(err instanceof Error ? err.message : '模板下载失败，请检查网络连接');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const { data: { session } } = await insforge.auth.getCurrentSession();
      const token = session?.accessToken;
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/contacts/import`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (response.ok) {
        const res = await response.json();
        setResult(res);
        setProgress(100);
        setImportStatus({ isImporting: false, total: res.total, processed: res.total });
        useContactStore.getState().fetchData();
      } else {
        // Try to parse JSON error first, fallback to text
        let errMsg = `导入失败 (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error || errBody.details || errMsg;
          // If server returned partial results with error, show them
          if (errBody.total !== undefined) {
            setResult(errBody);
          }
        } catch {
          const errText = await response.text();
          if (errText) errMsg = errText;
        }
        setError(errMsg);
        setImportStatus(null);
      }
    } catch (error) {
      console.error('Import error:', error);
      setError('导入出错，请检查网络或文件格式');
      setImportStatus(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isUploading) {
      setImportStatus({ isImporting: true, total: 0, processed: 0 });
    }
    setResult(null);
    setError(null);
    setProgress(0);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setError(null);
      setProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              批量导入关系资产
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1: Download Template */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">下载导入模板</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    请先下载 CSV 模板，按照格式填写关系资产信息。
                    <br />
                    支持：姓名、职位、公司、标签、互动记录等字段。
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <FileDown size={16} />
                    下载模板.csv
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Upload File */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">上传填写好的文件</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    上传填好的 CSV 文件，系统将自动识别并更新数据。
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        正在导入...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        选择文件并导入
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>正在导入...</span>
                  <span>数据较多，请稍候</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            )}

            {/* Results Display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-xl p-4 border ${
                    result.errors === result.total
                      ? 'bg-red-50 border-red-100'
                      : result.errors > 0
                        ? 'bg-yellow-50 border-yellow-100'
                        : 'bg-green-50 border-green-100'
                  }`}
                >
                  <div className={`flex items-center gap-2 font-semibold mb-2 ${
                    result.errors === result.total
                      ? 'text-red-700'
                      : result.errors > 0
                        ? 'text-yellow-700'
                        : 'text-green-700'
                  }`}>
                    {result.errors === result.total ? (
                      <><AlertCircle size={18} />导入全部失败</>
                    ) : result.errors > 0 ? (
                      <><AlertCircle size={18} />导入部分完成</>
                    ) : (
                      <><CheckCircle size={18} />导入完成</>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-800">
                    <div className="bg-white/50 px-2 py-1 rounded">总处理: {result.total}</div>
                    <div className="bg-white/50 px-2 py-1 rounded">新增: {result.created}</div>
                    <div className="bg-white/50 px-2 py-1 rounded">更新: {result.updated}</div>
                    <div className={`bg-white/50 px-2 py-1 rounded ${result.errors > 0 ? 'text-red-600 font-medium' : ''}`}>
                      错误: {result.errors}
                    </div>
                  </div>
                  {result.firstError && (
                    <p className="mt-2 text-xs text-red-600 bg-white/50 px-2 py-1 rounded">
                      错误详情: {result.firstError}
                    </p>
                  )}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-start gap-3 text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
