import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { WandSparkles, RotateCcw, Sparkles, Download, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useAccountContext } from '@/context/AccountContext';
import { fetchUserCredits, hasSufficientBalanceCredits, getBalanceCredits } from '@/services/creditService';

const AIEditor = ({ 
  studioStatus, 
  headshot,
  studioId,
  className = "flex-1 p-2",
  size = "sm",
  variant = "secondary"
}) => {
  const { userId, profile } = useAccountContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [editHistory, setEditHistory] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  const CREDITS_COST = 50;

  // Load user credits when modal opens
  useEffect(() => {
    const loadUserCredits = async () => {
      if (!isModalOpen || !userId) return;
      
      setIsLoadingCredits(true);
      try {
        const credits = await fetchUserCredits(userId);
        setUserCredits(credits);
      } catch (error) {
        console.error('Failed to load user credits:', error);
        toast.error('Failed to load credit information');
        setUserCredits(null);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    loadUserCredits();
  }, [isModalOpen, userId]);

  const handleEditClick = () => {
    if (studioStatus === 'COMPLETED') {
      toast.error('Remove watermarks to access the AI editor.');
      return;
    }
    
    if (studioStatus === 'ACCEPTED') {
      // Initialize image URLs when opening modal
      const imageUrl = headshot?.result || headshot?.hd || headshot?.preview;
      setOriginalImageUrl(imageUrl);
      setCurrentImageUrl(imageUrl);
      setEditHistory([]);
      setIsImageLoading(true);
      setIsModalOpen(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // Check if user has sufficient credits
    if (!hasSufficientBalanceCredits(userCredits, CREDITS_COST)) {
      toast.error(`Insufficient credits. You need ${CREDITS_COST} credits to edit an image.`);
      return;
    }

    setIsGenerating(true);
    try {
      // Call API route instead of server action
      const response = await fetch('/api/ai-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrls: [currentImageUrl],
          numImages: 1,
          studioId: studioId,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.images && result.images.length > 0) {
        // The edited image is now saved in the database with presigned URL
        const presignedUrl = result.images[0].url;
        
        // Store current image in history before updating
        setEditHistory(prev => [...prev, currentImageUrl]);
        
        // Update current image to the AI-generated one (use presigned URL)
        setCurrentImageUrl(presignedUrl);
        
        // Update user credits
        if (userCredits) {
          setUserCredits(prev => ({
            ...prev,
            balance: result.remainingCredits
          }));
        }
        
        // Clear the prompt
        setPrompt('');
        
        toast.success(`Image edited successfully! ${CREDITS_COST} credits used. ${result.remainingCredits} credits remaining.`);
      } else if (result.insufficientCredits) {
        toast.error(`Insufficient credits. You have ${result.currentCredits} credits but need ${result.requiredCredits}.`);
      } else {
        throw new Error(result.error || 'No edited image received');
      }
    } catch (error) {
      console.error('AI Edit Error:', error);
      toast.error('Failed to edit image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    if (editHistory.length > 0 || currentImageUrl !== originalImageUrl) {
      // Reset to original image
      setCurrentImageUrl(originalImageUrl);
      setEditHistory([]);
      setPrompt('');
      toast.success('Image reset to original');
    } else {
      // Just clear prompt if no edits made
      setPrompt('');
      toast.info('Prompt cleared');
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    toast.error('Failed to load image');
  };

  // Use current image URL or fallback to original
  const displayImageUrl = currentImageUrl || headshot?.result || headshot?.hd || headshot?.preview;

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={className}
        onClick={handleEditClick}
        aria-label="Edit image with AI"
      >
        <WandSparkles className="h-4 w-4 text-destructive" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[95vh] p-4 sm:p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>AI Image Editor</DialogTitle>
            <DialogDescription>Edit your headshot using AI-powered tools</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full max-h-[calc(95vh-2rem)] overflow-hidden">
            {/* Image Preview Section */}
            <div className="flex items-center justify-center min-h-0 lg:min-h-full">
              {displayImageUrl ? (
                <div className="relative w-full max-w-sm sm:max-w-md aspect-square group flex-shrink-0">
                  {/* Loading overlay */}
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-slate-800/50 rounded-xl flex items-center justify-center z-10">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                  
                  <Image
                    src={displayImageUrl}
                    alt="Headshot for editing"
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={true}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              ) : (
                <div className="w-full max-w-md aspect-square bg-slate-700/50 rounded-xl flex items-center justify-center">
                  <p className="text-slate-400">No image available</p>
                </div>
              )}
            </div>

            {/* AI Controls Section */}
            <div className="flex flex-col min-h-0 overflow-hidden">
              <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {/* Glassmorphism Prompt Input */}
                <div className="relative">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to edit this image..."
                    className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/30 transition-all duration-200 pr-24"
                    disabled={isGenerating}
                  />
                  
                  {/* Reset Button Inside Input */}
                  <Button
                    onClick={handleReset}
                    disabled={isGenerating || (!prompt && editHistory.length === 0)}
                    className="absolute right-2 top-2 h-10 w-10 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-200"
                    variant="ghost"
                    aria-label={editHistory.length > 0 ? "Reset to original image" : "Clear prompt"}
                  >
                    <RotateCcw className="h-4 w-4 text-white/80" />
                  </Button>
                </div>

                {/* Credit Info */}
                {!isLoadingCredits && (userCredits !== null) && (
                  <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                    <span className="text-sm text-white/70">Balance Credits:</span>
                    <span className="text-sm font-semibold text-white">{getBalanceCredits(userCredits)}</span>
                  </div>
                )}

                {/* Generate Button or Buy Credits */}
                {!isLoadingCredits && (userCredits !== null) && hasSufficientBalanceCredits(userCredits, CREDITS_COST) ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full h-14 bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-600/90 hover:to-pink-600/90 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate with AI ({CREDITS_COST} credits)
                      </>
                    )}
                  </Button>
                ) : !isLoadingCredits && (userCredits !== null) ? (
                  <Link href="/buy" className="w-full">
                    <Button
                      className="w-full h-14 bg-gradient-to-r from-orange-500/80 to-red-500/80 hover:from-orange-600/90 hover:to-red-600/90 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold transition-all duration-200"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Buy Credits ({CREDITS_COST} needed)
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="w-full h-14 bg-gradient-to-r from-slate-500/80 to-slate-600/80 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold transition-all duration-200 opacity-50"
                  >
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading Credits...
                  </Button>
                )}

                {/* Example Prompts */}
                <div className="mt-4 sm:mt-6 flex-shrink-0">
                  <p className="text-sm text-white/70 mb-3">Example prompts:</p>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {[
                      "change background to a plain solid grey color",
                      "remove the glasses",
                      "change outfit to a burgundy knit sweater",
                      "change the hair color to brown",
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(example)}
                        disabled={isGenerating}
                        className="text-left p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-white/80 hover:text-white transition-all duration-200 disabled:opacity-50"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIEditor;
