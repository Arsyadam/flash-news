// Instagram Template
export interface TemplateFrame {
  id: string;
  name: string;
  imageUrl: string;
}

// Article data
export interface ArticleState {
  url: string;
  title: string;
  author: string;
  source: string;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// AI Description
export interface DescriptionState {
  content: string;
  isLoading: boolean;
  error: string | null;
}

// News Recommendation
export interface Recommendation {
  id: string;
  title: string;
  source: string;
  url: string;
  imageUrl: string;
}

export interface RecommendationsState {
  items: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

// Default template frames
export const DEFAULT_TEMPLATE_FRAMES: TemplateFrame[] = [
  {
    id: "default",
    name: "Default Red",
    imageUrl: "https://images.unsplash.com/photo-1492551557933-34265f7af79e?q=80&w=1740&auto=format&fit=crop",
  },
  {
    id: "tech",
    name: "Tech Blue",
    imageUrl: "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: "minimal",
    name: "Minimal Black",
    imageUrl: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=1447&auto=format&fit=crop",
  },
];
