import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { X, Upload, Link, Plus, Trash2, Info, FileImage, Video, AlertCircle } from 'lucide-react';

interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: 'reps' | 'time' | 'distance';
  instructions?: string;
  isCustom: boolean;
  created_at: string;
  media?: {
    gif?: {
      type: 'file' | 'url';
      data: string;
      preview: string;
    };
    videos?: Array<{
      url: string;
      title: string;
    }>;
  };
}

interface CustomExerciseFormProps {
  exercise: CustomExercise | null;
  onSave: (exercise: CustomExercise) => void;
  onCancel: () => void;
}

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

const exerciseCategories = [
  { value: 'reps', label: 'For Reps', description: 'Exercises measured by repetitions (with or without weight)' },
  { value: 'time', label: 'For Time', description: 'Exercises measured by duration (planks, cardio intervals, etc.)' },
  { value: 'distance', label: 'For Distance', description: 'Exercises measured by distance (running, rowing, etc.)' }
];

export default function CustomExerciseForm({ exercise, onSave, onCancel }: CustomExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    muscleGroup: exercise?.muscleGroup || '',
    category: exercise?.category || 'reps',
    instructions: exercise?.instructions || ''
  });

  const [media, setMedia] = useState({
    gif: exercise?.media?.gif || null,
    videos: exercise?.media?.videos || [{ url: '', title: '' }]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gifSource, setGifSource] = useState<'file' | 'url'>('file');
  const [gifUrl, setGifUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disable body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px';
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
    }

    if (!formData.muscleGroup) {
      newErrors.muscleGroup = 'Muscle group is required';
    }

    if (!formData.category) {
      newErrors.category = 'Exercise category is required';
    }

    // Validate GIF URL if provided
    if (gifSource === 'url' && gifUrl && !gifUrl.toLowerCase().endsWith('.gif')) {
      newErrors.gifUrl = 'Please provide a valid GIF URL ending with .gif';
    }

    // Validate video URLs
    media.videos.forEach((video, index) => {
      if (video.url && !isValidVideoUrl(video.url)) {
        newErrors[`video_${index}`] = 'Please provide a valid video URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidVideoUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const validDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('gif')) {
      setErrors({ ...errors, gifFile: 'Please select a GIF file' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, gifFile: 'GIF file must be less than 10MB' });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string;
        setMedia({
          ...media,
          gif: {
            type: 'file',
            data: preview,
            preview
          }
        });
        setErrors({ ...errors, gifFile: '' });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors({ ...errors, gifFile: 'Failed to upload GIF' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGifUrlLoad = () => {
    if (!gifUrl || !gifUrl.toLowerCase().endsWith('.gif')) {
      setErrors({ ...errors, gifUrl: 'Please provide a valid GIF URL' });
      return;
    }

    setMedia({
      ...media,
      gif: {
        type: 'url',
        data: gifUrl,
        preview: gifUrl
      }
    });
    setErrors({ ...errors, gifUrl: '' });
  };

  const removeGif = () => {
    setMedia({ ...media, gif: null });
    setGifUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addVideoLink = () => {
    if (media.videos.length < 5) {
      setMedia({
        ...media,
        videos: [...media.videos, { url: '', title: '' }]
      });
    }
  };

  const removeVideoLink = (index: number) => {
    setMedia({
      ...media,
      videos: media.videos.filter((_, i) => i !== index)
    });
  };

  const updateVideoLink = (index: number, field: 'url' | 'title', value: string) => {
    const updatedVideos = media.videos.map((video, i) =>
      i === index ? { ...video, [field]: value } : video
    );
    setMedia({ ...media, videos: updatedVideos });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const exerciseData: CustomExercise = {
      id: exercise?.id || Date.now().toString(),
      name: formData.name.trim(),
      muscleGroup: formData.muscleGroup,
      category: formData.category as 'reps' | 'time' | 'distance',
      instructions: formData.instructions.trim() || undefined,
      isCustom: true,
      created_at: exercise?.created_at || new Date().toISOString(),
      media: {
        gif: media.gif || undefined,
        videos: media.videos.filter(v => v.url.trim()) || undefined
      }
    };

    onSave(exerciseData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-0">
      <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
        <Card className="w-full max-w-4xl h-[95vh] md:h-[90vh] flex flex-col border-2 border-pink-500/30">
          <CardHeader className="flex-shrink-0 pb-4 border-b border-pink-500/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-slate-50">
                {exercise ? 'Edit Custom Exercise' : 'Create Custom Exercise'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel} className="p-2">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Exercise Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter exercise name..."
                      error={errors.name}
                      className="bg-slate-800 border-slate-600 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Muscle Group *
                    </label>
                    <select
                      value={formData.muscleGroup}
                      onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                      className={`w-full h-10 p-2 bg-slate-800 border border-slate-600 focus:border-pink-500 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${
                        errors.muscleGroup ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select muscle group</option>
                      {muscleGroups.map(group => (
                        <option key={group} value={group} className="bg-slate-800">
                          {group}
                        </option>
                      ))}
                    </select>
                    {errors.muscleGroup && (
                      <p className="text-red-400 text-sm mt-1">{errors.muscleGroup}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Exercise Category *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {exerciseCategories.map(category => (
                      <div
                        key={category.value}
                        onClick={() => setFormData({ ...formData, category: category.value as any })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.category === category.value
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-medium text-slate-200">{category.label}</div>
                        <div className="text-sm text-slate-400 mt-1">{category.description}</div>
                      </div>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-red-400 text-sm mt-2">{errors.category}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Describe proper form and technique..."
                    rows={4}
                    className="w-full p-3 bg-slate-800 border border-slate-600 focus:border-pink-500 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
              </div>

              {/* Media Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Exercise Media
                  <Info className="h-4 w-4 text-slate-400" />
                </h3>

                {/* GIF Upload/URL Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Exercise Demonstration GIF
                  </label>
                  <p className="text-sm text-slate-400 mb-3">
                    Upload or link to a GIF showing proper form
                  </p>

                  <div className="flex gap-2 mb-3">
                    <Button
                      onClick={() => setGifSource('file')}
                      variant={gifSource === 'file' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload File
                    </Button>
                    <Button
                      onClick={() => setGifSource('url')}
                      variant={gifSource === 'url' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      GIF URL
                    </Button>
                  </div>

                  {gifSource === 'file' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        disabled={isUploading}
                        className="w-full md:w-auto"
                      >
                        <FileImage className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Choose GIF File'}
                      </Button>
                      <p className="text-xs text-slate-500 mt-1">Max file size: 10MB</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={gifUrl}
                        onChange={(e) => setGifUrl(e.target.value)}
                        placeholder="https://example.com/exercise.gif"
                        className="flex-1"
                      />
                      <Button onClick={handleGifUrlLoad} variant="outline">
                        Load
                      </Button>
                    </div>
                  )}

                  {errors.gifFile && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.gifFile}
                    </p>
                  )}

                  {errors.gifUrl && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.gifUrl}
                    </p>
                  )}

                  {/* GIF Preview */}
                  {media.gif && (
                    <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-200">GIF Preview</span>
                        <Button
                          onClick={removeGif}
                          variant="ghost"
                          size="sm"
                          className="text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={media.gif.preview}
                          alt="Exercise demonstration"
                          className="max-w-full max-h-48 rounded border border-slate-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Links Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Instructional Videos
                  </label>
                  <p className="text-sm text-slate-400 mb-3">
                    Add links to helpful tutorial videos (YouTube, Vimeo, etc.)
                  </p>

                  <div className="space-y-3">
                    {media.videos.map((video, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={video.url}
                            onChange={(e) => updateVideoLink(index, 'url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            error={errors[`video_${index}`]}
                          />
                          <Input
                            value={video.title}
                            onChange={(e) => updateVideoLink(index, 'title', e.target.value)}
                            placeholder="Video title (optional)"
                          />
                        </div>
                        {media.videos.length > 1 && (
                          <Button
                            onClick={() => removeVideoLink(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {media.videos.length < 5 && (
                    <Button
                      onClick={addVideoLink}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Video Link
                    </Button>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-slate-600">
                <Button onClick={handleSubmit} className="flex-1 bg-pink-500 hover:bg-pink-400">
                  {exercise ? 'Update Exercise' : 'Create Exercise'}
                </Button>
                <Button onClick={onCancel} variant="outline" className="flex-1 text-slate-200">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}