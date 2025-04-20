import React, { useState } from 'react';
import { Upload, X, Stethoscope, Building, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DoctorVerificationFormProps {
  userId: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export function DoctorVerificationForm({ userId, onClose, onSubmit }: DoctorVerificationFormProps) {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `doctor-licenses/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('verifications')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(filePath);

      setDocumentUrl(publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Validate inputs
      if (!licenseNumber.trim()) throw new Error('License number is required');
      if (!specialization.trim()) throw new Error('Specialization is required');
      if (!documentUrl) throw new Error('License document is required');

      // Submit verification request
      const { error: submitError } = await supabase
        .from('doctor_verification_requests')
        .insert([{
          doctor_id: userId,
          license_number: licenseNumber,
          license_document_url: documentUrl,
          specialization,
          hospital_name: hospitalName,
          status: 'pending'
        }]);

      if (submitError) throw submitError;

      // Update profile verification status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending'
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      onSubmit?.();
      onClose();
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit verification request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Doctor Verification
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Submit your credentials for verification
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                License Number
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-slate-200 bg-white/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500"
                  placeholder="Enter your medical license number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Specialization
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-slate-200 bg-white/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500"
                  placeholder="Enter your medical specialization"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hospital/Clinic (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-slate-200 bg-white/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500"
                  placeholder="Enter your hospital or clinic name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                License Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, PNG, JPG up to 10MB
                  </p>
                  {documentUrl && (
                    <p className="text-xs text-green-600">
                      ✓ Document uploaded successfully
                    </p>
                  )}
                  {isUploading && (
                    <p className="text-xs text-slate-500">
                      Uploading...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}