import { useState, useCallback } from "react";
import { getCroppedImage } from "@/utils/image-cropping"; // Assuming this is the correct path
import {
  calculateImageHash,
  findExactDuplicatesInBatch,
  analyzeSingleImage,
  findVisuallySimilarInBatch,
} from "@/services/rekognitionService";

// Default dimension for cropped images for analysis
const CROP_DIMENSION_ANALYSIS = 1024; // Or use a constant from your ImageUploader

export const useImageAnalysis = () => {
  const [analysisState, setAnalysisState] = useState("idle"); // idle, preparing, hashing, rekognition, completed, error
  const [analysisResults, setAnalysisResults] = useState({}); // { [originalIndex]: { id, fileName, hashAnalysis, rekognitionIndividual, rekognitionBatch, error, status } }
  const [exactDuplicateGroups, setExactDuplicateGroups] = useState([]);
  const [visuallySimilarGroups, setVisuallySimilarGroups] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);

  const resetAnalysis = useCallback(() => {
    setAnalysisState("idle");
    setAnalysisResults({});
    setExactDuplicateGroups([]);
    setVisuallySimilarGroups([]);
    setAnalysisError(null);
  }, []);

  const updateImageAnalysisResult = useCallback((index, resultUpdate) => {
    setAnalysisResults((prevResults) => ({
      ...prevResults,
      [index]: {
        ...(prevResults[index] || {}),
        ...resultUpdate,
      },
    }));
  }, []);

  async function getCroppedImageBytes(filePreview, cropData) {
    try {
      const blob = await getCroppedImage(
        filePreview,
        cropData,
        CROP_DIMENSION_ANALYSIS
      );
      if (!blob) {
        throw new Error("Cropping failed to produce a blob.");
      }
      return new Uint8Array(await blob.arrayBuffer());
    } catch (error) {
      console.error("Error in getCroppedImageBytes:", error);
      throw error;
    }
  }

  const startImageAnalysis = useCallback(
    async (filesToProcess, allCompletedCrops) => {
      resetAnalysis();
      setAnalysisState("preparing");
      let overallErrorAccumulator = [];

      const preparedImages = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const fileData = filesToProcess[i];
        updateImageAnalysisResult(i, {
          fileName: fileData.file.name,
          originalIndex: i,
        });

        if (!fileData.accepted || fileData.error || !fileData.preview) {
          updateImageAnalysisResult(i, {
            error: "Skipped: Not accepted or no preview.",
            status: "skipped",
          });
          continue;
        }
        const crop = allCompletedCrops[i] || fileData.initialCrop;
        if (!crop) {
          updateImageAnalysisResult(i, {
            error: "Missing crop data for analysis.",
            status: "skipped_no_crop",
          });
          continue;
        }
        try {
          const imageBytes = await getCroppedImageBytes(fileData.preview, crop);
          preparedImages.push({
            id: `${fileData.file.name}_${i}`,
            originalIndex: i,
            bytes: imageBytes,
            dimensions: {
              width: CROP_DIMENSION_ANALYSIS,
              height: CROP_DIMENSION_ANALYSIS,
            },
            fileName: fileData.file.name,
          });
          updateImageAnalysisResult(i, { status: "prepared" });
        } catch (error) {
          console.error(
            `Error preparing image ${i} (${fileData.file.name}):`,
            error
          );
          updateImageAnalysisResult(i, {
            error: `Failed to prepare for analysis: ${error.message}`,
            status: "error_preparation",
          });
          overallErrorAccumulator.push(
            `Preparation error for ${fileData.file.name}: ${error.message}`
          );
        }
      }

      if (preparedImages.length === 0) {
        setAnalysisError("No valid images could be prepared for analysis.");
        setAnalysisState("error");
        return;
      }

      // Hashing
      setAnalysisState("hashing");
      try {
        const imageHashInputs = preparedImages.map((img) => ({
          id: img.id,
          bytes: img.bytes,
        }));
        const duplicateGroupsMap = await findExactDuplicatesInBatch(
          imageHashInputs
        );
        const duplicateGroups = Array.from(duplicateGroupsMap.values());
        setExactDuplicateGroups(duplicateGroups);

        duplicateGroupsMap.forEach((ids, hashKey) => {
          ids.forEach((imageId) => {
            const img = preparedImages.find((pImg) => pImg.id === imageId);
            if (img) {
              updateImageAnalysisResult(img.originalIndex, {
                hashAnalysis: { isExactDuplicate: true, groupKey: hashKey },
                status: "analyzed_hash",
              });
            }
          });
        });
        // Mark non-duplicates explicitly if needed
        preparedImages.forEach((pImg) => {
          if (!analysisResults[pImg.originalIndex]?.hashAnalysis) {
            updateImageAnalysisResult(pImg.originalIndex, {
              status: "analyzed_hash_no_duplicates",
            });
          }
        });
      } catch (error) {
        console.error("Hashing analysis failed:", error);
        overallErrorAccumulator.push(
          `Hashing analysis failed: ${error.message}`
        );
        // Mark all prepared images as having a hash error if the service fails globally
        preparedImages.forEach((pImg) =>
          updateImageAnalysisResult(pImg.originalIndex, {
            status: "error_hash",
            error: "Hashing service failed",
          })
        );
      }

      // Rekognition
      setAnalysisState("rekognition");
      const imagesForRekognition = preparedImages.filter((img) => {
        const currentResult = analysisResults[img.originalIndex];
        return (
          img.bytes &&
          img.bytes.length > 0 &&
          currentResult?.status !== "error_preparation" &&
          currentResult?.status !== "skipped_no_crop"
        );
        // Optionally, filter out exact duplicates if you don't want to run Rekognition on them:
        // && !currentResult?.hashAnalysis?.isExactDuplicate;
      });

      const individualAnalysisPromises = imagesForRekognition.map(
        async (image) => {
          try {
            const singleAnalysisResult = await analyzeSingleImage(
              image.bytes,
              image.dimensions
            );
            updateImageAnalysisResult(image.originalIndex, {
              rekognitionIndividual: singleAnalysisResult,
              status: singleAnalysisResult.error
                ? "error_rekognition_individual"
                : "analyzed_individual",
            });
            if (singleAnalysisResult.error) {
              overallErrorAccumulator.push(
                `Rekognition error for ${image.fileName}: ${singleAnalysisResult.error}`
              );
            }
          } catch (error) {
            // Should be caught by analyzeSingleImage returning an error object
            updateImageAnalysisResult(image.originalIndex, {
              rekognitionIndividual: {
                error: `Analysis exception: ${error.message}`,
                status: "error",
              },
              status: "error_rekognition_individual",
            });
            overallErrorAccumulator.push(
              `Unhandled Rekognition exception for ${image.fileName}: ${error.message}`
            );
          }
        }
      );
      await Promise.all(individualAnalysisPromises);

      if (imagesForRekognition.length >= 2) {
        try {
          const batchSimilarityInputs = imagesForRekognition.map((img) => ({
            id: img.id,
            bytes: img.bytes,
          }));
          const similarResult = await findVisuallySimilarInBatch(
            batchSimilarityInputs
          );
          if (similarResult.status === "success") {
            setVisuallySimilarGroups(similarResult.similarGroups);
            similarResult.similarGroups.forEach((group) => {
              group.ids.forEach((imageId) => {
                const img = preparedImages.find((pImg) => pImg.id === imageId);
                if (img) {
                  updateImageAnalysisResult(img.originalIndex, {
                    rekognitionBatch: {
                      isVisuallySimilar: true,
                      groupIds: group.ids,
                    },
                    status: "analyzed_batch_similar", // Overwrites individual status if it was success
                  });
                }
              });
            });
          } else if (similarResult.error) {
            overallErrorAccumulator.push(
              `Visual similarity analysis failed: ${similarResult.error}`
            );
          }
        } catch (error) {
          overallErrorAccumulator.push(
            `Visual similarity system error: ${error.message}`
          );
        }
      }

      if (overallErrorAccumulator.length > 0) {
        setAnalysisError(overallErrorAccumulator.join("; "));
        setAnalysisState("error");
      } else {
        setAnalysisState("completed");
      }
    },
    [resetAnalysis, updateImageAnalysisResult, analysisResults]
  ); // Added analysisResults to deps of startImageAnalysis

  return {
    analysisState,
    analysisResults,
    exactDuplicateGroups,
    visuallySimilarGroups,
    analysisError,
    startImageAnalysis,
    resetAnalysis,
  };
};
