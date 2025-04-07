import { useState, useEffect } from "react";
import { useArticleContext } from "../contexts/ArticleContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Default prompt template for AI description
const DEFAULT_PROMPT =
  'Buatkan deskripsi berita untuk program Systemetic berdasarkan judul "{title}", disampaikan oleh {author}, dan bersumber dari {source}, dengan gaya penulisan yang khas: informatif, padat, dan terstruktur; ikuti alur berikut — pembuka dengan unsur 5W1H, penjabaran tindakan atau rencana yang dilakukan {author}, penjelasan tujuan atau dampak kebijakan, kutipan langsung dari {author} jika tersedia, rincian isi kebijakan atau solusi yang diusulkan, serta penutup berupa strategi lanjutan atau arah kebijakan ke depan.';

export function useAIDescription() {
  const { state, dispatch } = useArticleContext();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Load saved prompt from localStorage on component mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem("customAIPrompt");
    if (savedPrompt) {
      setCustomPrompt(savedPrompt);
    }
  }, []);

  const updateDescription = (content: string) => {
    dispatch({
      type: "SET_DESCRIPTION_CONTENT",
      payload: content,
    });
  };

  // Save custom prompt settings
  const updatePromptSettings = (prompt: string) => {
    setCustomPrompt(prompt);
    localStorage.setItem("customAIPrompt", prompt);

    // Regenerate with new prompt if article is already extracted
    if (state.article.title) {
      regenerateWithPrompt(prompt);
    }
  };

  // Helper function to process prompt template with article data
  const processPromptTemplate = (
    promptTemplate: string,
    articleData: { title: string; author: string; source: string },
  ) => {
    let processedPrompt = promptTemplate;

    // Replace placeholders with actual values
    processedPrompt = processedPrompt.replace(
      /{title}/g,
      articleData.title || "",
    );
    processedPrompt = processedPrompt.replace(
      /{author}/g,
      articleData.author || "Unknown Author",
    );
    processedPrompt = processedPrompt.replace(
      /{source}/g,
      articleData.source || "Unknown Source",
    );

    return processedPrompt;
  };

  // Regenerate description with specific prompt
  const regenerateWithPrompt = async (promptTemplate: string) => {
    const { title, author, source } = state.article;

    if (!title) {
      toast({
        title: "Error",
        description: "Please extract an article first",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);
    dispatch({ type: "SET_DESCRIPTION_LOADING" });

    try {
      // Process the prompt template
      const processedPrompt = processPromptTemplate(promptTemplate, {
        title,
        author,
        source,
      });

      const response = await apiRequest(
        "POST",
        "/api/ai/generate-description",
        {
          title,
          author,
          source,
          regenerate: true,
          customPrompt: processedPrompt,
        },
      );
      const data = await response.json();

      dispatch({
        type: "SET_DESCRIPTION_CONTENT",
        payload: data.content,
      });

      toast({
        title: "Success",
        description: "Description regenerated with custom prompt",
      });
    } catch (error) {
      console.error("Error regenerating description:", error);

      dispatch({
        type: "SET_DESCRIPTION_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to regenerate description",
      });

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to regenerate description",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Standard regenerate function using either custom or default prompt
  const regenerateDescription = async () => {
    const promptToUse = customPrompt || DEFAULT_PROMPT;
    regenerateWithPrompt(promptToUse);
  };

  return {
    description: state.description,
    updateDescription,
    regenerateDescription,
    isRegenerating,
    updatePromptSettings,
    currentPrompt: customPrompt || DEFAULT_PROMPT,
  };
}
