import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, X, Sparkles, FileUp } from 'lucide-react';
import { Skeleton } from '../components/ui';

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExistingResume();
  }, []);

  const loadExistingResume = async () => {
    try {
      const res = await resumeAPI.get();
      setExistingResume(res.data);
    } catch (err) {
      // No resume uploaded yet - that's fine
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    try {
      const res = await resumeAPI.upload(file);
      setUploadResult(res.data);
      setExistingResume(res.data);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  const displayData = uploadResult || existingResume;

  if (loading) {
    return <Skeleton.ResumePage />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Resume Upload</h1>
        <p className="text-text-secondary mt-1">Upload your resume to extract skills and content</p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-all duration-300 group ${
          isDragActive
            ? 'border-brand-primary bg-brand-primary/5 shadow-glow-primary'
            : 'border-dark-border-light bg-dark-card hover:border-brand-accent hover:shadow-glow-accent'
        }`}
      >
        {/* Glow overlay on hover */}
        <div className="absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 30px rgba(124, 58, 237, 0.06)' }}
        />

        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            <p className="text-brand-primary font-medium">Processing your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={`p-4 rounded-full transition-colors duration-300 ${
              isDragActive ? 'bg-brand-primary/10' : 'bg-dark-bg group-hover:bg-brand-accent/10'
            }`}>
              <Upload className={`transition-colors duration-300 ${
                isDragActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-brand-accent-light'
              }`} size={48} />
            </div>
            {isDragActive ? (
              <p className="text-brand-primary font-medium">Drop your resume here</p>
            ) : (
              <>
                <p className="text-text-primary font-medium">Drag & drop your resume here</p>
                <p className="text-text-secondary text-sm">or click to browse files</p>
                <p className="text-text-muted text-xs">Supports PDF, DOC, DOCX (max 10MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upload Status – Emerald Green */}
      {uploadResult && (
        <div className="bg-status-success-bg border border-status-success/30 rounded-card p-4 flex items-center gap-3 shadow-glow-success animate-fade-in">
          <CheckCircle className="text-status-success shrink-0" size={20} />
          <div>
            <p className="text-status-success font-medium">Upload Successful</p>
            <p className="text-status-success/80 text-sm">
              {uploadResult.fileName} • {(uploadResult.fileSize / 1024).toFixed(1)} KB • {uploadResult.wordCount} words extracted
            </p>
          </div>
        </div>
      )}

      {/* Skills Preview */}
      {displayData?.skills?.length > 0 && (
        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-6 ds-card-shine">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-accent-light" />
            Extracted Skills ({displayData.skills.length})
          </h3>
          <div className="flex flex-wrap gap-2 ds-stagger">
            {displayData.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary-light rounded-full text-sm font-medium border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {displayData?.resumeText && (
        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FileText size={18} className="text-text-secondary" />
            Extracted Content
            {displayData.fileName && (
              <span className="text-sm font-normal text-text-muted">({displayData.fileName})</span>
            )}
          </h3>
          <div className="bg-dark-bg rounded-card p-4 max-h-96 overflow-y-auto border border-dark-border">
            <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
              {displayData.resumeText}
            </pre>
          </div>
        </div>
      )}

      {/* No resume state */}
      {!displayData && !uploading && (
        <div className="bg-dark-card rounded-card border border-dark-border shadow-card p-12 text-center">
          <FileText className="mx-auto text-text-muted mb-4 ds-empty-icon" size={48} />
          <p className="text-text-primary font-medium">No resume uploaded yet</p>
          <p className="text-text-muted text-sm mt-1">Upload your resume to see extracted skills and content.</p>
        </div>
      )}
    </div>
  );
}
