import Navigation from '@/components/layout/Navigation';
import ContentManager from '@/components/content/ContentManager';

const Library = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Content Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage and organize all your social media content
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ContentManager />
        </div>
      </div>
    </div>
  );
};

export default Library;