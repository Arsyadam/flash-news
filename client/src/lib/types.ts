// Instagram Template
export interface TemplateFrame {
  id: string;
  name: string;
  imageUrl: string;
  overlayUrl?: string; // URL for an overlay template image (PNG with transparency)
}

// Article data
export interface ArticleState {
  url: string;
  title: string;
  author: string;
  source: string;
  imageUrl: string | null;
  content: string;
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
    name: "Default Red Frame",
    imageUrl: "https://images.unsplash.com/photo-1492551557933-34265f7af79e?q=80&w=1740&auto=format&fit=crop",
    overlayUrl: "https://res.cloudinary.com/daqsjyrgg/image/upload/v1690236221/red-frame-overlay_jbf8vn.png",
  },
  {
    id: "tech",
    name: "Tech Blue Frame",
    imageUrl: "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=1470&auto=format&fit=crop",
    overlayUrl: "https://res.cloudinary.com/daqsjyrgg/image/upload/v1690236221/blue-tech-overlay_xzdtvt.png",
  },
  {
    id: "minimal",
    name: "Minimal Black Frame",
    imageUrl: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=1447&auto=format&fit=crop",
    overlayUrl: "https://res.cloudinary.com/daqsjyrgg/image/upload/v1690236221/minimal-frame_qbozw9.png",
  },
  {
    id: "no-overlay",
    name: "No Frame Overlay",
    imageUrl: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1470&auto=format&fit=crop",
  }
];
