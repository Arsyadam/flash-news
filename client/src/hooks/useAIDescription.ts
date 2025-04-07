import { useState, useEffect } from "react";
import { useArticleContext } from "../contexts/ArticleContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Default prompt template for AI description
const DEFAULT_PROMPT = `Buatkan deskripsi berita berdasarkan informasi berikut:
Judul: {title}
Penulis / Narasumber: {author}
Sumber Berita: {source}
Konten artikelnya adalah: {content}

Gunakan struktur narasi yang informatif dan ringkas seperti gaya Narasi Daily. Sertakan kutipan langsung dari narasumber jika tersedia.

Struktur deskripsi yang harus diikuti:

1. Lead / Pembuka Berita:
   Ringkasan peristiwa utama berdasarkan judul. Jawab unsur 5W1H sebisa mungkin.

2. Tindakan atau Rencana yang Diambil:
   Jelaskan langkah konkret yang disampaikan atau dilakukan oleh narasumber.

3. Tujuan atau Dampak:
   Uraikan alasan atau dampak dari langkah tersebut bagi publik atau stakeholder tertentu.

4. Kutipan Langsung (Opsional):
   Tambahkan kutipan dari narasumber untuk menguatkan narasi.

5. Rincian Strategi atau Isi Keputusan:
   Jelaskan solusi, kebijakan, atau rencana lanjutan yang disebutkan.

6. Penutup / Strategi Jangka Panjang:
   Akhiri dengan strategi tambahan, kesimpulan, atau harapan dari narasumber.

Sampaikan dalam minimal 4 paragraf. Gaya bahasa harus formal, padat, dan mudah dicerna pembaca awam. Cantumkan sumber berita di akhir artikel.

PENTING:
- Struktur paragraf harus rapi dan mudah dibaca
- Pastikan deskripsi kompatibel untuk dibagikan di website berita teknologi
- Hindari pengulangan informasi yang sama
- Jangan menyebutkan bahwa kamu AI atau menulis kata "ringkasan"
- Jangan menambahkan konten yang tidak ada di artikel asli`;

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
    articleData: { title: string; author: string; source: string; content?: string },
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
    
    // Add content if available
    if (articleData.content && promptTemplate.includes("{content}")) {
      processedPrompt = processedPrompt.replace(
        /{content}/g,
        articleData.content || "",
      );
    }

    return processedPrompt;
  };

  // Regenerate description with specific prompt
  const regenerateWithPrompt = async (promptTemplate: string) => {
    const { title, author, source, content } = state.article;

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
        content,
      });

      const response = await apiRequest(
        "POST",
        "/api/ai/generate-description",
        {
          title,
          author,
          source,
          content,
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
