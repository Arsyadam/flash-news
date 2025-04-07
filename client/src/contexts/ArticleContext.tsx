import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ArticleState,
  DescriptionState,
  RecommendationsState,
  TemplateFrame,
  DEFAULT_TEMPLATE_FRAMES
} from '../lib/types';

// Define the context state structure
interface ArticleContextState {
  article: ArticleState;
  description: DescriptionState;
  recommendations: RecommendationsState;
  selectedTemplate: TemplateFrame;
  templates: TemplateFrame[];
}

// Define available actions
type ArticleAction =
  | { type: 'SET_ARTICLE_LOADING' }
  | { type: 'SET_ARTICLE_ERROR'; payload: string }
  | { type: 'SET_ARTICLE_DATA'; payload: Partial<ArticleState> }
  | { type: 'SET_DESCRIPTION_LOADING' }
  | { type: 'SET_DESCRIPTION_ERROR'; payload: string }
  | { type: 'SET_DESCRIPTION_CONTENT'; payload: string }
  | { type: 'SET_RECOMMENDATIONS_LOADING' }
  | { type: 'SET_RECOMMENDATIONS_ERROR'; payload: string }
  | { type: 'SET_RECOMMENDATIONS_DATA'; payload: RecommendationsState['items'] }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: TemplateFrame };

// Initial state
const initialState: ArticleContextState = {
  article: {
    url: '',
    title: '',
    author: '',
    source: '',
    imageUrl: null,
    content: '',
    isLoading: false,
    error: null,
  },
  description: {
    content: '',
    isLoading: false,
    error: null,
  },
  recommendations: {
    items: [],
    isLoading: false,
    error: null,
  },
  selectedTemplate: DEFAULT_TEMPLATE_FRAMES[0],
  templates: DEFAULT_TEMPLATE_FRAMES,
};

// Reducer function
const articleReducer = (state: ArticleContextState, action: ArticleAction): ArticleContextState => {
  switch (action.type) {
    case 'SET_ARTICLE_LOADING':
      return {
        ...state,
        article: { ...state.article, isLoading: true, error: null },
      };
    case 'SET_ARTICLE_ERROR':
      return {
        ...state,
        article: { ...state.article, isLoading: false, error: action.payload },
      };
    case 'SET_ARTICLE_DATA':
      return {
        ...state,
        article: { ...state.article, ...action.payload, isLoading: false, error: null },
      };
    case 'SET_DESCRIPTION_LOADING':
      return {
        ...state,
        description: { ...state.description, isLoading: true, error: null },
      };
    case 'SET_DESCRIPTION_ERROR':
      return {
        ...state,
        description: { ...state.description, isLoading: false, error: action.payload },
      };
    case 'SET_DESCRIPTION_CONTENT':
      return {
        ...state,
        description: { 
          ...state.description, 
          content: action.payload, 
          isLoading: false, 
          error: null 
        },
      };
    case 'SET_RECOMMENDATIONS_LOADING':
      return {
        ...state,
        recommendations: { ...state.recommendations, isLoading: true, error: null },
      };
    case 'SET_RECOMMENDATIONS_ERROR':
      return {
        ...state,
        recommendations: { 
          ...state.recommendations, 
          isLoading: false, 
          error: action.payload 
        },
      };
    case 'SET_RECOMMENDATIONS_DATA':
      return {
        ...state,
        recommendations: {
          items: action.payload,
          isLoading: false,
          error: null,
        },
      };
    case 'SET_SELECTED_TEMPLATE':
      return {
        ...state,
        selectedTemplate: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const ArticleContext = createContext<{
  state: ArticleContextState;
  dispatch: React.Dispatch<ArticleAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Create provider component
export const ArticleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(articleReducer, initialState);

  return (
    <ArticleContext.Provider value={{ state, dispatch }}>
      {children}
    </ArticleContext.Provider>
  );
};

// Custom hook to use the article context
export const useArticleContext = () => {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error('useArticleContext must be used within an ArticleProvider');
  }
  return context;
};
