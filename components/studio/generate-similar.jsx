import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAccountContext } from '@/context/AccountContext';
import { fetchUserCredits, hasSufficientBalanceCredits, getBalanceCredits } from '@/services/creditService';
import { generateSimilarImageAction } from '@/app/(dashboard)/actions/studio/aiActions';

const GenerateSimilar = ({ 
  studioStatus, 
  headshot,
  studioId,
  className = "flex-1 p-2",
  size = "sm",
  variant = "secondary"
}) => {
  const { userId, profile } = useAccountContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  const CREDITS_COST = 500;

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

  const handleGenerateSimilarClick = () => {
    if (studioStatus === 'COMPLETED') {
      toast.error('Remove watermarks to generate similar images.');
      return;
    }
    
    if (studioStatus !== 'ACCEPTED') {
      toast.info('Feature available only for accepted studios.');
      return;
    }

    if (!userId) {
      toast.error('Please log in to generate similar images.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleGenerate = async () => {
    if (!headshot?.id || !studioId) {
      toast.error('Missing required information');
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('headshotId', headshot.id);
      formData.append('studioId', studioId);

      const result = await generateSimilarImageAction(formData);
      
      if (result.success) {
        toast.success(result.message);
        setIsModalOpen(false);
        
        // Refresh credits after successful generation
        if (userId) {
          const updatedCredits = await fetchUserCredits(userId);
          setUserCredits(updatedCredits);
        }
      } else if (result.insufficientCredits) {
        toast.error(`Insufficient credits. You have ${result.currentCredits} credits but need ${result.requiredCredits}.`);
      } else {
        toast.error(result.error || 'Failed to generate similar images');
      }
    } catch (error) {
      console.error('Generate similar error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={className}
        onClick={handleGenerateSimilarClick}
        aria-label="Generate similar image"
      >
        <Sparkles className="h-4 w-4 text-success" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate 4 Similar Headshots
            </DialogTitle>
            <DialogDescription>
              Generate new 4 headshots in similar style to this headshot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Credit Info */}
            {!isLoadingCredits && (userCredits !== null) && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Available Credits:</span>
                <span className="text-sm font-semibold">{getBalanceCredits(userCredits)}</span>
              </div>
            )}

            {/* Cost Info */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">4 Headshots Cost:</span>
                <span className="text-sm font-bold text-primary">{CREDITS_COST} credits</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <p>
                  The process will start in background. You can refresh this page after a minute or two.
                </p>
              </div>
            </div>

            {/* Generate Button or Buy Credits */}
            {!isLoadingCredits && (userCredits !== null) && hasSufficientBalanceCredits(userCredits, CREDITS_COST) ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Similar Headshots
                  </>
                )}
              </Button>
            ) : !isLoadingCredits && (userCredits !== null) ? (
              <Link href="/buy" className="w-full">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Buy Credits ({CREDITS_COST} needed)
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="w-full h-12"
              >
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading...
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateSimilar;
