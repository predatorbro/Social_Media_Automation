import { useState } from "react";
import { Instagram, Twitter, Linkedin, Facebook, User, Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlatformPreviewProps {
  content: string;
  platform: string;
  hashtags?: string[];
}

const PlatformPreview = ({ content, platform, hashtags = [] }: PlatformPreviewProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState(platform);

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "instagram" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "twitter" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "linkedin" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "facebook" },
  ];

  const renderInstagramPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">your_brand</p>
            <p className="text-xs text-gray-500">Sponsored</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
        <Instagram className="w-12 h-12 text-gray-400" />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <Share className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
        <p className="text-sm text-gray-900 dark:text-white mb-1">
          <span className="font-semibold">your_brand</span> {content}
        </p>
        {hashtags.length > 0 && (
          <p className="text-sm text-blue-500">
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}
      </div>
    </div>
  );

  const renderTwitterPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 max-w-lg mx-auto p-4">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 dark:text-white">Your Brand</h3>
            <span className="text-gray-500">@yourbrand</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">2h</span>
          </div>
          <p className="mt-2 text-gray-900 dark:text-white">
            {content}
          </p>
          {hashtags.length > 0 && (
            <p className="mt-2 text-blue-500">
              {hashtags.map(tag => `#${tag}`).join(' ')}
            </p>
          )}
          <div className="flex items-center justify-between mt-4 max-w-md">
            <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">24</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 hover:text-green-500 cursor-pointer">
              <Share className="w-4 h-4" />
              <span className="text-sm">12</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 hover:text-red-500 cursor-pointer">
              <Heart className="w-4 h-4" />
              <span className="text-sm">89</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinkedInPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 max-w-lg mx-auto">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Professional Brand</h3>
            <p className="text-sm text-gray-500">CEO at Your Company • 1st</p>
            <p className="text-xs text-gray-400">2 hours ago</p>
          </div>
        </div>
        <p className="text-gray-900 dark:text-white mb-3">
          {content}
        </p>
        {hashtags.length > 0 && (
          <p className="text-blue-600 mb-3">
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}
      </div>
      <div className="border-t dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Like</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
            <Share className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacebookPreview = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg mx-auto">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Brand Page</h3>
            <p className="text-xs text-gray-500">2 hours ago • 🌍</p>
          </div>
        </div>
        <p className="text-gray-900 dark:text-white mb-3">
          {content}
        </p>
        {hashtags.length > 0 && (
          <p className="text-blue-600 mb-3">
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        )}
      </div>
      <div className="border-t dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Like</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </div>
          <div className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
            <Share className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (selectedPlatform) {
      case "instagram":
        return renderInstagramPreview();
      case "twitter":
        return renderTwitterPreview();
      case "linkedin":
        return renderLinkedInPreview();
      case "facebook":
        return renderFacebookPreview();
      default:
        return renderInstagramPreview();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Platform Selector */}
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <Button
                  key={p.id}
                  variant={selectedPlatform === p.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center space-x-2 ${
                    selectedPlatform === p.id ? `${p.color}-accent` : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{p.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            {renderPreview()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformPreview;