
import React from 'react';

interface PhotoUploaderProps {
  onUpload: (base64: string, url: string) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64 = result.split(',')[1];
      onUpload(base64, result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-zinc-700 rounded-3xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors group">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <i className="fa-solid fa-camera-retro text-2xl text-zinc-400"></i>
      </div>
      <h3 className="text-xl font-semibold mb-2">Upload your photo</h3>
      <p className="text-zinc-500 text-sm text-center mb-8 max-w-xs">
        Import a photo and let Visionary AI analyze it for professional-grade improvements.
      </p>
      <label className="cursor-pointer bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors">
        Browse Files
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleChange} 
        />
      </label>
    </div>
  );
};

export default PhotoUploader;
